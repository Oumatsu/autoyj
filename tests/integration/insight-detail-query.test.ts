import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

describe("Integration: Insight Detail Query Handler", () => {
  test("Insight detail reads Feishu records without the invalid list-records filter", async () => {
    const source = await readFile(new URL("../../worker/portal.ts", import.meta.url), "utf8");
    const match = source.match(
      /async function handlePublicInsight\([\s\S]*?(?=async function handlePublicAcademy\()/
    );

    expect(match).toBeTruthy();
    const handler = match![0];

    expect(handler).not.toMatch(/equalsFilter\("slug", slug\)/);
    expect(handler).toMatch(/searchRecords\(env, articlesTableId, \{\s*pageSize: 100\s*\}\)/);
    expect(handler).toMatch(/records\.find/);
    expect(handler).toMatch(/asText\(r\.fields\.slug\) === slug/);
    expect(handler).toMatch(/asText\(r\.fields\.status\) === "Published"/);
  });
});
