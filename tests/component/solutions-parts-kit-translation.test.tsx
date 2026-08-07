import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import zh from "../../i18n/translations/zh";

const expectedChineseKitItems = [
  { name: "刹车片（整套）", qty: "× 2" },
  { name: "HEPA 空调滤芯", qty: "× 4" },
  { name: "雨刮片套装", qty: "× 2" },
  { name: "12V 辅助蓄电池", qty: "× 1" },
  { name: "Type 2 充电线", qty: "× 1" },
  { name: "OBD2 诊断工具", qty: "× 1" },
];

describe("Component: Solutions Parts Kit Component Contract", () => {
  test("Chinese solutions parts kit matches the rendered name/qty contract", () => {
    const kitItemsArray = Object.values(zh.solutions.partsKit.kitItems);
    expect(kitItemsArray).toEqual(expectedChineseKitItems);
  });

  test("solutions page normalizes parts kit translations as an array", async () => {
    const source = await readFile(
      new URL("../../views/solutions.tsx", import.meta.url),
      "utf8"
    );

    expect(source).toMatch(/const kitItems = tArray\("solutions\.partsKit\.kitItems"\)/);
  });
});
