import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { handlePortalRequest } from "../../server/api/portal";

type Row = Record<string, unknown>;

function fakeD1(tables: Record<string, Row[]> = {}) {
  let inserts = 0;
  const db = {
    prepare(sql: string) {
      const table = sql.match(/\bFROM\s+([a-z_]+)/i)?.[1] ?? "";
      let bound: unknown[] = [];
      const statement = {
        bind(...values: unknown[]) {
          bound = values;
          return statement;
        },
        async all<T>() {
          const rows = tables[table] ?? [];
          if (/slug\s*=\s*\?/i.test(sql)) {
            return { results: rows.filter((row) => row.slug === bound[0]) as T[] };
          }
          if (/model_id\s*=\s*\?/i.test(sql)) {
            return { results: rows.filter((row) => row.model_id === bound[0]) as T[] };
          }
          return { results: rows as T[] };
        },
        async first<T>() {
          const result = await statement.all<T>();
          return result.results[0] ?? null;
        },
        async run() {
          if (/INSERT INTO public_contact_submissions/i.test(sql)) inserts += 1;
          return { success: true, meta: {} };
        },
      };
      return statement;
    },
    get inserts() {
      return inserts;
    },
  };
  return db as unknown as D1Database & { inserts: number };
}

const env = (db: D1Database) => ({ PORTAL_DB: db });

async function get(path: string, db: D1Database) {
  return handlePortalRequest(new Request(`http://localhost${path}`), env(db));
}

describe("public portal routes", () => {
  test("public routing block does not call Feishu or legacy baseline helpers", () => {
    const source = readFileSync(new URL("../../server/api/portal.ts", import.meta.url), "utf8");
    const start = source.indexOf('if (path.startsWith("/api/portal/public/"))');
    const end = source.indexOf('if (path === "/api/portal/webhook/sync"', start);
    const publicBlock = source.slice(start, end);
    expect(publicBlock).not.toMatch(/getBaselineVehicleModels|getBaselineArticles|getBaselineAcademy|searchRecords|feishuRequest/);
  });

  test("empty D1 products still return complete static cards without network fallback", async () => {
    const db = fakeD1({ vehicle_models: [], vehicle_trims: [] });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      throw new Error("public route made an unexpected network request");
    };

    try {
      const response = await get("/api/portal/public/products", db);
      const products = await response.json() as Array<Record<string, unknown>>;
      expect(response.status).toBe(200);
      expect(products.length).toBeGreaterThan(0);
      expect(products[0]).toMatchObject({
        slug: expect.any(String),
        brand: expect.any(String),
        name: expect.any(String),
        img: expect.stringMatching(/^\/pic\//),
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test("unknown public details return explicit 404 responses", async () => {
    const db = fakeD1({
      vehicle_models: [],
      vehicle_trims: [],
      articles: [],
      academy_lessons: [],
      academy_vault: [],
    });

    for (const path of [
      "/api/portal/public/products/not-a-product",
      "/api/portal/public/insights/not-an-insight",
      "/api/portal/public/academy/workshop/not-a-lesson",
    ]) {
      const response = await get(path, db);
      expect(response.status).toBe(404);
    }
  });

  test("public insight and academy payloads contain only normalized public assets", async () => {
    const db = fakeD1({
      vehicle_models: [],
      vehicle_trims: [],
      articles: [],
      academy_lessons: [{
        title: "Custom lesson",
        category: "technical-workshop",
        slug: "custom-lesson",
        description: "Description",
        content: "Content",
        cover_image: "hero.webp",
      }],
      academy_vault: [],
    });

    const insights = await (await get("/api/portal/public/insights", db)).json() as unknown;
    const academy = await (await get("/api/portal/public/academy", db)).json() as {
      lessons: Record<string, Array<Record<string, unknown>>>;
    };
    const serialized = JSON.stringify({ insights, academy });
    expect(serialized).not.toContain("feishu");
    expect(serialized).not.toContain("hero.webp");
    for (const lessons of Object.values(academy.lessons)) {
      for (const lesson of lessons) expect(lesson.img).toMatch(/^\/pic\//);
    }
  });

  test("contact rejects invalid payloads and inserts valid submissions exactly once", async () => {
    const db = fakeD1();
    const invalid = await handlePortalRequest(
      new Request("http://localhost/api/portal/public/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: " ", company: "Acme", email: "bad" }),
      }),
      env(db),
    );
    expect(invalid.status).toBe(400);

    const valid = await handlePortalRequest(
      new Request("http://localhost/api/portal/public/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: " Jane Doe ",
          company: " Acme ",
          email: "jane@example.com",
          phone: " +1 555 ",
          message: " Hello ",
        }),
      }),
      env(db),
    );
    expect(valid.status).toBe(200);
    expect(await valid.json()).toEqual({ ok: true });
    expect(db.inserts).toBe(1);
  });

  test("contact insert failures are not reported as success", async () => {
    const db = {
      prepare(sql: string) {
        if (!/public_contact_submissions/i.test(sql)) throw new Error(`unexpected query: ${sql}`);
        const statement = {
          bind() {
            return statement;
          },
          async run() {
            throw new Error("insert failed");
          },
        };
        return statement;
      },
    } as unknown as D1Database;

    const response = await handlePortalRequest(
      new Request("http://localhost/api/portal/public/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Jane", company: "Acme", email: "jane@example.com" }),
      }),
      env(db),
    );
    expect(response.status).toBe(500);
    expect(await response.json()).not.toEqual({ ok: true });
  });
});
