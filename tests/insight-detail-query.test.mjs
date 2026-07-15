import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Insight detail reads Feishu records without the invalid list-records filter", async () => {
  const source = await readFile(new URL("../worker/portal.ts", import.meta.url), "utf8");
  const match = source.match(
    /async function handlePublicInsight\([\s\S]*?(?=async function handlePublicAcademy\()/,
  );

  assert.ok(match, "handlePublicInsight source block should exist");
  const handler = match[0];

  assert.doesNotMatch(handler, /equalsFilter\("slug", slug\)/);
  assert.match(handler, /searchRecords\(env, articlesTableId, \{\s*pageSize: 100\s*\}\)/);
  assert.match(handler, /records\.find/);
  assert.match(handler, /asText\(r\.fields\.slug\) === slug/);
  assert.match(handler, /asText\(r\.fields\.status\) === "Published"/);
});
