import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

describe("request-time Feishu boundary", () => {
  test("manual admin sync endpoint cannot invoke Feishu from the request handler", async () => {
    const source = await readFile(new URL("../../server/index.ts", import.meta.url), "utf8");
    const fetchHandler = source.slice(source.indexOf("async fetch("), source.indexOf("async scheduled("));

    expect(fetchHandler).not.toContain("runFeishuScheduledSync");
    expect(fetchHandler).toContain("/api/admin/sync-now");
    expect(fetchHandler).toContain("Manual sync is disabled");
    expect(source.slice(source.indexOf("async scheduled("))).toContain("runFeishuScheduledSync");
  });

  test("portal webhook sync-d1 is disabled outside scheduled cron", async () => {
    const source = await readFile(new URL("../../server/api/portal.ts", import.meta.url), "utf8");
    const start = source.indexOf('if (path === "/api/portal/webhook/sync-d1"');
    const end = source.indexOf('if (path.startsWith("/api/auth/"))', start);
    const webhookBlock = source.slice(start, end);

    expect(webhookBlock).not.toContain("runFeishuScheduledSync");
    expect(webhookBlock).toContain("Request-time Feishu sync is disabled");
  });

  test("formal login has no localUserStore fallback while dev login retains it", async () => {
    const source = await readFile(new URL("../../server/api/portal.ts", import.meta.url), "utf8");
    const loginStart = source.indexOf("async function findLoginAccount");
    const loginEnd = source.indexOf("async function requireSession", loginStart);
    const loginBlock = source.slice(loginStart, loginEnd);

    expect(loginBlock).not.toMatch(/findLocalUser|localUserStore|searchRecords|FEISHU_TABLE/);
    expect(source.slice(source.indexOf("async function handleDevLogin"), source.indexOf("async function handleBootstrap"))).toContain("findLocalUser");
  });
});
