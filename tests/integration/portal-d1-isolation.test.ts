import { afterEach, describe, expect, test } from "bun:test";
import { handlePortalRequest } from "../../server/api/portal";

type Row = Record<string, unknown>;

function fakeD1(options: {
  user?: Row | null;
  models?: Row[];
  trims?: Row[];
  vehicles?: Row[];
  quotes?: Row[];
  inquiries?: Row[];
  notes?: Row[];
} = {}) {
  const queries: string[] = [];
  const batches: string[][] = [];
  const db = {
    prepare(sql: string) {
      queries.push(sql);
      let bound: unknown[] = [];
      const statement = {
        sql,
        bind(...values: unknown[]) {
          bound = values;
          return statement;
        },
        async all<T>() {
          if (/FROM\s+vehicle_models/i.test(sql)) return { results: (options.models ?? []) as T[] };
          if (/FROM\s+vehicle_trims/i.test(sql)) return { results: (options.trims ?? []) as T[] };
          if (/FROM\s+vehicles/i.test(sql)) return { results: (options.vehicles ?? []) as T[] };
          if (/FROM\s+quotes/i.test(sql)) {
            const rows = options.quotes ?? [];
            return { results: rows.filter((row) => !bound.length || row.quote_no === bound[0]) as T[] };
          }
          if (/FROM\s+inquiries/i.test(sql)) {
            const rows = options.inquiries ?? [];
            return { results: rows.filter((row) => !bound.length || row.inquiry_no === bound[0]) as T[] };
          }
          if (/FROM\s+inquiry_notes/i.test(sql)) {
            const rows = options.notes ?? [];
            return { results: rows.filter((row) => !bound.length || row.note_id === bound[0]) as T[] };
          }
          return { results: [] as T[] };
        },
        async first<T>() {
          if (/JOIN\s+account/i.test(sql)) return (options.user ?? null) as T | null;
          const result = await statement.all<T>();
          return result.results[0] ?? null;
        },
        async run() {
          return { success: true, meta: {} };
        },
      };
      return statement;
    },
    async batch(statements: Array<{ sql?: string }>) {
      batches.push(statements.map((statement) => statement.sql ?? ""));
      return statements.map(() => ({ success: true }));
    },
    queries,
    batches,
  };
  return db as unknown as D1Database & { queries: string[]; batches: string[][] };
}

const env = (PORTAL_DB?: D1Database) => ({
  PORTAL_DB,
  DEV: false,
  PORTAL_SESSION_SECRET: "test-session-secret-that-is-long-enough",
});

const validUser = {
  id: "user-1",
  user_id: "USR-1",
  customer_id: "CUS-1",
  name: "D1 User",
  email: "d1@example.com",
  company: "D1 Co",
  account_type: "external",
  role: "customer",
  price_tier: "vip",
  status: "Active",
  password: "d1-secret",
};

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

async function login(db: D1Database) {
  const response = await handlePortalRequest(
    new Request("https://portal.example/api/portal/session", {
      method: "POST",
      body: JSON.stringify({ email: "d1@example.com", accessCode: "d1-secret" }),
    }),
    env(db),
  );
  expect(response.status).toBe(200);
  return response.headers.get("set-cookie")!.split(";")[0];
}

