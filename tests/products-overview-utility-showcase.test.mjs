import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the products overview keeps all three Utility Pro showcase vehicles", async () => {
  const source = await readFile(
    new URL("../views/products.tsx", import.meta.url),
    "utf8",
  );

  assert.match(
    source,
    /\["byd-shark", "radar-rd6", "farizon-xingxiang-v"\]/,
  );
  assert.match(source, /\/products\/utility-pro\/farizon-xingxiang-v/);
  assert.doesNotMatch(source, /farizon-super-van/);
});
