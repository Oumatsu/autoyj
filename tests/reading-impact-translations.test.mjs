import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import am from "../i18n/translations/am.ts";
import zh from "../i18n/translations/zh.ts";
import { translateAutomotivePhrase } from "../scripts/product-detail-i18n-data.mjs";

const requiredSpecLabels = {
  "Guide Price": ["参考价格", "መመሪያ ዋጋ"],
  Drivetrain: ["驱动形式", "የአንቀሳቃሽ አይነት"],
  "Motor Power": ["电机功率", "የሞተር ኃይል"],
  "Battery Chemistry": ["电池化学体系", "የባትሪ ኬሚስትሪ"],
  "Household Charging": ["家用充电", "የቤት መሙላት"],
  "Vehicle Class": ["车辆级别", "የተሽከርካሪ ምድብ"],
  Dimensions: ["车身尺寸", "የተሽከርካሪ መጠኖች"],
  "Ground Clearance": ["离地间隙", "የመሬት ክፍተት"],
  "Boot Volume": ["后备厢容积", "የሻንጣ ክፍል መጠን"],
  Seats: ["座位数", "የመቀመጫ ብዛት"],
  "Battery Warranty": ["电池质保", "የባትሪ ዋስትና"],
  Steering: ["方向盘位置", "የመሪ አቀማመጥ"],
};

test("About logistics renders the translated feature array", async () => {
  const source = await readFile(new URL("../views/about.tsx", import.meta.url), "utf8");
  assert.match(source, /tArray\("about\.logistics\.features"\)/);
  assert.doesNotMatch(source, /tArray\("about\.logistics\.items"\)/);
});

test("QR dropdown localizes its instruction while preserving WhatsApp", async () => {
  const source = await readFile(new URL("../components/QrDropdown.tsx", import.meta.url), "utf8");
  assert.match(source, /useTranslation/);
  assert.match(source, /t\("qr\.badge"/);
  assert.doesNotMatch(source, />\s*Scan to WhatsApp\s*</);
  assert.match(zh.qr.badge, /WhatsApp/);
  assert.match(am.qr.badge, /WhatsApp/);
});

test("vehicle detail spec labels are readable in Chinese and Amharic", () => {
  for (const [label, [expectedZh, expectedAm]] of Object.entries(requiredSpecLabels)) {
    assert.equal(zh.specs[label], expectedZh, `Chinese: ${label}`);
    assert.equal(am.specs[label], expectedAm, `Amharic: ${label}`);
  }
});

test("common Geely Geome detail values do not retain untranslated English words", () => {
  assert.equal(translateAutomotivePhrase("Rear motor RWD", "zh"), "后置电机 RWD");
  assert.equal(translateAutomotivePhrase("Rear motor RWD", "am"), "የኋላ ሞተር RWD");
  assert.equal(translateAutomotivePhrase("Hatchback (Sub-Compact)", "zh"), "两厢车（次紧凑型）");
  assert.equal(translateAutomotivePhrase("Hatchback (Sub-Compact)", "am"), "ሃችባክ (ንዑስ ኮምፓክት)");
});
