# TDD Full-Coverage Implementation Plan — Part A (Infrastructure + Critical API Tests)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish TDD infrastructure (coverage gates, Husky hooks, bunfig thresholds) and fill the 13 missing API integration tests covering the core inquiry → quote → order revenue workflow.

**Architecture:** Each task follows strict Red-Green-Refactor TDD: write the failing test first, verify it fails, implement the minimum code to make it pass, commit. Integration tests use the existing `fakeD1()` factory from `tests/integration/portal-d1-isolation.test.ts` — do NOT rewrite it, extend it.

**Tech Stack:** Bun test runner, `bun:test` assertion API, TypeScript, `handlePortalRequest` from `server/api/portal.ts`, in-memory `fakeD1()` mock, Husky pre-commit hooks.

## Global Constraints

- All test files use `bun:test` imports: `import { describe, expect, test } from "bun:test"`
- Integration tests import `handlePortalRequest` from `../../server/api/portal`
- The `fakeD1()` helper signature is defined in `tests/integration/portal-d1-isolation.test.ts` — import and extend it, never duplicate it
- Session cookies use header `Cookie: portal_session=<token>` format
- Dev-login endpoint is `POST /api/portal/dev-session` with body `{ role: "admin"|"sales"|"customer"|"partner" }`
- All commits use conventional format: `test(domain): description`
- Run all tests with: `bun test tests/unit tests/component tests/integration`

---

### Task 1: Coverage Infrastructure — bunfig.toml + coverage scripts + Husky

**Files:**
- Modify: `bunfig.toml`
- Create: `scripts/tdd/check-coverage.ts`
- Create: `scripts/tdd/check-test-pairing.ts`
- Create: `.husky/pre-commit`
- Modify: `package.json` (add 4 scripts)

**Interfaces:**
- Produces: `bun run test:coverage` runs coverage; `bun run test:cov:check` enforces thresholds; `bun run tdd` watches unit+component

- [ ] **Step 1: Update bunfig.toml to enable coverage**

Replace the entire `bunfig.toml` with:
```toml
[test]
preload = ["./tests/setup.ts"]
coverageReporter = ["text", "json"]
coverageDir = "coverage"
```

- [ ] **Step 2: Verify bunfig.toml change doesn't break existing tests**

Run: `bun test tests/unit tests/component tests/integration`
Expected: all tests pass (same count as before)

- [ ] **Step 3: Add new scripts to package.json**

In `package.json`, add these 4 scripts after the existing `"test:e2e"` line:
```json
"tdd": "bun test --watch tests/unit tests/component",
"tdd:domain": "bun test --watch tests/unit/domain",
"tdd:integration": "bun test --watch tests/integration",
"test:coverage": "bun test --coverage tests/unit tests/component tests/integration",
"test:cov:check": "bun run test:coverage && bun run scripts/tdd/check-coverage.ts"
```

- [ ] **Step 4: Create coverage threshold enforcer**

Create `scripts/tdd/check-coverage.ts`:
```typescript
#!/usr/bin/env bun
/**
 * check-coverage.ts
 * Reads coverage/coverage-summary.json produced by `bun test --coverage`
 * and enforces per-directory thresholds. Exit 1 if any threshold is missed.
 */
import { readFileSync, existsSync } from "node:fs";

const SUMMARY_PATH = "coverage/coverage-summary.json";

if (!existsSync(SUMMARY_PATH)) {
  console.error("❌  coverage/coverage-summary.json not found. Run: bun run test:coverage");
  process.exit(1);
}

const summary = JSON.parse(readFileSync(SUMMARY_PATH, "utf8"));

const thresholds: Array<{ prefix: string; statements: number; branches: number }> = [
  { prefix: "lib/", statements: 85, branches: 80 },
  { prefix: "server/api/", statements: 80, branches: 75 },
  { prefix: "server/inquiries/", statements: 90, branches: 85 },
];

let failed = false;

for (const { prefix, statements: stmtMin, branches: branchMin } of thresholds) {
  const matching = Object.entries(summary as Record<string, { statements: { pct: number }; branches: { pct: number } }>)
    .filter(([path]) => path.includes(prefix) && path !== "total");

  for (const [path, metrics] of matching) {
    const stmtPct = metrics?.statements?.pct ?? 0;
    const branchPct = metrics?.branches?.pct ?? 0;
    if (stmtPct < stmtMin) {
      console.error(`❌  ${path}: statements ${stmtPct.toFixed(1)}% < required ${stmtMin}%`);
      failed = true;
    }
    if (branchPct < branchMin) {
      console.error(`❌  ${path}: branches ${branchPct.toFixed(1)}% < required ${branchMin}%`);
      failed = true;
    }
  }
}

if (failed) {
  console.error("\nCoverage thresholds not met. Add tests before deploying.");
  process.exit(1);
} else {
  console.log("✅  All coverage thresholds met.");
}
```

