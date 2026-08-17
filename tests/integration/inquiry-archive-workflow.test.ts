import { expect, test } from "bun:test";
import { handlePortalRequest } from "../../server/api/portal";
import type { PortalEnv } from "../../server/types";

const CLOSED_INQUIRY = {
  id: "inq-closed",
  inquiry_no: "INQ-CLOSED-1",
  customer_id: "CUS-002",
  vehicle_id: "V-001",
  quantity: 2,
  status: "Closed",
  deleted_at: null,
};

const QUOTE = {
  id: "quote-1",
  quote_no: "QTE-CLOSED-1",
  inquiry_no: "INQ-CLOSED-1",
  customer_id: "CUS-002",
  vehicle_id: "V-001",
  quantity: 2,
  price: 22000,
  currency: "USD",
  status: "Active",
};

function makeDb(inquiryStatus = "Closed", statusBeforeClosure = "Negotiating") {
  const written: Array<{ sql: string; values: unknown[] }> = [];
  const db = {
    prepare(sql: string) {
      return {
        sql,
        bound: [] as unknown[],
        bind(...values: unknown[]) { this.bound = values; return this; },
        async first<T>() {
          if (/FROM\s+inquiry_status_history/i.test(sql)) return { from_status: statusBeforeClosure } as T;
          if (/FROM\s+quotes/i.test(sql)) return { ...QUOTE, inquiry_status: inquiryStatus } as T;
          if (/FROM\s+inquiries/i.test(sql)) return { ...CLOSED_INQUIRY, status: inquiryStatus } as T;
          if (/FROM\s+user/i.test(sql) || /JOIN\s+account/i.test(sql)) return { id: "CUS-002", role: "customer", account_type: "external", customer_id: "CUS-002", name: "VIP Customer", email: "customer@example.com", price_tier: "vip", status: "Active" } as T;
          return null;
        },
        async all<T>() { return { results: [] as T[] }; },
        async run() { written.push({ sql, values: this.bound }); return { success: true, meta: {} }; },
      };
    },
    async batch(statements: Array<{ sql?: string; bound?: unknown[] }>) {
      for (const statement of statements) if (statement?.sql) written.push({ sql: statement.sql, values: statement.bound || [] });
      return statements.map(() => ({ success: true }));
    },
    written,
  };
  return db as unknown as D1Database & { written: typeof written };
}

function env(db: D1Database) {
  return { PORTAL_DB: db, ENVIRONMENT: "test", PORTAL_COOKIE_NAME: "portal_session" } as unknown as PortalEnv;
}

