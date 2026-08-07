import { describe, expect, test } from "bun:test";
import {
  getPublicAcademyLesson,
  getPublicInsight,
  getPublicProduct,
  listPublicAcademy,
  listPublicInsights,
  listPublicProducts,
} from "../../server/db/public-content";
import { buildCatalogFilterGroups, filterCatalogProducts } from "../../views/products/catalogFilters";

type Row = Record<string, unknown>;

function fakeD1(tables: Record<string, Row[]>): D1Database {
  return {
    prepare(sql: string) {
      const table =
        sql.match(/\bFROM\s+([a-z_]+)/i)?.[1] ??
        sql.match(/\bfrom\s+([a-z_]+)/i)?.[1] ??
        "";
      let bound: unknown[] = [];
      const rows = () => tables[table] ?? [];
      const filtered = () => {
        const values = rows();
        if (/slug\s*=\s*\?/i.test(sql)) {
          return values.filter((row) => row.slug === bound[0]);
        }
        return values;
      };
      const statement = {
        bind(...values: unknown[]) {
          bound = values;
          return statement;
        },
        async all<T>() {
          return { results: filtered() as T[] };
        },
        async first<T>() {
          return (filtered()[0] as T | undefined) ?? null;
        },
      };
      return statement as unknown as D1PreparedStatement;
    },
  } as unknown as D1Database;
}

