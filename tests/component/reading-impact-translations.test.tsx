import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import am from "../../i18n/translations/am";
import zh from "../../i18n/translations/zh";
import { translateAutomotivePhrase } from "../../scripts/product-detail-i18n-data.mjs";

const requiredSpecLabels: Record<string, [string, string]> = {
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

describe("Component: UI Reading Impact & Specs Translations", () => {
  test("About logistics renders the translated feature array", async () => {
    const source = await readFile(new URL("../../views/about.tsx", import.meta.url), "utf8");
    expect(source).toMatch(/tArray\("about\.logistics\.features"\)/);
    expect(source).not.toMatch(/tArray\("about\.logistics\.items"\)/);
  });

  test("QR dropdown localizes its instruction while preserving WhatsApp", async () => {
    const source = await readFile(
      new URL("../../components/QrDropdown.tsx", import.meta.url),
      "utf8"
    );
    expect(source).toMatch(/useTranslation/);
    expect(source).toMatch(/t\("qr\.badge"/);
    expect(source).not.toMatch(/>\s*Scan to WhatsApp\s*</);
    expect(zh.qr.badge).toMatch(/WhatsApp/);
    expect(am.qr.badge).toMatch(/WhatsApp/);
  });

  test("vehicle detail spec labels are readable in Chinese and Amharic", () => {
    for (const [label, [expectedZh, expectedAm]] of Object.entries(requiredSpecLabels)) {
      expect(zh.specs[label as keyof typeof zh.specs]).toBe(expectedZh);
      expect(am.specs[label as keyof typeof am.specs]).toBe(expectedAm);
    }
  });

  test("common Geely Geome detail values do not retain untranslated English words", () => {
    expect(translateAutomotivePhrase("Rear motor RWD", "zh")).toBe("后置电机 RWD");
    expect(translateAutomotivePhrase("Rear motor RWD", "am")).toBe("የኋላ ሞተር RWD");
    expect(translateAutomotivePhrase("Hatchback (Sub-Compact)", "zh")).toBe("两厢车（次紧凑型）");
    expect(translateAutomotivePhrase("Hatchback (Sub-Compact)", "am")).toBe("ሃችባክ (ንዑስ ኮምፓክት)");
  });
});
