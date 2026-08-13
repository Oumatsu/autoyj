import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import { runFeishuScheduledSync, FeishuSyncRunError } from "../../server/jobs/feishu-sync";
import type { PortalEnv as Env } from "../../server/types";

type FakeStatement = {
  sql: string;
  values?: unknown[];
  bind: (...values: unknown[]) => FakeStatement;
  first: <T>() => Promise<T | null>;
  all: () => Promise<{ results: Array<{ name: string; type: string; pk: number }> }>;
  run: () => Promise<{ success: boolean; meta?: { changes: number } }>;
};

class FakeD1 {
  batches: string[][] = [];
  batchValues: unknown[][][] = [];
  executed: string[] = [];
  columns = new Map<string, Array<{ name: string; type: string; pk: number }>>();

  prepare(sql: string): FakeStatement {
    const statement: FakeStatement = {
      sql,
      values: [] as unknown[],
      bind: (...values: unknown[]) => ({ ...statement, values }),
      first: async <T>() => null as T | null,
      all: async () => {
        const tableName = sql.match(/PRAGMA table_info\("([^"]+)"\)/)?.[1];
        return {
          results: tableName
            ? (this.columns.get(tableName) ?? [{ name: "id", type: "TEXT", pk: 1 }])
            : [{ name: "id", type: "TEXT", pk: 1 }],
        };
      },
      run: async () => {
        this.executed.push(sql);
        const alterMatch = sql.match(/ALTER TABLE "([^"]+)" ADD COLUMN "([^"]+)" (\w+)/);
        if (alterMatch) {
          const [, tableName, columnName, type] = alterMatch;
          const tableColumns = this.columns.get(tableName) ?? [{ name: "id", type: "TEXT", pk: 1 }];
          if (!tableColumns.some((column) => column.name === columnName)) {
            tableColumns.push({ name: columnName, type, pk: 0 });
            this.columns.set(tableName, tableColumns);
          }
        }
        return { success: true, meta: { changes: 1 } };
      },
    };
    return statement;
  }

  async batch(statements: FakeStatement[]) {
    this.batches.push(statements.map((statement) => statement.sql));
    this.batchValues.push(statements.map((statement) => statement.values ?? []));
    return statements.map(() => ({ success: true }));
  }
}

function makeFeishuEnv(db: FakeD1, overrides: Record<string, unknown> = {}) {
  return {
    PORTAL_DB: db as unknown as D1Database,
    FEISHU_BASE_APP_TOKEN: "base-token",
    FEISHU_APP_ID: "test-app-id",
    FEISHU_APP_SECRET: "test-app-secret",
    FEISHU_BASE_ID: "test-base-id",
    FEISHU_TABLE_MODELS: "models-table",
    FEISHU_TABLE_VEHICLE_MODELS: "models-table",
    FEISHU_TABLE_VEHICLE_TRIM_CONFIGURATIONS: "trims-table",
    FEISHU_TABLE_VEHICLES: "vehicles-table",
    FEISHU_TABLE_ARTICLES: "articles-table",
    FEISHU_TABLE_ACADEMY_LESSONS: "lessons-table",
    FEISHU_TABLE_ACADEMY_VAULT: "vault-table",
    ENVIRONMENT: "test",
    ...overrides,
  } as unknown as Env;
}

function mockFeishuFetch(recordsByTable: Record<string, unknown[]>, status = 200) {
  return mock((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("auth/v3/tenant_access_token")) {
      return Promise.resolve(new Response(JSON.stringify({ code: 0, tenant_access_token: "mock-token", expire: 7200 })));
    }
    const table = Object.keys(recordsByTable).find((tableId) => url.includes(`/tables/${tableId}/`));
    if (status !== 200) {
      return Promise.resolve(new Response(JSON.stringify({ code: status, msg: "Feishu API Error" }), { status }));
    }
    return Promise.resolve(new Response(JSON.stringify({
      code: 0,
      msg: "ok",
      data: { items: table ? recordsByTable[table] : [], total: table ? recordsByTable[table].length : 0 },
    }), { status: 200 }));
  });
}