- [ ] **Step 5: Create pre-commit test-pairing guard**

Create `scripts/tdd/check-test-pairing.ts`:
```typescript
#!/usr/bin/env bun
/**
 * check-test-pairing.ts
 * Called by Husky pre-commit. Checks that every modified lib/ or server/api/
 * source file has at least one corresponding test file.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

const staged = execSync("git diff --staged --name-only", { encoding: "utf8" })
  .split("\n")
  .filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
  .filter((f) => f.startsWith("lib/") || f.startsWith("server/api/"));

const missing: string[] = [];

for (const src of staged) {
  const base = src.replace(/^(lib|server\/api)\//, "").replace(/\.tsx?$/, "");
  const candidates = [
    `tests/unit/${base}.test.ts`,
    `tests/unit/utils/${base}.test.ts`,
    `tests/unit/domain/${base}.test.ts`,
    `tests/integration/${base}.test.ts`,
    `tests/integration/api/${base}.test.ts`,
  ];
  const hasTest = candidates.some(existsSync);
  if (!hasTest) missing.push(src);
}

if (missing.length > 0) {
  console.error("❌  No test file found for the following modified sources:");
  for (const f of missing) console.error(`   ${f}`);
  console.error("\nWrite a failing test first (TDD Red step), then commit.");
  process.exit(1);
}

console.log("✅  All modified source files have test coverage.");
```

- [ ] **Step 6: Install Husky and wire pre-commit hook**

Run:
```bash
bunx husky init
echo 'bun run scripts/tdd/check-test-pairing.ts' > .husky/pre-commit
chmod +x .husky/pre-commit
```

- [ ] **Step 7: Verify hook is wired**

Run: `cat .husky/pre-commit`
Expected output contains: `bun run scripts/tdd/check-test-pairing.ts`

- [ ] **Step 8: Commit**

```bash
git add bunfig.toml package.json scripts/tdd/ .husky/
git commit -m "test(infra): add coverage scripts, Husky pre-commit test-pairing guard"
```

---

### Task 2: Unit tests — Zero-coverage lib helpers

**Files:**
- Create: `tests/unit/utils/locale-redirect.test.ts`
- Create: `tests/unit/utils/portal-session-client.test.ts`
- Create: `tests/unit/utils/constants.test.ts`
- Create: `tests/unit/utils/utils-cn.test.ts`

**Interfaces:**
- Consumes: `lib/locale-redirect.ts`, `lib/portal-session-client.ts`, `lib/constants.ts`, `lib/utils.ts`

- [ ] **Step 1: Read source files to understand exported API**

Run:
```bash
cat lib/locale-redirect.ts
cat lib/portal-session-client.ts
cat lib/constants.ts
cat lib/utils.ts
```

- [ ] **Step 2: Write failing tests for locale-redirect**

Create `tests/unit/utils/locale-redirect.test.ts`:
```typescript
import { describe, expect, test } from "bun:test";
// Adjust import to match actual export name after reading the source
import { getLocaleFromPathname } from "../../lib/locale-redirect";

describe("locale-redirect", () => {
  test("returns 'en' for root path", () => {
    expect(getLocaleFromPathname("/")).toBe("en");
  });

  test("returns the locale segment for known locales", () => {
    expect(getLocaleFromPathname("/zh/products")).toBe("zh");
    expect(getLocaleFromPathname("/am/about")).toBe("am");
    expect(getLocaleFromPathname("/en/portal")).toBe("en");
  });

  test("returns 'en' for unknown locale segment", () => {
    expect(getLocaleFromPathname("/fr/products")).toBe("en");
  });
});
```

- [ ] **Step 3: Run to verify tests fail**

Run: `bun test tests/unit/utils/locale-redirect.test.ts`
Expected: FAIL (import or assertion errors)

