import { expect, test } from "bun:test";
import { localizeVehicleValue } from "@/lib/portal-english";

test("Amharic model configuration values localize common English feature text", () => {
  expect(localizeVehicleValue("Front motor FWD / 150.0 kW", "am")).toBe("የፊት ሞተር የፊት ጎማ አንቀሳቃሽ / 150.0 kW");
  expect(localizeVehicleValue("Driver Assistance Level: L2", "am")).toBe("የአሽከርካሪ ረዳት ደረጃ: L2");
  expect(localizeVehicleValue("Driver Assistance System: DiPilot 100", "am")).toBe("የአሽከርካሪ ረዳት ስርዓት: DiPilot 100");
  expect(localizeVehicleValue("Lane Keeping Assist: ●", "am")).toBe("የመስመር ጥበቃ ረዳት: ●");
  expect(localizeVehicleValue("Active Braking: ●", "am")).toBe("ንቁ ማቆሚያ: ●");
  expect(localizeVehicleValue("Sunroof Type: Opening panoramic roof", "am")).toBe("የፀሐይ ጣሪያ ዓይነት: የሚከፈት ፓኖራማ ጣሪያ");

  const charging = localizeVehicleValue("Fast Charging: Supported; Fast Charging Time: 0.5 hours; Fast Charging Range: 30-80%", "am");
  expect(charging).toContain("ይደገፋል");
  expect(charging).toContain("የፈጣን መሙላት ጊዜ");
  expect(charging).toContain("የፈጣን መሙላት መጠን");
});

test("Chinese model configuration values localize source English while preserving units and product names", () => {
  expect(localizeVehicleValue("Front motor FWD / 150.0 kW", "zh")).toBe("前置电机前轮驱动 / 150.0 kW");
  expect(localizeVehicleValue("Driver Assistance Level: L2", "zh")).toBe("驾驶辅助等级: L2");
  expect(localizeVehicleValue("Driver Assistance System: DiPilot 100", "zh")).toBe("驾驶辅助系统: DiPilot 100");
  expect(localizeVehicleValue("Lane Keeping Assist: ●", "zh")).toBe("车道保持辅助: ●");
  expect(localizeVehicleValue("Active Braking: ●", "zh")).toBe("主动制动: ●");
  expect(localizeVehicleValue("Sunroof Type: Opening panoramic roof", "zh")).toBe("天窗类型: 可开启全景天窗");
  expect(localizeVehicleValue("Fast Charging: Supported; Fast Charging Time: 0.5 hours; Fast Charging Range: 30-80%", "zh")).toBe("快充: 支持; 快充时间: 0.5 小时; 快充电量范围: 30-80%");
  expect(localizeVehicleValue("Dual-motor AWD / Rear motor RWD", "zh")).toBe("双电机四驱 / 后置电机后驱");
  expect(localizeVehicleValue("Driver assistance camera: 360 camera; side blind-spot camera", "zh")).toBe("驾驶辅助摄像头: 360 摄像头; 侧盲区摄像头");
  expect(localizeVehicleValue("Sunroof type: Fixed panoramic sunroof", "zh")).toBe("天窗类型: 固定全景天窗");
});

test("Amharic model configuration values localize common D1 feature vocabulary", () => {
  expect(localizeVehicleValue("Dual-motor AWD / Rear motor RWD", "am")).toBe("ባለሁለት ሞተር አራት ጎማ አንቀሳቃሽ / የኋላ ሞተር የኋላ ጎማ አንቀሳቃሽ");
  expect(localizeVehicleValue("Driver assistance camera: 360 camera; side blind-spot camera", "am")).toBe("የአሽከርካሪ ረዳት ካሜራ: 360 ካሜራ; የጎን ዕውር ቦታ ካሜራ");
  expect(localizeVehicleValue("Sunroof type: Fixed panoramic sunroof", "am")).toBe("የፀሐይ ጣሪያ ዓይነት: ቋሚ ፓኖራማ ጣሪያ");
});
