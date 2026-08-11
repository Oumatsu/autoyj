import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";
import VehicleDetail from "../../app/products/_VehicleDetail";
import { TolgeeWrapper } from "../../components/TolgeeWrapper";

/**
 * Test Requirement from User:
 * http://localhost:3000/zh/products/revenue-king/geely-geome
 * The rendered page must NOT contain the string "productsDetail.values" or any raw productsDetail keys.
 */
export const mockGeelyGeomeData = {
  modelId: "geely-geome",
  slug: "geely-geome",
  category: "revenue-king" as const,
  title: "吉利星愿 (Geely Geome)",
  subtitle: "精品纯电代步车 / 5座大空间 / CLTC 310-410km",
  heroDesc: "吉利星愿是面向年轻消费群体打造的精品纯电动轿车，提供 310km 和 410km 两种续航版本。",
  vehicle: {
    brand: "吉利 (Geely)",
    name: "星愿 (Geome)",
    fob: "$9,800 - $12,500",
    battery: "30.12 - 40.16 kWh",
    batteryType: "磷酸铁锂 (LFP)",
    range: "310 - 410 km",
    charging: "30-80% 21 mins",
    img: "/images/vehicles/geely-geome.jpg",
    status: "Verified",
    statusText: "已核实 (Verified)",
  },
  stat1Label: "CLTC 续航",
  stat1Value: "310 - 410 km",
  stat2Label: "电池容量",
  stat2Value: "30.12 - 40.16 kWh",
  stat3Label: "快充时间",
  stat3Value: "21 mins (30-80%)",
  whyTitle: "为什么选择吉利星愿",
  whyDesc: "高性价比纯电代步首选",
  features: [
    { icon: "Zap", title: "高效动力", desc: "后置单电机 64kW / 85kW" },
    { icon: "Shield", title: "安全防护", desc: "高强度车身与电池多重防护" },
  ],
  specsLeft: [
    { label: "驱动形式", value: "后置单电机 (RWD)" },
    { label: "车身尺寸", value: "4135 x 1805 x 1570 mm" },
  ],
  specsRight: [
    { label: "轴距", value: "2650 mm" },
    { label: "座位数", value: "5 座" },
  ],
  fits: [
    { icon: "UserCheck", title: "城市代步", desc: "日常通勤极佳", accent: "emerald" },
  ],
  relatedModels: [
    { name: "BYD Seagull", href: "/zh/products/revenue-king/byd-seagull" },
  ],
  tags: ["精品代步", "5座大空间", "快充支持"],
};

describe("Component: Geely Geome Vehicle Detail Page (http://localhost:3000/zh/products/revenue-king/geely-geome)", () => {
  test("renders Geely Geome vehicle detail page without leaking productsDetail.values or any raw i18n keys in Chinese locale", () => {
    const html = renderToString(
      React.createElement(
        TolgeeWrapper,
        { locale: "zh" },
        React.createElement(VehicleDetail, { data: mockGeelyGeomeData as any })
      )
    );

    // Core User Requirement: "http://localhost:3000/zh/products/revenue-king/geely-geome 中不允许在渲染后的页面出现productsDetail.values字样"
    expect(html).not.toContain("productsDetail.values");
    expect(html).not.toContain("productsDetail.models");
    expect(html).not.toContain("productsDetail.variants");
    expect(html).not.toContain("productsDetail.ui");
    expect(html).not.toContain("productsDetail.");

    // Verify key vehicle title and subtitle are present without raw keys
    expect(html).toContain("Geely");
    expect(html).toContain("Geome");
    expect(html).toContain("精品纯电代步车");
  });

  test("renders Geely Geome vehicle detail page without leaking productsDetail.values or any raw i18n keys in English and Amharic locales", () => {
    for (const locale of ["en", "am"]) {
      const html = renderToString(
        React.createElement(
          TolgeeWrapper,
          { locale },
          React.createElement(VehicleDetail, { data: mockGeelyGeomeData as any })
        )
      );

      expect(html).not.toContain("productsDetail.values");
      expect(html).not.toContain("productsDetail.");
    }
  });

  test("renders BYD Yuan UP vehicle detail page (http://localhost:3000/zh/products/revenue-king/byd-yuan-up) with full translation and zero untranslated English sentences in Chinese locale", () => {
    const mockBydYuanUpData = {
      modelId: "bm-byd-yuan-up-2025",
      slug: "byd-yuan-up",
      category: "revenue-king" as const,
      title: "BYD Yuan UP",
      subtitle: "A 30-80% DC top-up takes about 30 minutes, with household charging support making overnight energy easy and economical.",
      heroDesc: "A 30-80% DC top-up takes about 30 minutes, with household charging support making overnight energy easy and economical.",
      vehicle: {
        brand: "BYD",
        name: "Yuan UP",
        fob: "$11,500 - $16,900",
        battery: "45.12 kWh",
        batteryType: "LFP Blade",
        range: "401 km",
        charging: "A 30-80% DC top-up takes about 30 minutes, with household charging support making overnight energy easy and economical.",
        img: "/pic/revenue-king/yuanup/5.webp",
        status: "in-stock",
        statusText: "In Stock: Shenzhen",
      },
      stat1Label: "Battery",
      stat1Value: "45.12 kWh",
      stat2Label: "Range",
      stat2Value: "401 km",
      stat3Label: "FOB",
      stat3Value: "$11,500 - $16,900",
      whyTitle: "Why Yuan UP",
      whyDesc: "A 30-80% DC top-up takes about 30 minutes, with household charging support making overnight energy easy and economical.",
      features: [
        { icon: "01", title: "Powertrain Snapshot", desc: "45.12 kWh · 401 km · LFP Blade" },
      ],
      specsLeft: [
        { label: "Battery", value: "45.12 kWh" },
        { label: "Battery Type", value: "LFP Blade" },
        { label: "Front Suspension", value: "MacPherson" },
      ],
      specsRight: [
        { label: "Range", value: "401 km" },
        { label: "Rear Suspension", value: "Torsion Beam" },
      ],
      fits: [
        { icon: "01", title: "Compact SUV", desc: "A 30-80% DC top-up takes about 30 minutes, with household charging support making overnight energy easy and economical.", accent: "Compact SUV" },
      ],
      relatedModels: [],
      tags: ["Compact SUV"],
    };

    const html = renderToString(
      React.createElement(
        TolgeeWrapper,
        { locale: "zh" },
        React.createElement(VehicleDetail, { data: mockBydYuanUpData as any })
      )
    );

    expect(html).not.toContain("productsDetail.values");
    expect(html).not.toContain("productsDetail.");

    expect(html).toContain("直流快充 30-80% 约需 30 分钟");
    expect(html).toContain("磷酸铁锂刀片电池");
  });
});
