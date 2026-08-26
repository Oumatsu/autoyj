import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

test("the inquiry workspace exposes staff-only participant management with add and remove actions", async () => {
  const source = await readFile(new URL("../../app/portal/page.tsx", import.meta.url), "utf8");

  expect(source).toContain("Manage participants");
  expect(source).toContain("/participants");
  expect(source).toContain("Add participant");
  expect(source).toContain("Remove participant");
});