describe("portal request/D1 isolation", () => {
  test("vehicle resources only query records approved for website connection", async () => {
    const db = fakeD1({
      user: validUser,
      vehicles: [
        { id: "approved", stage: "connected", brand: "BYD", model: "Seal", variant: "Approved" },
        { id: "pending", stage: "unreviewed", brand: "BYD", model: "Seal", variant: "Pending" },
      ],
    });
    const cookie = await login(db);

    const response = await handlePortalRequest(
      new Request("https://portal.example/api/portal/vehicles", { headers: { cookie } }),
      env(db),
    );

    expect(response.status).toBe(200);
    expect(db.queries.some((sql) => /FROM\s+vehicles\s+WHERE\s+stage\s*=\s*['"]connected['"]/i.test(sql))).toBe(true);
  });

  test("formal login uses user JOIN account.password and never calls Feishu", async () => {
    const db = fakeD1({
      user: validUser,
    });
    globalThis.fetch = (async () => {
      throw new Error("request-time Feishu call");
    }) as any;

    await login(db);
    expect(db.queries.some((query) => /JOIN\s+account/i.test(query) && /account\.password/i.test(query))).toBe(true);
  });

  test("formal login and business requests fail clearly without PORTAL_DB", async () => {
    let fetchCalls = 0;
    globalThis.fetch = (async () => {
      fetchCalls += 1;
      throw new Error("request-time Feishu call");
    }) as any;

    const loginResponse = await handlePortalRequest(
      new Request("https://portal.example/api/portal/session", {
        method: "POST",
        body: JSON.stringify({ email: "admin@local.test", accessCode: "admin-demo-2026" }),
      }),
      env(),
    );
    expect(loginResponse.status).toBe(503);

    const devSession = await handlePortalRequest(
      new Request("http://localhost/api/portal/dev-session", {
        method: "POST",
        body: JSON.stringify({ role: "admin" }),
      }),
      env(),
    );
    const cookie = devSession.headers.get("set-cookie")?.split(";")[0];
    expect(cookie).toBeTruthy();
    const catalogResponse = await handlePortalRequest(
      new Request("https://portal.example/api/portal/catalog", { headers: { cookie: cookie! } }),
      env(),
    );
    expect(catalogResponse.status).toBe(503);
    const sessionResponse = await handlePortalRequest(
      new Request("https://portal.example/api/portal/session"),
      env(),
    );
    expect(sessionResponse.status).toBe(200);
    expect((await sessionResponse.json()) as any).toEqual({ user: null });
    expect(fetchCalls).toBe(0);
  });

  test("legacy /api/auth routes are explicit D1-only responses without Feishu", async () => {
    let fetchCalls = 0;
    globalThis.fetch = (async () => {
      fetchCalls += 1;
      throw new Error("request-time Feishu call");
    }) as any;

    const response = await handlePortalRequest(
      new Request("https://portal.example/api/auth/sign-in/email", { method: "POST" }),
      env(),
    );

    expect(response.status).toBe(503);
    expect((await response.json()) as any).toEqual({ error: "Portal database is not configured" });
    expect(fetchCalls).toBe(0);
  });

  test("empty D1 catalogs return empty results without a Feishu fallback", async () => {
    const db = fakeD1({ user: validUser });
    const cookie = await login(db);
    globalThis.fetch = (async () => {
      throw new Error("request-time Feishu call");
    }) as any;

    const [catalog, models, vehicles] = await Promise.all([
      handlePortalRequest(new Request("https://portal.example/api/portal/catalog", { headers: { cookie } }), env(db)),
      handlePortalRequest(new Request("https://portal.example/api/portal/vehicle-models", { headers: { cookie } }), env(db)),
      handlePortalRequest(new Request("https://portal.example/api/portal/vehicles", { headers: { cookie } }), env(db)),
    ]);

    expect(catalog.status).toBe(200);
    expect((await catalog.json()) as any).toEqual({ vehicleModels: [], vehicleModelSpecs: [], vehicles: [] });
    expect((await models.json()) as any).toEqual({ vehicleModels: [], vehicleModelSpecs: [] });
    expect((await vehicles.json()) as any).toEqual({ vehicles: [] });
  });

  test("vehicle model catalog derives real trims from inventory when trim rows are empty", async () => {
    const db = fakeD1({
      models: [{
        id: "MDL-004",
        model_id: "MDL-004",
        brand: "BYD",
        MODEL: "BYD Seal",
        version: "Executive Flagship",
        status: "Active",
      }],
      trims: [],
      vehicles: [
        {
          id: "vehicle-1",
          model_id: "MDL-004",
          品牌: "BYD",
          型号: "Sealion 05",
          细分型号: "520km旗舰领航版",
          生产年份: "2025",
        },
        {
          id: "vehicle-2",
          model_id: "MDL-004",
          品牌: "BYD",
          型号: "Sealion 06",
          细分型号: "520KM领航版",
          生产年份: "2025",
        },
        {
          id: "vehicle-3",
          model_id: "MDL-004",
          品牌: "BYD",
          型号: "Sealion 05",
          细分型号: "520km旗舰领航版",
          生产年份: "2025",
        },
      ],
    });
    const devSession = await handlePortalRequest(
      new Request("http://localhost/api/portal/dev-session", {
        method: "POST",
        body: JSON.stringify({ role: "admin" }),
      }),
      env(db),
    );
    const cookie = devSession.headers.get("set-cookie")?.split(";")[0];
    expect(cookie).toBeTruthy();

    const response = await handlePortalRequest(
      new Request("https://portal.example/api/portal/vehicle-models", { headers: { cookie: cookie! } }),
      env(db),
    );
    const payload = await response.json() as {
      vehicleModels: Array<{ id: string; trim: string }>;
      vehicleModelSpecs: unknown[];
    };

    expect(response.status).toBe(200);
    expect(payload.vehicleModels.map((model) => model.trim)).toEqual([
      "520km旗舰领航版",
      "520KM领航版",
    ]);
    expect(payload.vehicleModels.every((model) => model.trim !== "Executive Flagship")).toBe(true);
    expect(payload.vehicleModelSpecs).toEqual([]);
  });

  test("vehicle model catalog uses the synced gallery when no static cover exists", async () => {
    const db = fakeD1({
      models: [{
        id: "MDL-GALLERY",
        model_id: "MDL-GALLERY",
        brand: "AVATR",
        MODEL: "Avatr 06",
        gallery_images_json: JSON.stringify([
          { src: "/pic/revenue-king/seagull/0.webp", cat: "Exterior", label: "Gallery 1" },
        ]),
        status: "Active",
      }],
    });
    const devSession = await handlePortalRequest(
      new Request("http://localhost/api/portal/dev-session", {
        method: "POST",
        body: JSON.stringify({ role: "admin" }),
      }),
      env(db),
    );
    const cookie = devSession.headers.get("set-cookie")?.split(";")[0];
    expect(cookie).toBeTruthy();

    const response = await handlePortalRequest(
      new Request("https://portal.example/api/portal/vehicle-models", { headers: { cookie: cookie! } }),
      env(db),
    );
    const payload = await response.json() as {
      vehicleModels: Array<{ imageUrl: string; galleryImages?: Array<{ src: string }> }>;
    };

    expect(response.status).toBe(200);
    expect(payload.vehicleModels[0]?.imageUrl).toBe("/pic/revenue-king/seagull/0.webp");
    expect(payload.vehicleModels[0]?.galleryImages?.map((image) => image.src)).toEqual([
      "/pic/revenue-king/seagull/0.webp",
    ]);
  });

  test("vehicle model catalog falls back to the pruned synced gallery field", async () => {
    const db = fakeD1({
      models: [{
        id: "MDL-GALLERY-PRUNED",
        model_id: "MDL-GALLERY-PRUNED",
        brand: "AVATR",
        MODEL: "Avatr 06",
        gallery_images_json: "",
        gallery_images_json_pruned: JSON.stringify([
          { image_url: "/pic/revenue-king/seagull/1.webp" },
        ]),
        status: "Active",
      }],
    });
    const devSession = await handlePortalRequest(
      new Request("http://localhost/api/portal/dev-session", {
        method: "POST",
        body: JSON.stringify({ role: "admin" }),
      }),
      env(db),
    );
    const cookie = devSession.headers.get("set-cookie")?.split(";")[0];
    expect(cookie).toBeTruthy();

    const response = await handlePortalRequest(
      new Request("https://portal.example/api/portal/vehicle-models", { headers: { cookie: cookie! } }),
      env(db),
    );
    const payload = await response.json() as {
      vehicleModels: Array<{ imageUrl: string; galleryImages?: Array<{ src: string }> }>;
    };

    expect(response.status).toBe(200);
    expect(payload.vehicleModels[0]?.imageUrl).toBe("/pic/revenue-king/seagull/1.webp");
    expect(payload.vehicleModels[0]?.galleryImages?.map((image) => image.src)).toEqual([
      "/pic/revenue-king/seagull/1.webp",
    ]);
  });

  test("vehicle model catalog leaves image fields empty when no verified gallery exists", async () => {
    const db = fakeD1({
      models: [{
        id: "MDL-NO-GALLERY",
        model_id: "MDL-NO-GALLERY",
        brand: "AVATR",
        MODEL: "Avatr 06",
        status: "Active",
      }],
    });
    const devSession = await handlePortalRequest(
      new Request("http://localhost/api/portal/dev-session", {
        method: "POST",
        body: JSON.stringify({ role: "admin" }),
      }),
      env(db),
    );
    const cookie = devSession.headers.get("set-cookie")?.split(";")[0];
    expect(cookie).toBeTruthy();

    const response = await handlePortalRequest(
      new Request("https://portal.example/api/portal/vehicle-models", { headers: { cookie: cookie! } }),
      env(db),
    );
    const payload = await response.json() as {
      vehicleModels: Array<{ imageUrl: string; galleryImages?: Array<{ src: string }> }>;
    };

    expect(response.status).toBe(200);
    expect(payload.vehicleModels[0]?.imageUrl).toBe("");
    expect(payload.vehicleModels[0]?.galleryImages).toEqual([]);
  });

  test("configured vehicle trims take precedence over inventory fallback", async () => {
    const db = fakeD1({
      models: [{
        id: "MDL-081",
        model_id: "MDL-081",
        brand: "Changan",
        MODEL: "Changan Eado EV",
        version: "2025 Model",
        status: "Active",
      }],
      trims: [{
        id: "TRIM-081-01",
        model_id: "MDL-081",
        trim_name: "Verified 550 MAX",
        status: "Verified",
        display_price_low: 20000,
        motor_torque_n_m: 310,
      }],
      vehicles: [{
        id: "vehicle-081",
        model_id: "MDL-081",
        细分型号: "Inventory-only trim",
      }],
    });
    const devSession = await handlePortalRequest(
      new Request("http://localhost/api/portal/dev-session", {
        method: "POST",
        body: JSON.stringify({ role: "admin" }),
      }),
      env(db),
    );
    const cookie = devSession.headers.get("set-cookie")?.split(";")[0];
    expect(cookie).toBeTruthy();

    const response = await handlePortalRequest(
      new Request("https://portal.example/api/portal/vehicle-models", { headers: { cookie: cookie! } }),
      env(db),
    );
    const payload = await response.json() as {
      vehicleModels: Array<{ id: string; trim: string }>;
      vehicleModelSpecs: Array<{ modelId: string; name: string }>;
    };

    expect(response.status).toBe(200);
    expect(payload.vehicleModels.map((model) => model.trim)).toEqual(["Verified 550 MAX"]);
    expect(payload.vehicleModels[0]?.id).toBe("TRIM-081-01");
    expect(payload.vehicleModelSpecs).toEqual(expect.arrayContaining([
      expect.objectContaining({ modelId: "TRIM-081-01", name: "版本名称", value: "Verified 550 MAX" }),
      expect.objectContaining({ modelId: "TRIM-081-01", name: "电机总扭矩", value: "310 N-m" }),
    ]));
  });

  test("vehicle models resolve trims through the parent record and hide image-list brochures", async () => {
    const db = fakeD1({
      models: [{
        id: "model-record-avatr-11",
        model_id: "AVATR-11",
        brand: "AVATR",
        MODEL: "Avatr 11",
        brochure_cover: "1.webp, 2.webp, 3.webp",
        status: "Active",
      }],
      trims: Array.from({ length: 6 }, (_, index) => ({
        id: `trim-avatr-11-${index + 1}`,
        model_id: "legacy-model-reference",
        parent_model_record_id: "model-record-avatr-11",
        trim_name: `Avatr 11 Trim ${index + 1}`,
        status: "Active",
      })),
    });
    const devSession = await handlePortalRequest(
      new Request("http://localhost/api/portal/dev-session", {
        method: "POST",
        body: JSON.stringify({ role: "admin" }),
      }),
      env(db),
    );
    const cookie = devSession.headers.get("set-cookie")?.split(";")[0];
    expect(cookie).toBeTruthy();

    const response = await handlePortalRequest(
      new Request("https://portal.example/api/portal/vehicle-models", { headers: { cookie: cookie! } }),
      env(db),
    );
    const payload = await response.json() as {
      vehicleModels: Array<{ trim: string; brochureUrl: string }>;
    };

    expect(response.status).toBe(200);
    expect(payload.vehicleModels).toHaveLength(6);
    expect(payload.vehicleModels.map((model) => model.trim)).toEqual([
      "Avatr 11 Trim 1",
      "Avatr 11 Trim 2",
      "Avatr 11 Trim 3",
      "Avatr 11 Trim 4",
      "Avatr 11 Trim 5",
      "Avatr 11 Trim 6",
    ]);
    expect(payload.vehicleModels.every((model) => model.brochureUrl === "")).toBe(true);
  });

  test("quote counter and accept use D1 and do not silently succeed without a quote", async () => {
    const db = fakeD1({ user: validUser });
    const cookie = await login(db);
    globalThis.fetch = (async () => {
      throw new Error("request-time Feishu call");
    }) as any;

    const counter = await handlePortalRequest(
      new Request("https://portal.example/api/portal/quotes/QUOTE-1/counter", {
        method: "POST",
        headers: { cookie, "content-type": "application/json" },
        body: JSON.stringify({ offeredPrice: 10000 }),
      }),
      env(db),
    );
    const accept = await handlePortalRequest(
      new Request("https://portal.example/api/portal/quotes/QUOTE-1/accept", {
        method: "POST",
        headers: { cookie },
      }),
      env(db),
    );

    expect(counter.status).toBe(404);
    expect(accept.status).toBe(404);
    expect(globalThis.fetch).toBeDefined();
  });

  test("quote counter and accept persist transactional changes in D1", async () => {
    const db = fakeD1({
      user: validUser,
      quotes: [{
        id: "quote-row",
        quote_no: "QUOTE-1",
        inquiry_no: "INQ-1",
        customer_id: "CUS-1",
        vehicle_id: "vehicle-1",
        price: 20000,
        status: "Active",
      }],
      inquiries: [{
        inquiry_no: "INQ-1",
        customer_id: "CUS-1",
      }],
    });
    const cookie = await login(db);
    globalThis.fetch = (async () => {
      throw new Error("request-time Feishu call");
    }) as any;

    const counter = await handlePortalRequest(
      new Request("https://portal.example/api/portal/quotes/QUOTE-1/counter", {
        method: "POST",
        headers: { cookie, "content-type": "application/json" },
        body: JSON.stringify({ offeredPrice: 19000, message: "Please confirm warranty." }),
      }),
      env(db),
    );
    const accept = await handlePortalRequest(
      new Request("https://portal.example/api/portal/quotes/QUOTE-1/accept", {
        method: "POST",
        headers: { cookie },
      }),
      env(db),
    );

    expect(counter.status).toBe(200);
    expect(accept.status).toBe(201);
    const sql = db.batches.flat().join("\n");
    expect(sql).toContain("INSERT INTO negotiations");
    expect(sql).toContain("UPDATE quotes");
    expect(sql).not.toContain("UPDATE inquiries");
    expect(sql).toContain("INSERT INTO orders");
  });

  test("creating an inquiry with an initial note uses one atomic D1 batch", async () => {
    const db = fakeD1({
      user: validUser,
      vehicles: [{
        id: "vehicle-1",
        brand: "BYD",
        model: "Seal",
        variant: "Performance",
      }],
    });
    const cookie = await login(db);

    const response = await handlePortalRequest(
      new Request("https://portal.example/api/portal/inquiries", {
        method: "POST",
        headers: { cookie, "content-type": "application/json" },
        body: JSON.stringify({
          vehicleId: "vehicle-1",
          quantity: 2,
          tradeTerm: "FOB",
          notes: "Please confirm delivery timing.",
        }),
      }),
      env(db),
    );

    expect(response.status).toBe(201);
    expect(db.batches).toHaveLength(1);
    expect(db.batches[0].filter((sql) => sql.includes("INSERT INTO")).length).toBe(3);
    expect(db.batches[0].some((sql) => sql.includes("inquiries"))).toBe(true);
    expect(db.batches[0].some((sql) => sql.includes("inquiry_participants"))).toBe(true);
    expect(db.batches[0].some((sql) => sql.includes("inquiry_notes"))).toBe(true);
  });

  test("only an administrator can close one comment, without changing or deleting its inquiry", async () => {
    const note = { note_id: "NOTE-1", inquiry_no: "INQ-1", body: "Please confirm delivery timing." };
    const adminDb = fakeD1({ user: { ...validUser, role: "admin", account_type: "internal" }, notes: [note] });
    const adminCookie = await login(adminDb);
    const response = await handlePortalRequest(
      new Request("https://portal.example/api/portal/inquiry-content/note/NOTE-1", {
        method: "DELETE",
        headers: { cookie: adminCookie, "content-type": "application/json" },
        body: JSON.stringify({ reason: "Off-topic" }),
      }),
      env(adminDb),
    );

    expect(response.status).toBe(200);
    const adminSql = adminDb.queries.join("\n");
    expect(adminSql).toContain("UPDATE inquiry_notes SET deleted_at");
    expect(adminSql).not.toContain("UPDATE inquiries SET status");
    expect(adminSql).not.toContain("DELETE FROM inquiries");

    const salesDb = fakeD1({ user: { ...validUser, role: "sales", account_type: "internal" }, notes: [note] });
    const salesCookie = await login(salesDb);
    const denied = await handlePortalRequest(
      new Request("https://portal.example/api/portal/inquiry-content/note/NOTE-1", { method: "DELETE", headers: { cookie: salesCookie } }),
      env(salesDb),
    );
    expect(denied.status).toBe(403);
  });
});
