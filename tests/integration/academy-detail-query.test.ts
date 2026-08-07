import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

describe("Integration: Academy Detail Query & Feishu Handler", () => {
  test("Academy lesson detail queries D1 database without runtime Feishu calls", async () => {
    const source = await readFile(new URL("../../server/api/portal.ts", import.meta.url), "utf8");
    const match = source.match(
      /async function handlePublicAcademyLesson\([\s\S]*?(?=export async function handleScheduledSync)/
    );

    expect(match).toBeTruthy();
    const handler = match![0];

    expect(handler).not.toMatch(/searchRecords/);
    expect(handler).toMatch(/readPublicContent\(request, env/);
    expect(handler).toMatch(/getPublicAcademyLesson/);
    expect(handler).not.toMatch(/getBaselineAcademy\(\)/);
  });
});
