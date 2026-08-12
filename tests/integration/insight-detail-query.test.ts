import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

describe("Integration: Insight Detail Query Handler", () => {
  test("Insight detail queries D1 database without runtime Feishu calls", async () => {
    const source = await readFile(new URL("../../server/api/portal.ts", import.meta.url), "utf8");
    const match = source.match(
      /async function handlePublicInsight\([\s\S]*?(?=function getBaselineAcademy\()/
    );

    expect(match).toBeTruthy();
    const handler = match![0];

    expect(handler).not.toMatch(/searchRecords/);
    expect(handler).toMatch(/readPublicContent\(\s*request,\s*env/);
    expect(handler).toMatch(/getPublicInsight/);
  });
});
