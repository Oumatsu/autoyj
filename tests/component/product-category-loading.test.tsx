import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

const categoryPages = [
  "views/products/revenue-king.tsx",
  "views/products/elite-flagship.tsx",
  "views/products/utility-pro.tsx",
];

describe("Component: Product Category Loading & Skeleton Guards", () => {
  for (const page of categoryPages) {
    test(`${page} renders skeleton state and guards against premature vehicle fallback`, async () => {
      const source = await readFile(new URL(`../../${page}`, import.meta.url), "utf8");

      expect(source).toMatch(/ProductCatalogSkeleton/);
      expect(source).toMatch(/ProductCatalogUnavailable/);
      expect(source).toMatch(/useState<[^>]*"loading"[^>]*>\("loading"\)/);
      expect(source).toMatch(/loadState === "loading"/);
      expect(source).toMatch(/loadState === "error"/);
      expect(source).toMatch(/setLoadState\("ready"\)/);
      expect(source).toMatch(/setLoadState\("error"\)/);
      expect(source).not.toMatch(/products\s*\|\|\s*vehicles/);
      expect(source).toMatch(/buildCatalogFilterGroups/);
      expect(source).toMatch(/filterCatalogProducts/);
      expect(source).toMatch(/filterGroups\.map/);
    });
  }
});
