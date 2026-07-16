import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Academy lesson detail avoids the invalid Feishu slug filter and finds the published lesson locally", async () => {
  const source = await readFile(new URL("../worker/portal.ts", import.meta.url), "utf8");
  const match = source.match(
    /async function handlePublicAcademyLesson\([\s\S]*?(?=export async function handlePortalRequest)/,
  );

  assert.ok(match, "handlePublicAcademyLesson source block should exist");
  const handler = match[0];

  assert.doesNotMatch(handler, /equalsFilter\("slug", slug\)/);
  assert.match(handler, /searchRecords\(env, lessonsTableId, \{\s*pageSize: 100\s*\}\)/);
  assert.match(handler, /asText\(r\.fields\.slug\) === slug/);
  assert.match(handler, /asText\(r\.fields\.status\) === "Published"/);
  assert.match(handler, /normalizeAcademyCategory\(asText\(r\.fields\.category\)\)/);
});
