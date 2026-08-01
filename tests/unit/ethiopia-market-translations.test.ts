import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

describe("Unit: Ethiopia Market Translation Helpers", () => {
  test("Ethiopia logistics steps are normalized as an array before mapping", async () => {
    const source = await readFile(
      new URL("../../views/markets/ethiopia.tsx", import.meta.url),
      "utf8"
    );

    expect(source).toMatch(/const localSteps = tArray\("marketsEthiopia\.logistics\.steps"\)/);
    expect(source).not.toMatch(/t\("marketsEthiopia\.logistics\.steps"\) as any\[\]/);
  });
});
