import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

test("portal module selection does not read the browser URL during its hydration state initializer", async () => {
  const source = await readFile(new URL("../../app/portal/page.tsx", import.meta.url), "utf8");
  const start = source.indexOf("const [activeAdminModule, setActiveAdminModule]");
  const end = source.indexOf("\n", start);
  const initializer = source.slice(start, end);

  expect(initializer).toContain('useState<AdminModule>("dashboard")');
  expect(initializer).not.toContain("window.location");
  expect(source).toContain("const syncFromUrl = () =>");
  expect(source).toContain("syncFromUrl();");
});