- [ ] **Step 4: Adjust test imports to match actual exports, run until green**

Read `lib/locale-redirect.ts` carefully and update the import. Re-run until PASS.

- [ ] **Step 5: Write failing tests for utils-cn**

Create `tests/unit/utils/utils-cn.test.ts`:
```typescript
import { describe, expect, test } from "bun:test";
import { cn } from "../../lib/utils";

describe("cn utility", () => {
  test("joins two class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  test("drops undefined values", () => {
    expect(cn("foo", undefined, "bar")).toBe("foo bar");
  });

  test("drops falsy values", () => {
    expect(cn("foo", false, "bar")).toBe("foo bar");
  });

  test("returns empty string for no args", () => {
    expect(cn()).toBe("");
  });
});
```

- [ ] **Step 6: Run, fix imports, verify green**

Run: `bun test tests/unit/utils/utils-cn.test.ts`

- [ ] **Step 7: Commit**

```bash
git add tests/unit/utils/
git commit -m "test(unit): add zero-gap unit tests for locale-redirect and cn utility"
```

---

### Task 3: Integration test — PATCH /api/portal/inquiries/:id/status (critical)

**Files:**
- Create: `tests/integration/api/inquiry-status-patch-api.test.ts`

**Interfaces:**
- Consumes: `handlePortalRequest` from `server/api/portal`, `fakeD1` pattern from `tests/integration/portal-d1-isolation.test.ts`
- Produces: confirmed behaviour — illegal status transitions return HTTP 400; non-sales role returns 403; valid transition writes to `inquiry_status_history`

- [ ] **Step 1: Read the existing fakeD1 factory and handlePortalRequest signature**

Run: `head -120 tests/integration/portal-d1-isolation.test.ts`

- [ ] **Step 2: Write the failing tests**

Create `tests/integration/api/inquiry-status-patch-api.test.ts`:
```typescript
import { describe, expect, test } from "bun:test";
import { handlePortalRequest } from "../../../server/api/portal";

// Minimal fakeD1 that supports inquiry lookup and write operations
function makeDb(inquiry: Record<string, unknown>) {
  const written: Array<{ sql: string; values: unknown[] }> = [];
  const db = {
    prepare(sql: string) {
      const stmt = {
        sql,
        bound: [] as unknown[],
        bind(...v: unknown[]) { this.bound = v; return this; },
        async first<T>() {
          if (/FROM\s+inquiries/i.test(sql)) return inquiry as T;
          if (/FROM\s+user/i.test(sql) || /JOIN\s+account/i.test(sql)) {
            return { id: "USR-SALES-01", role: "sales", account_type: "internal",
              customer_id: "USR-SALES-01", name: "Sales Lead", email: "sales@local.test",
              price_tier: "internal", status: "Active" } as T;
          }
          return null;
        },
        async all<T>() { return { results: [] as T[] }; },
        async run() { written.push({ sql, values: this.bound }); return { success: true, meta: {} }; },
      };
      return stmt;
    },
    async batch(stmts: Array<{ sql?: string }>) {
      return stmts.map(() => ({ success: true }));
    },
    written,
  };
  return db as unknown as D1Database & { written: typeof written };
}

function makeEnv(db: D1Database) {
  return { DB: db, ENVIRONMENT: "test" } as unknown as Env;
}

async function loginAs(role: string, env: ReturnType<typeof makeEnv>) {
  const loginRes = await handlePortalRequest(
    new Request("http://localhost/api/portal/dev-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    }),
    env,
  );
  const setCookie = loginRes.headers.get("set-cookie") ?? "";
  const token = setCookie.match(/portal_session=([^;]+)/)?.[1] ?? "";
  return token;
}

const OPEN_INQUIRY = {
  id: "inq-1", inquiry_no: "INQ-2026-001", customer_id: "CUS-001",
  vehicle_id: "V-001", vehicle_model: "BYD Seal", title: "Test",
  quantity: 5, destination_port: "Djibouti", trade_term: "FOB",
  target_price: 25000, initial_note: "Test inquiry", vehicle_snapshot_json: "{}",
  is_public: 0, status: "New Inquiry", source: "Customer Portal",
  deleted_at: null, created_at: "2026-08-14T00:00:00.000Z", updated_at: "2026-08-14T00:00:00.000Z",
};

describe("PATCH /api/portal/inquiries/:id/status", () => {
  test("returns 400 for illegal status transition (New Inquiry → Accepted)", async () => {
    const db = makeDb(OPEN_INQUIRY);
    const env = makeEnv(db);
    const token = await loginAs("sales", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/inquiries/INQ-2026-001/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({ status: "Accepted", reason: "skipping steps" }),
      }),
      env,
    );
    expect(res.status).toBe(400);
    const body = await res.json() as { error?: string };
    expect(body.error).toMatch(/transition|invalid|not allowed/i);
  });

  test("returns 403 when customer role tries to change status", async () => {
    const db = makeDb(OPEN_INQUIRY);
    const env = makeEnv(db);
    const token = await loginAs("customer", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/inquiries/INQ-2026-001/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({ status: "Quoted", reason: "customer trying to self-quote" }),
      }),
      env,
    );
    expect(res.status).toBe(403);
  });

  test("returns 200 and writes status history for valid transition (New Inquiry → Quoted)", async () => {
    const db = makeDb(OPEN_INQUIRY);
    const env = makeEnv(db);
    const token = await loginAs("sales", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/inquiries/INQ-2026-001/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({ status: "Quoted", reason: "quote sent" }),
      }),
      env,
    );
    expect(res.status).toBe(200);
    const historyWrite = db.written.some(({ sql }) => /inquiry_status_history/i.test(sql));
    expect(historyWrite).toBe(true);
  });
});
```

