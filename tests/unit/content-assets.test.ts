import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  getVehicleGalleryImages,
  getVehicleModelImage,
  resolveLessonImage,
  resolveInsightImage,
} from "../../lib/static-assets";

const root = join(import.meta.dir, "../../public");

describe("verified public assets", () => {
  test("all known vehicle gallery paths exist", () => {
    for (const slug of ["byd-seagull", "zeekr-9x", "hongqi-e-hs9"]) {
      for (const image of getVehicleGalleryImages(slug)) {
        expect(existsSync(join(root, image.src.slice(1))), image.src).toBe(true);
      }
    }
  });

  test("database basenames never become relative URLs", () => {
    expect(resolveLessonImage("technical-workshop", "lesson-a", "hero.webp"))
      .toMatch(/^\/pic\//);
    expect(resolveInsightImage("unknown-article", "cover.webp"))
      .toMatch(/^\/pic\//);
    expect(getVehicleModelImage("unknown-model", "hero.webp"))
      .toBe("/pic/hero/0.webp");
  });

  test("unknown vehicle gallery slugs return only the verified cover slide", () => {
    expect(getVehicleGalleryImages("unknown-model", "hero.webp")).toEqual([
      { src: "/pic/hero/0.webp", cat: "Exterior", label: "Main Profile" },
    ]);
  });
});
