import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Ethiopia logistics steps are normalized as an array before mapping", async () => {
  const source = await readFile(
    new URL("../views/markets/ethiopia.tsx", import.meta.url),
    "utf8",
  );

  assert.match(
    source,
    /const localSteps = tArray\("marketsEthiopia\.logistics\.steps"\)/,
  );
  assert.doesNotMatch(
    source,
    /t\("marketsEthiopia\.logistics\.steps"\) as any\[\]/,
  );
});