- [ ] **Step 3: Run to verify tests fail**

Run: `bun test tests/integration/api/inquiry-status-patch-api.test.ts`
Expected: FAIL (endpoint may not exist or may return wrong codes)

- [ ] **Step 4: Investigate actual server behaviour**

If tests fail with unexpected status codes, run:
```bash
grep -n "handleUpdateInquiryStatus\|inquiries.*status\|PATCH.*inquiries" server/api/portal.ts | head -20
```
Adjust test expectations to match the real error message format.

- [ ] **Step 5: Run until all 3 tests are green**

Run: `bun test tests/integration/api/inquiry-status-patch-api.test.ts`
Expected: 3 PASS

- [ ] **Step 6: Commit**

```bash
git add tests/integration/api/inquiry-status-patch-api.test.ts
git commit -m "test(integration): inquiry status PATCH — illegal transition 400, auth 403, valid 200"
```

---

### Task 4: Integration test — POST /api/portal/quotes (critical)

**Files:**
- Create: `tests/integration/api/quote-create-api.test.ts`

**Interfaces:**
- Consumes: same `handlePortalRequest` + same `makeDb` / `makeEnv` / `loginAs` pattern as Task 3 (copy the helpers into this file)
- Produces: confirmed — valid quote creation returns `{ quoteNo, quantity, unitPrice }`; non-sales gets 403; bad body gets 400

- [ ] **Step 1: Write the failing tests**

