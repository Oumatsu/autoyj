import { describe, expect, test } from "bun:test";
import {
  getPublicAcademyLesson,
  getPublicInsight,
  getPublicProduct,
  listPublicAcademy,
  listPublicInsights,
  listPublicProducts,
} from "../../server/db/public-content";

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
    });
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
    expect(detail).not.toBeNull();
    expect(detail).toMatchObject({
      vehicle: expect.any(Object),
      galleryImages: expect.any(Array),
      specsLeft: expect.any(Array),
      specsRight: expect.any(Array),
      trimComparison: expect.any(Object),
    });
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