const mockValidRecords = {
  "models-table": [{ record_id: "model-rec-1", fields: { model_id: "MDL-1", brand: "BYD", model: "Han" } }],
  "trims-table": [{ record_id: "trim-rec-1", fields: { trim_config_id: "MDL-1-TRIM-1", model_id: "MDL-1", trim_name: "Flagship" } }],
  "vehicles-table": [{ record_id: "veh-rec-1", fields: { FOB美金价: 30000, stage: "Available" } }],
  "articles-table": [{ record_id: "art-rec-1", fields: { slug: "test-article", title: "Test Article", content: "Body" } }],
  "lessons-table": [{ record_id: "les-rec-1", fields: { slug: "test-lesson", title: "Test Lesson" } }],
  "vault-table": [{ record_id: "vlt-rec-1", fields: { title: "Test Vault Item" } }],
};

describe("runFeishuScheduledSync full integration", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("returns result object with all count fields on full sync success", async () => {
    globalThis.fetch = mockFeishuFetch(mockValidRecords) as unknown as typeof globalThis.fetch;
    const db = new FakeD1();
    const env = makeFeishuEnv(db);

    const result = await runFeishuScheduledSync(env);

    expect(typeof result.models).toBe("number");
    expect(typeof result.trims).toBe("number");
    expect(typeof result.vehicles).toBe("number");
    expect(typeof result.users).toBe("number");
    expect(typeof result.articles).toBe("number");
    expect(typeof result.lessons).toBe("number");
    expect(typeof result.vault).toBe("number");
    expect(typeof result.elapsed).toBe("number");

    expect(result.models).toBe(1);
    expect(result.trims).toBe(1);
    expect(result.vehicles).toBe(1);
    expect(result.users).toBeGreaterThan(0);
    expect(result.articles).toBe(1);
    expect(result.lessons).toBe(1);
    expect(result.vault).toBe(1);
    expect(result.elapsed).toBeGreaterThanOrEqual(0);
  });

  test("throws FeishuSyncRunError when fetch fails for all endpoints", async () => {
    globalThis.fetch = mock(() => Promise.reject(new Error("Network failure"))) as unknown as typeof globalThis.fetch;
    const db = new FakeD1();
    const env = makeFeishuEnv(db);

    await expect(runFeishuScheduledSync(env)).rejects.toThrow(FeishuSyncRunError);
  });

  test("FeishuSyncRunError contains failing table names and messages", async () => {
    globalThis.fetch = mock(() => Promise.reject(new Error("Timeout failure"))) as unknown as typeof globalThis.fetch;
    const db = new FakeD1();
    const env = makeFeishuEnv(db);

    try {
      await runFeishuScheduledSync(env);
    } catch (error) {
      expect(error).toBeInstanceOf(FeishuSyncRunError);
      const syncError = error as FeishuSyncRunError;
      expect(syncError.errors.length).toBeGreaterThan(0);
      expect(syncError.errors[0]).toHaveProperty("table");
      expect(syncError.errors[0]).toHaveProperty("message");
      expect(syncError.errors.map((e) => e.table)).toContain("vehicle models/trims");
      expect(syncError.errors.map((e) => e.table)).toContain("vehicles");
      expect(syncError.errors.map((e) => e.table)).toContain("articles");
      expect(syncError.errors.map((e) => e.table)).toContain("academy lessons/vault");
    }
  });

  test("partial failure records specific failing table error while other tables complete", async () => {
    // Fail only articles-table, valid for others
    const recordsWithPartialError = {
      ...mockValidRecords,
      "articles-table": [], // Empty snapshot throws for articles
    };

    globalThis.fetch = mockFeishuFetch(recordsWithPartialError) as unknown as typeof globalThis.fetch;
    const db = new FakeD1();
    const env = makeFeishuEnv(db);

    try {
      await runFeishuScheduledSync(env);
    } catch (error) {
      expect(error).toBeInstanceOf(FeishuSyncRunError);
      const syncError = error as FeishuSyncRunError;
      expect(syncError.errors.length).toBe(1);
      expect(syncError.errors[0].table).toBe("articles");
      expect(syncError.errors[0].message).toContain("articles: empty Feishu snapshot rejected");
    }
  });
});