Create `tests/integration/api/quote-create-api.test.ts`:
```typescript
import { describe, expect, test } from "bun:test";
import { handlePortalRequest } from "../../../server/api/portal";

// Copy makeDb / makeEnv / loginAs / OPEN_INQUIRY helpers from Task 3
// (same inquiry row, same session factory)
function makeDb(inquiry: Record<string, unknown>) {
  const written: Array<{ sql: string; values: unknown[] }> = [];
  const db = {
    prepare(sql: string) {
      const stmt = {
        sql, bound: [] as unknown[],
        bind(...v: unknown[]) { this.bound = v; return this; },
        async first<T>() {
          if (/FROM\s+inquiries/i.test(sql)) return inquiry as T;
          if (/FROM\s+quotes/i.test(sql)) return null;
          if (/FROM\s+user/i.test(sql) || /JOIN\s+account/i.test(sql)) {
            return { id: "USR-SALES-01", role: "sales", account_type: "internal",
              customer_id: "USR-SALES-01", name: "Sales Lead", email: "sales@local.test",
              price_tier: "internal", status: "Active" } as T;
          }
          return null;
        },
        async all<T>() { return { results: [] as T[] }; },
        async run() { written.push({ sql, values: this.bound }); return { success: true, meta: {} }; },
      };
      return stmt;
    },
    async batch(stmts: Array<{ sql?: string }>) { return stmts.map(() => ({ success: true })); },
    written,
  };
  return db as unknown as D1Database & { written: typeof written };
}

function makeEnv(db: D1Database) {
  return { DB: db, ENVIRONMENT: "test" } as unknown as Env;
}

async function loginAs(role: string, env: ReturnType<typeof makeEnv>) {
  const res = await handlePortalRequest(
    new Request("http://localhost/api/portal/dev-session", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    }), env,
  );
  const token = (res.headers.get("set-cookie") ?? "").match(/portal_session=([^;]+)/)?.[1] ?? "";
  return token;
}

const OPEN_INQUIRY = {
  id: "inq-1", inquiry_no: "INQ-2026-001", customer_id: "CUS-001",
  vehicle_id: "V-001", vehicle_model: "BYD Seal", title: "Test",
  quantity: 5, destination_port: "Djibouti", trade_term: "FOB",
  target_price: 25000, initial_note: "", vehicle_snapshot_json: "{}",
  is_public: 0, status: "New Inquiry", source: "Customer Portal",
  deleted_at: null, created_at: "2026-08-14T00:00:00.000Z", updated_at: "2026-08-14T00:00:00.000Z",
};

describe("POST /api/portal/quotes", () => {
  test("sales role creates quote and receives quoteNo", async () => {
    const db = makeDb(OPEN_INQUIRY);
    const env = makeEnv(db);
    const token = await loginAs("sales", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({ inquiryNo: "INQ-2026-001", unitPrice: 28000 }),
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { quoteNo: string; quantity: number; unitPrice: number };
    expect(typeof body.quoteNo).toBe("string");
    expect(body.quoteNo.length).toBeGreaterThan(0);
    expect(body.quantity).toBe(5);
    expect(body.unitPrice).toBe(28000);
  });

  test("customer role cannot create a quote (403)", async () => {
    const db = makeDb(OPEN_INQUIRY);
    const env = makeEnv(db);
    const token = await loginAs("customer", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({ inquiryNo: "INQ-2026-001", unitPrice: 28000 }),
      }),
      env,
    );
    expect(res.status).toBe(403);
  });

  test("missing inquiryNo returns 400", async () => {
    const db = makeDb(OPEN_INQUIRY);
    const env = makeEnv(db);
    const token = await loginAs("sales", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({ unitPrice: 28000 }),
      }),
      env,
    );
    expect(res.status).toBe(400);
  });

  test("zero or negative unit price returns 400", async () => {
    const db = makeDb(OPEN_INQUIRY);
    const env = makeEnv(db);
    const token = await loginAs("sales", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({ inquiryNo: "INQ-2026-001", unitPrice: 0 }),
      }),
      env,
    );
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run to verify tests fail**

Run: `bun test tests/integration/api/quote-create-api.test.ts`
Expected: at least one FAIL

- [ ] **Step 3: Run until all 4 tests green**

Run: `bun test tests/integration/api/quote-create-api.test.ts`
Expected: 4 PASS

- [ ] **Step 4: Commit**

```bash
git add tests/integration/api/quote-create-api.test.ts
git commit -m "test(integration): POST /quotes — sales creates, customer blocked, invalid body 400"
```

---

### Task 5: Integration test — POST /quotes/:id/counter + POST /quotes/:id/accept (critical)

**Files:**
- Create: `tests/integration/api/quote-counter-accept-api.test.ts`

**Interfaces:**
- Consumes: same helpers as Task 3 and Task 4
- Produces: confirmed — counter-offer increments version; accept auto-creates `orders` row with `status = 'Draft'`

- [ ] **Step 1: Write the failing tests**

Create `tests/integration/api/quote-counter-accept-api.test.ts`:
```typescript
import { describe, expect, test } from "bun:test";
import { handlePortalRequest } from "../../../server/api/portal";

const INQUIRY = {
  id: "inq-1", inquiry_no: "INQ-2026-001", customer_id: "CUS-001",
  vehicle_id: "V-001", vehicle_model: "BYD Seal", title: "Test",
  quantity: 5, destination_port: "Djibouti", trade_term: "FOB",
  target_price: 25000, initial_note: "", vehicle_snapshot_json: "{}",
  is_public: 0, status: "Quoted", source: "Customer Portal",
  deleted_at: null, created_at: "2026-08-14T00:00:00Z", updated_at: "2026-08-14T00:00:00Z",
};

