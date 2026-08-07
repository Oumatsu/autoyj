import { afterEach, describe, expect, test } from "bun:test";
import { searchRecords, syncArticlesToD1, syncVehiclesToD1 } from "../../server/api/portal";
import { FeishuSyncRunError, runFeishuScheduledSync } from "../../server/jobs/feishu-sync";

type FakeStatement = {
  sql: string;
  values?: unknown[];
  bind: (...values: unknown[]) => FakeStatement;
  all: () => Promise<{ results: Array<{ name: string; type: string; pk: number }> }>;
  run: () => Promise<{ success: true }>;
};

class FakeD1 {
  batches: string[][] = [];
  executed: string[] = [];

  prepare(sql: string): FakeStatement {
    const statement: FakeStatement = {
      sql,
      bind: (...values) => ({ ...statement, values }),
      all: async () => ({ results: [{ name: "id", type: "TEXT", pk: 1 }] }),
      run: async () => {
        this.executed.push(sql);
        return { success: true };
      },
    };
    return statement;
  }

  async batch(statements: FakeStatement[]) {
    this.batches.push(statements.map((statement) => statement.sql));
    return statements.map(() => ({ success: true }));
  }
}

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function env(db: FakeD1, overrides: Record<string, string> = {}) {
  return {
    PORTAL_DB: db,
    FEISHU_API_URL: "http://localhost:8787",
    FEISHU_BASE_APP_TOKEN: "base-token",
    FEISHU_TABLE_VEHICLES: "vehicles-table",
    FEISHU_TABLE_ARTICLES: "articles-table",
    FEISHU_TABLE_VEHICLE_MODELS: "models-table",
    FEISHU_TABLE_VEHICLE_TRIM_CONFIGURATIONS: "trims-table",
    FEISHU_TABLE_ACADEMY_LESSONS: "lessons-table",
    FEISHU_TABLE_ACADEMY_VAULT: "vault-table",
    ...overrides,
  } as any;
}

function mockFeishu(recordsByTable: Record<string, unknown[]>, status = 200) {
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    const table = Object.keys(recordsByTable).find((tableId) => url.includes(`/tables/${tableId}/`));
    return new Response(JSON.stringify({
      code: status === 200 ? 0 : 1,
      msg: status === 200 ? "ok" : "upstream failure",
      data: { items: table ? recordsByTable[table] : [] },
    }), { status });
  }) as typeof fetch;
}

describe("Feishu sync safety", () => {
  test("failed Feishu fetch leaves existing rows untouched", async () => {
    const db = new FakeD1();
    mockFeishu({}, 503);

    await expect(syncVehiclesToD1(env(db))).rejects.toThrow("Feishu API failed");
    expect(db.batches).toHaveLength(0);
  });

  test("empty, malformed, and duplicate snapshots are rejected before DELETE", async () => {
    const cases = [
      [],
      [{ record_id: "", fields: {} }],
      [
        { record_id: "rec-1", fields: { slug: "same" } },
        { record_id: "rec-2", fields: { slug: "same" } },
      ],
    ];

    for (const records of cases) {
      const db = new FakeD1();
      mockFeishu({ "articles-table": records });
      await expect(syncArticlesToD1(env(db))).rejects.toThrow();
      expect(db.batches).toHaveLength(0);
    }
  });

  test("valid snapshot uses one atomic batch with DELETE first", async () => {
    const db = new FakeD1();
    mockFeishu({
      "articles-table": [{ record_id: "rec-1", fields: { slug: "first-article", title: "First" } }],
    });

    await expect(syncArticlesToD1(env(db))).resolves.toEqual({ articles: 1 });
    expect(db.batches).toHaveLength(1);
    expect(db.batches[0][0]).toContain("DELETE FROM");
    expect(db.batches[0].some((sql) => sql.includes("INSERT INTO"))).toBe(true);
  });

  test("missing Feishu config fails instead of clearing", async () => {
    const db = new FakeD1();
    await expect(syncVehiclesToD1(env(db, { FEISHU_BASE_APP_TOKEN: "" }))).rejects.toThrow("FEISHU_BASE_APP_TOKEN");
    expect(db.batches).toHaveLength(0);
  });

  test("retries transient Feishu data preparation failures", async () => {
    let attempts = 0;
    globalThis.fetch = (async () => {
      attempts++;
      if (attempts === 1) {
        return new Response(JSON.stringify({
          code: 1254003,
          msg: "Data not ready, please try again later",
          data: {},
        }), { status: 200 });
      }
      return new Response(JSON.stringify({
        code: 0,
        msg: "success",
        data: { items: [{ record_id: "rec-1", fields: { name: "ready" } }] },
      }), { status: 200 });
    }) as typeof fetch;

    await expect(searchRecords(env(new FakeD1()), "table-id", {
      pageSize: 10,
      maxPages: 1,
      requireConfig: true,
    })).resolves.toHaveLength(1);
    expect(attempts).toBe(2);
  });

  test("normalizes duplicate-marked trim model IDs", async () => {
    const db = new FakeD1();
    mockFeishu({
      "models-table": [{
        record_id: "model-record-020",
        fields: { model_id: "MDL-020", brand: "BYD", model: "Song Plus" },
      }],
      "trims-table": [{
        record_id: "trim-record-020-1",
        fields: {
          trim_config_id: "MDL-020-5425-2",
          model_id: "DUPLICATE:MDL-020",
          trim: "690km Qiyue Edition 7-seat",
        },
      }],
    });

    const { syncVehicleModelsToDB } = await import("../../server/api/portal");
    await expect(syncVehicleModelsToDB(env(db))).resolves.toEqual({ models: 1, trims: 1 });
    expect(db.batches).toHaveLength(1);
    expect(db.executed.some((sql) => sql.includes('ADD COLUMN "trim_name"'))).toBe(true);
  });

  test("cron rejects with structured failures instead of zero-count success", async () => {
    const db = new FakeD1();
    await expect(runFeishuScheduledSync(env(db, { FEISHU_BASE_APP_TOKEN: "" }))).rejects.toBeInstanceOf(FeishuSyncRunError);

    try {
      await runFeishuScheduledSync(env(db, { FEISHU_BASE_APP_TOKEN: "" }));
    } catch (error) {
      expect(error).toBeInstanceOf(FeishuSyncRunError);
      expect((error as FeishuSyncRunError).errors.length).toBeGreaterThan(0);
      expect((error as FeishuSyncRunError).message).toContain("failed");
    }
  });
});
