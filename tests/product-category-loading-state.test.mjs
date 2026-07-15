import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const categoryPages = [
  "views/products/revenue-king.tsx",
  "views/products/elite-flagship.tsx",
  "views/products/utility-pro.tsx",
];

for (const page of categoryPages) {
  test(`${page} never renders static vehicles before the API resolves`, async () => {
    const source = await readFile(new URL(`../${page}`, import.meta.url), "utf8");

    assert.match(source, /ProductCatalogSkeleton/);
    assert.match(source, /ProductCatalogUnavailable/);
    assert.match(source, /useState<[^>]*"loading"[^>]*>\("loading"\)/);
    assert.match(source, /loadState === "loading"/);
    assert.match(source, /loadState === "error"/);
    assert.match(source, /setLoadState\("ready"\)/);
    assert.match(source, /setLoadState\("error"\)/);
    assert.doesNotMatch(source, /products\s*\|\|\s*vehicles/);
    assert.match(source, /buildCatalogFilterGroups/);
    assert.match(source, /filterCatalogProducts/);
    assert.match(source, /filterGroups\.map/);
    assert.doesNotMatch(source, /v\.tags\.some/);
  });
}