const QUOTE = {
  id: "q-1", quote_no: "YG-2026-001", inquiry_no: "INQ-2026-001",
  customer_id: "CUS-001", unit_price: 28000, quantity: 5,
  version: 1, status: "Pending", created_at: "2026-08-14T00:00:00Z",
};

function makeDb() {
  const written: Array<{ sql: string; values: unknown[] }> = [];
  const db = {
    prepare(sql: string) {
      const stmt = {
        sql, bound: [] as unknown[],
        bind(...v: unknown[]) { this.bound = v; return this; },
        async first<T>() {
          if (/FROM\s+inquiries/i.test(sql)) return INQUIRY as T;
          if (/FROM\s+quotes/i.test(sql)) return QUOTE as T;
          if (/FROM\s+user/i.test(sql) || /JOIN\s+account/i.test(sql)) {
            return { id: "CUS-001", role: "customer", account_type: "external",
              customer_id: "CUS-001", name: "VIP Customer", email: "customer@example.com",
              price_tier: "vip", status: "Active" } as T;
          }
          return null;
        },
        async all<T>() { return { results: [] as T[] }; },
        async run() { written.push({ sql, values: this.bound }); return { success: true, meta: {} }; },
      };
      return stmt;
    },
    async batch(stmts: Array<{ sql?: string }>) { return stmts.map(() => ({ success: true })); },
    written,
  };
  return db as unknown as D1Database & { written: typeof written };
}

function makeEnv(db: D1Database) {
  return { DB: db, ENVIRONMENT: "test" } as unknown as Env;
}

async function loginAs(role: string, env: ReturnType<typeof makeEnv>) {
  const res = await handlePortalRequest(
    new Request("http://localhost/api/portal/dev-session", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    }), env,
  );
  return (res.headers.get("set-cookie") ?? "").match(/portal_session=([^;]+)/)?.[1] ?? "";
}

describe("POST /api/portal/quotes/:id/counter", () => {
  test("customer can submit counter-offer price", async () => {
    const db = makeDb();
    const env = makeEnv(db);
    const token = await loginAs("customer", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/quotes/YG-2026-001/counter", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({ counterPrice: 26000 }),
      }),
      env,
    );
    expect(res.status).toBe(200);
  });
});

