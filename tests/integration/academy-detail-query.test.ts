import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

describe("Integration: Academy Detail Query & Feishu Handler", () => {
  test("Academy lesson detail avoids the invalid Feishu slug filter and finds the published lesson locally", async () => {
    const source = await readFile(new URL("../../worker/portal.ts", import.meta.url), "utf8");
    const match = source.match(
      /async function handlePublicAcademyLesson\([\s\S]*?(?=export async function handlePortalRequest)/
    );

    expect(match).toBeTruthy();
    const handler = match![0];

    expect(handler).not.toMatch(/equalsFilter\("slug", slug\)/);
    expect(handler).toMatch(/searchRecords\(env, lessonsTableId, \{\s*pageSize: 100\s*\}\)/);
    expect(handler).toMatch(/asText\(r\.fields\.slug\) === slug/);
    expect(handler).toMatch(/asText\(r\.fields\.status\) === "Published"/);
    expect(handler).toMatch(/normalizeAcademyCategory\(asText\(r\.fields\.category\)\)/);
  });
});