describe("typed public D1 content", () => {
  test("empty D1 baseline cards include complete filterData consumed by category filters", async () => {
    const products = await listPublicProducts(fakeD1({ vehicle_models: [], vehicle_trims: [] }));
    const filterFields = [
      "vehicleClasses",
      "batteryChemistries",
      "rangeKm",
      "priceUsd",
      "steeringSetups",
      "powertrainTypes",
      "inventoryStatuses",
      "voltagePlatforms",
      "v2lAvailability",
      "drivetrains",
      "groundClearanceMm",
    ];

    for (const product of products) {
      expect(Object.keys(product.filterData).sort()).toEqual([...filterFields].sort());
    }

    const translate = (_key: string, fallback?: string) => fallback ?? "";
    for (const category of ["revenue-king", "elite-flagship", "utility-pro"]) {
      const categoryProducts = products.filter((product) => product.category === category);
      const groups = buildCatalogFilterGroups(category, categoryProducts, translate);
      expect(groups.length).toBeGreaterThan(0);
      expect(groups.every((group) => group.options.length > 0)).toBe(true);
    }

    const revenueProducts = products.filter((product) => product.category === "revenue-king");
    const revenueGroups = buildCatalogFilterGroups("revenue-king", revenueProducts, translate);
    const filtered = filterCatalogProducts(
      revenueProducts,
      {
        batteryChemistry: new Set(["value:LFP"]),
        rangeKm: new Set(["range-300-450"]),
      },
      revenueGroups,
    );
    expect(filtered.some((product) => product.slug === "byd-seagull")).toBe(true);
  });

  test("sparse product rows preserve the card contract and use a verified image", async () => {
    const db = fakeD1({
      vehicle_models: [
        {
          id: "model-1",
          model_id: "byd-seagull",
          brand: "BYD",
          model: "Seagull",
          segment: "ride-hailing",
          product_path: "/products/revenue-king/byd-seagull",
          image_url: "hero.webp",
          vehicle_class: "Hatchback (Sub-Compact)",
          battery_chemistry: "LFP",
          steering_setup: "LHD",
          powertrain_type: "BEV",
          inventory_status: "In Stock: Shenzhen",
          voltage_platform_v: 400,
          v2l_availability: "Standard",
          drivetrain_display: "FWD",
          ground_clearance_mm: 120,
        },
      ],
      vehicle_trims: [],
    });

    const products = await listPublicProducts(db);
    expect(products.find((item) => item.slug === "byd-seagull")).toMatchObject({
      category: "revenue-king",
      img: "/pic/revenue-king/seagull/7.webp",
      battery: expect.any(String),
      range: expect.any(String),
      tags: expect.any(Array),
      filterData: {
        vehicleClasses: ["Hatchback (Sub-Compact)"],
        batteryChemistries: ["LFP"],
        rangeKm: { min: 405, max: 405 },
        priceUsd: { min: 9800, max: 13300 },
        steeringSetups: ["LHD"],
        powertrainTypes: ["BEV"],
        inventoryStatuses: ["In Stock: Shenzhen"],
        voltagePlatforms: ["400V"],
        v2lAvailability: ["Standard"],
        drivetrains: ["FWD"],
        groundClearanceMm: { min: 120, max: 120 },
      },
    });
  });

  test("D1-only models receive a local route and verified fallback image", async () => {
    const db = fakeD1({
      vehicle_models: [
        {
          id: "model-unknown",
          model_id: "new-utility-model",
          brand: "New Brand",
          model: "New Utility",
          segment: "commercial",
          image_url: "hero.webp",
        },
      ],
      vehicle_trims: [],
    });

    const product = (await listPublicProducts(db)).find((item) => item.slug === "new-utility-model");
    expect(product).toMatchObject({
      category: "utility-pro",
      link: "/products/utility-pro/new-utility-model",
      img: "/pic/hero/0.webp",
    });
    expect(product?.link).not.toContain("feishu");
  });

  test("complete product detail includes view keys and trim data", async () => {
    const db = fakeD1({
      vehicle_models: [
        {
          id: "model-1",
          model_id: "byd-seagull",
          brand: "BYD",
          model: "Seagull",
          segment: "ride-hailing",
          product_path: "/products/revenue-king/byd-seagull",
          page_title: "BYD Seagull",
          page_subtitle: "Urban EV",
          hero_description: "A compact city EV.",
          battery_capacity_min_kwh: 38.8,
          battery_capacity_max_kwh: 38.8,
          cltc_range_min_km: 405,
          cltc_range_max_km: 405,
          zero_to_100_sec: 9.9,
          wheelbase_mm: 2500,
          length_mm: 3780,
          width_mm: 1715,
          height_mm: 1540,
          seats_min: 5,
          seats_max: 5,
          voltage_platform_v: 400,
          ground_clearance_mm: 120,
          boot_volume_l: 345,
          v2l_availability: "Standard",
          v2l_output_power_kw: 3.3,
          battery_warranty_years: 8,
          battery_warranty_distance_km: 160000,
          gallery_images_json: "{malformed",
          common_features_json: "[{\"title\":\"V2L\"}]",
        },
      ],
      vehicle_trims: [
        {
          id: "trim-1",
          model_id: "byd-seagull",
          trim_name: "305km Free",
          cltc_range_km: 305,
          battery_capacity_kwh: 30.1,
          specs_json: "{malformed",
        },
      ],
    });

    const detail = await getPublicProduct(db, "byd-seagull");
    const detailSpecsLeft = detail?.specsLeft;
    const detailSpecsRight = detail?.specsRight;
    expect(detail).not.toBeNull();
    expect(detail).toMatchObject({
      vehicle: expect.any(Object),
      galleryImages: expect.any(Array),
      specsLeft: expect.any(Array),
      specsRight: expect.any(Array),
      trimComparison: expect.any(Object),
    });
    const specsLeft = Array.isArray(detailSpecsLeft) ? detailSpecsLeft : [];
    const specsRight = Array.isArray(detailSpecsRight) ? detailSpecsRight : [];
    const specs = [...specsLeft, ...specsRight];
    expect(specs).toEqual(expect.arrayContaining([
      { label: "0-100 km/h", value: "9.9 s" },
      { label: "Dimensions", value: "3780 × 1715 × 1540 mm" },
      { label: "Seating", value: "5 seats" },
      { label: "Wheelbase", value: "2500 mm" },
      { label: "Ground Clearance", value: "120 mm" },
      { label: "Boot Volume", value: "345 L" },
      { label: "V2L", value: "Standard · 3.3 kW" },
      { label: "Battery Warranty", value: "8 years / 160000 km" },
    ]));
  });

  test("invalid D1 gallery assets are omitted instead of leaking hero.webp", async () => {
    const db = fakeD1({
      vehicle_models: [
        {
          id: "model-1",
          model_id: "byd-seagull",
          brand: "BYD",
          model: "Seagull",
          segment: "ride-hailing",
          product_path: "/products/revenue-king/byd-seagull",
          gallery_images_json: JSON.stringify([
            { src: "/pic/revenue-king/seagull/hero.webp", cat: "Exterior", label: "Bad" },
            { src: "/pic/page/photo-1555215695-3004980ad54e.webp", cat: "Interior", label: "Good" },
          ]),
        },
      ],
      vehicle_trims: [],
    });

    const detail = await getPublicProduct(db, "byd-seagull");
    expect(detail?.galleryImages.some((image) => image.src.includes("hero.webp"))).toBe(false);
    expect(detail?.galleryImages).toContainEqual({
      src: "/pic/page/photo-1555215695-3004980ad54e.webp",
      cat: "Interior",
      label: "Good",
    });
  });

  test("baseline detail keeps every consumer section populated", async () => {
    const db = fakeD1({ vehicle_models: [], vehicle_trims: [] });
    const detail = await getPublicProduct(db, "byd-seagull");
    const fits = detail?.fits;
    expect(detail).toMatchObject({
      vehicle: expect.any(Object),
      features: expect.any(Array),
      specsLeft: expect.any(Array),
      specsRight: expect.any(Array),
      fits: expect.any(Array),
      relatedModels: expect.any(Array),
      galleryImages: expect.any(Array),
      trimComparison: expect.any(Object),
    });
    expect(Array.isArray(fits)).toBe(true);
    expect((fits ?? []).length).toBeGreaterThan(0);
  });

  test("empty D1 falls back to baseline products, insights, and academy", async () => {
    const db = fakeD1({ vehicle_models: [], vehicle_trims: [], articles: [], academy_lessons: [], academy_vault: [] });
    expect((await listPublicProducts(db)).length).toBeGreaterThan(0);
    expect((await listPublicInsights(db)).map((item) => item.slug)).toEqual([
      "ethiopia-ev-tax-policy-2026",
      "sourcing-byd-evs-for-east-africa",
      "ev-charging-infrastructure-addis-ababa",
    ]);
    expect((await listPublicAcademy(db)).lessons.fundamentals.length).toBeGreaterThan(0);
  });

  test("malformed JSON does not throw", async () => {
    const db = fakeD1({
      vehicle_models: [
        {
          id: "model-1",
          model_id: "byd-seagull",
          product_path: "/products/revenue-king/byd-seagull",
          gallery_images_json: "{",
          common_features_json: "[",
          i18n_translations: "{",
        },
      ],
      vehicle_trims: [],
    });
    await expect(getPublicProduct(db, "byd-seagull")).resolves.toBeTruthy();
  });

  test("unknown product, insight, and academy slugs return null", async () => {
    const db = fakeD1({ vehicle_models: [], vehicle_trims: [], articles: [], academy_lessons: [], academy_vault: [] });
    expect(await getPublicProduct(db, "does-not-exist")).toBeNull();
    expect(await getPublicInsight(db, "does-not-exist")).toBeNull();
    expect(await getPublicAcademyLesson(db, "workshop", "does-not-exist")).toBeNull();
  });

  test("academy image resolution never leaks a basename or hero.webp", async () => {
    const db = fakeD1({
      academy_lessons: [
        {
          title: "Lesson",
          category: "technical-workshop",
          slug: "custom-lesson",
          tag: "Workshop",
          description: "Description",
          content: "Content",
          image: "hero.webp",
        },
      ],
      academy_vault: [],
    });
    const academy = await listPublicAcademy(db);
    const lesson = academy.lessons.workshop.find((item) => item.slug === "custom-lesson");
    expect(lesson?.img).toMatch(/^\/pic\//);
    expect(lesson?.img).not.toBe("hero.webp");
  });
});