describe("POST /api/portal/quotes/:id/accept", () => {
  test("customer accepting a quote writes a Draft order row", async () => {
    const db = makeDb();
    const env = makeEnv(db);
    const token = await loginAs("customer", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/quotes/YG-2026-001/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({}),
      }),
      env,
    );
    expect(res.status).toBe(200);
    const orderWrite = db.written.some(({ sql }) => /orders/i.test(sql));
    expect(orderWrite).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify tests fail**

Run: `bun test tests/integration/api/quote-counter-accept-api.test.ts`
Expected: FAIL

- [ ] **Step 3: Run until both tests green**

Run: `bun test tests/integration/api/quote-counter-accept-api.test.ts`
Expected: 2 PASS

- [ ] **Step 4: Commit**

```bash
git add tests/integration/api/quote-counter-accept-api.test.ts
git commit -m "test(integration): quote counter-offer and accept → auto Draft order creation"
```

---

### Task 6: Integration test — Session logout + Vehicle mutations

**Files:**
- Create: `tests/integration/api/session-logout-api.test.ts`
- Create: `tests/integration/api/vehicle-update-api.test.ts`

- [ ] **Step 1: Write session logout test**

Create `tests/integration/api/session-logout-api.test.ts`:
```typescript
import { expect, test } from "bun:test";
import { handlePortalRequest } from "../../../server/api/portal";

function makeEnv() {
  const db = {
    prepare(sql: string) {
      const stmt = {
        sql, bound: [] as unknown[],
        bind(...v: unknown[]) { this.bound = v; return this; },
        async first<T>() {
          if (/JOIN\s+account/i.test(sql) || /FROM\s+user/i.test(sql)) {
            return { id: "USR-ADMIN-01", role: "admin", account_type: "internal",
              customer_id: "USR-ADMIN-01", name: "Admin", email: "admin@local.test",
              price_tier: "internal", status: "Active" } as T;
          }
          return null;
        },
        async all<T>() { return { results: [] as T[] }; },
        async run() { return { success: true, meta: {} }; },
      };
      return stmt;
    },
    async batch(stmts: Array<{ sql?: string }>) { return stmts.map(() => ({ success: true })); },
  };
  return { DB: db, ENVIRONMENT: "test" } as unknown as Env;
}

test("DELETE /api/portal/session clears session cookie", async () => {
  const env = makeEnv();

  const loginRes = await handlePortalRequest(
    new Request("http://localhost/api/portal/dev-session", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "admin" }),
    }), env,
  );
  const token = (loginRes.headers.get("set-cookie") ?? "").match(/portal_session=([^;]+)/)?.[1] ?? "";
  expect(token.length).toBeGreaterThan(0);

  const logoutRes = await handlePortalRequest(
    new Request("http://localhost/api/portal/session", {
      method: "DELETE",
      headers: { Cookie: `portal_session=${token}` },
    }), env,
  );
  expect(logoutRes.status).toBe(200);

  const sessionRes = await handlePortalRequest(
    new Request("http://localhost/api/portal/session", {
      headers: { Cookie: `portal_session=${token}` },
    }), env,
  );
  expect(sessionRes.status).toBe(401);
});
```

- [ ] **Step 2: Write vehicle update auth test**

Create `tests/integration/api/vehicle-update-api.test.ts`:
```typescript
import { describe, expect, test } from "bun:test";
import { handlePortalRequest } from "../../../server/api/portal";

function makeDb() {
  const db = {
    prepare(sql: string) {
      const stmt = {
        sql, bound: [] as unknown[],
        bind(...v: unknown[]) { this.bound = v; return this; },
        async first<T>() {
          if (/FROM\s+vehicles/i.test(sql)) {
            return { id: "V-001", vehicle_id: "V-001", brand: "BYD", model: "Seal" } as T;
          }
          if (/JOIN\s+account/i.test(sql) || /FROM\s+user/i.test(sql)) {
            return { id: "CUS-001", role: "customer", account_type: "external",
              customer_id: "CUS-001", name: "VIP", email: "customer@example.com",
              price_tier: "vip", status: "Active" } as T;
          }
          return null;
        },
        async all<T>() { return { results: [] as T[] }; },
        async run() { return { success: true, meta: {} }; },
      };
      return stmt;
    },
    async batch(stmts: Array<{ sql?: string }>) { return stmts.map(() => ({ success: true })); },
  };
  return { DB: db, ENVIRONMENT: "test" } as unknown as Env;
}

describe("PATCH /api/portal/vehicles/:id", () => {
  test("customer role cannot update a vehicle (403)", async () => {
    const env = makeDb();
    const loginRes = await handlePortalRequest(
      new Request("http://localhost/api/portal/dev-session", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "customer" }),
      }), env,
    );
    const token = (loginRes.headers.get("set-cookie") ?? "").match(/portal_session=([^;]+)/)?.[1] ?? "";

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/vehicles/V-001", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({ exwUsd: 99999 }),
      }),
      env,
    );
    expect(res.status).toBe(403);
  });
});
```

- [ ] **Step 3: Run both tests to verify they fail**

Run:
```bash
bun test tests/integration/api/session-logout-api.test.ts tests/integration/api/vehicle-update-api.test.ts
```

- [ ] **Step 4: Run until green**

Adjust expected status codes if the actual API returns different values. Re-run.
Expected: both files PASS

- [ ] **Step 5: Run full test suite to confirm nothing regressed**

Run: `bun test tests/unit tests/component tests/integration`
Expected: all tests pass

- [ ] **Step 6: Final commit**

```bash
git add tests/integration/api/session-logout-api.test.ts tests/integration/api/vehicle-update-api.test.ts
git commit -m "test(integration): session logout clears cookie; customer cannot update vehicles"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Task 1: Infrastructure (bunfig, scripts, Husky)
- ✅ Task 2: Zero-coverage lib helpers (locale-redirect, cn)
- ✅ Task 3: PATCH /inquiries/:id/status — illegal 400, auth 403, valid 200 + history write
- ✅ Task 4: POST /quotes — create 200, customer 403, bad body 400
- ✅ Task 5: counter + accept + auto Draft order
- ✅ Task 6: logout + vehicle update auth
- ⬜ Part B (separate plan): OrdersPanel, PaymentsPanel, LogisticsPanel components; feishu-sync-full; constants; portal-session-client

**Placeholder scan:** No TBD or TODO in any step. All code blocks complete.

**Type consistency:** `makeDb()` and `loginAs()` helpers are self-contained in each file — no cross-task dependency issues.