async function session(role: "admin" | "sales" | "customer", targetEnv: PortalEnv) {
  const login = await handlePortalRequest(new Request("http://localhost/api/portal/dev-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) }), targetEnv);
  return decodeURIComponent(login.headers.get("set-cookie")?.match(/(?:portal_session|youguard_portal)=([^;]+)/)?.[1] || "");
}

test("a closed inquiry blocks quote creation, counteroffers, and quote acceptance before any write", async () => {
  const db = makeDb();
  const targetEnv = env(db);
  const sales = await session("sales", targetEnv);
  const customer = await session("customer", targetEnv);

  const create = await handlePortalRequest(new Request("http://localhost/api/portal/quotes", { method: "POST", headers: { "Content-Type": "application/json", Cookie: `portal_session=${sales}` }, body: JSON.stringify({ inquiryNo: CLOSED_INQUIRY.inquiry_no, unitPrice: 22000 }) }), targetEnv);
  const counter = await handlePortalRequest(new Request("http://localhost/api/portal/quotes/QTE-CLOSED-1/counter", { method: "POST", headers: { "Content-Type": "application/json", Cookie: `portal_session=${customer}` }, body: JSON.stringify({ counterPrice: 21000 }) }), targetEnv);
  const accept = await handlePortalRequest(new Request("http://localhost/api/portal/quotes/QTE-CLOSED-1/accept", { method: "POST", headers: { "Content-Type": "application/json", Cookie: `portal_session=${customer}` }, body: JSON.stringify({}) }), targetEnv);

  expect(create.status).toBe(409);
  expect(counter.status).toBe(409);
  expect(accept.status).toBe(409);
  expect(db.written).toHaveLength(0);
});

test("creating a quotation transitions a new inquiry to Quoted with an audit record", async () => {
  const db = makeDb("New Inquiry");
  const targetEnv = env(db);
  const sales = await session("sales", targetEnv);

  const create = await handlePortalRequest(new Request("http://localhost/api/portal/quotes", { method: "POST", headers: { "Content-Type": "application/json", Cookie: `portal_session=${sales}` }, body: JSON.stringify({ inquiryNo: CLOSED_INQUIRY.inquiry_no, unitPrice: 22000 }) }), targetEnv);

  expect(create.status).toBe(201);
  expect(db.written.some(({ sql, values }) => /UPDATE\s+inquiries\s+SET\s+status=\?/i.test(sql) && values.includes("Quoted"))).toBe(true);
  expect(db.written.some(({ sql, values }) => /INSERT\s+INTO\s+inquiry_status_history/i.test(sql) && values.includes("New Inquiry") && values.includes("Quoted"))).toBe(true);
});

test("countering a quotation transitions a quoted inquiry to Negotiating with an audit record", async () => {
  const db = makeDb("Quoted");
  const targetEnv = env(db);
  const customer = await session("customer", targetEnv);

  const counter = await handlePortalRequest(new Request("http://localhost/api/portal/quotes/QTE-CLOSED-1/counter", { method: "POST", headers: { "Content-Type": "application/json", Cookie: `portal_session=${customer}` }, body: JSON.stringify({ counterPrice: 21000 }) }), targetEnv);

  expect(counter.status).toBe(200);
  expect(db.written.some(({ sql, values }) => /UPDATE\s+inquiries\s+SET\s+status=\?/i.test(sql) && values.includes("Negotiating"))).toBe(true);
  expect(db.written.some(({ sql, values }) => /INSERT\s+INTO\s+inquiry_status_history/i.test(sql) && values.includes("Quoted") && values.includes("Negotiating"))).toBe(true);
});

test("accepting a quotation transitions an active inquiry to Accepted with an audit record", async () => {
  const db = makeDb("Negotiating");
  const targetEnv = env(db);
  const customer = await session("customer", targetEnv);

  const accept = await handlePortalRequest(new Request("http://localhost/api/portal/quotes/QTE-CLOSED-1/accept", { method: "POST", headers: { "Content-Type": "application/json", Cookie: `portal_session=${customer}` }, body: JSON.stringify({}) }), targetEnv);

  expect(accept.status).toBe(201);
  expect(db.written.some(({ sql, values }) => /UPDATE\s+inquiries\s+SET\s+status=\?/i.test(sql) && values.includes("Accepted"))).toBe(true);
  expect(db.written.some(({ sql, values }) => /INSERT\s+INTO\s+inquiry_status_history/i.test(sql) && values.includes("Negotiating") && values.includes("Accepted"))).toBe(true);
  expect(db.written.some(({ sql }) => /INSERT\s+INTO\s+orders/i.test(sql))).toBe(true);
});

test("an administrator restores a closed inquiry to the status it had before closure", async () => {
  const db = makeDb("Closed", "Negotiating");
  const targetEnv = env(db);
  const admin = await session("admin", targetEnv);

  const restore = await handlePortalRequest(new Request("http://localhost/api/portal/inquiries/INQ-CLOSED-1/status", { method: "PATCH", headers: { "Content-Type": "application/json", Cookie: `portal_session=${admin}` }, body: JSON.stringify({ action: "restore" }) }), targetEnv);

  expect(restore.status).toBe(200);
  expect(db.written.some(({ sql, values }) => /UPDATE\s+inquiries\s+SET\s+status=\?/i.test(sql) && values.includes("Negotiating"))).toBe(true);
  expect(db.written.some(({ sql, values }) => /INSERT\s+INTO\s+inquiry_status_history/i.test(sql) && values.includes("Closed") && values.includes("Negotiating"))).toBe(true);
});
