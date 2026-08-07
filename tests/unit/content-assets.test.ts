import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  getVehicleGalleryImages,
  getVehicleModelImage,
  resolveMarkdownImage,
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

  test("academy and insight resolvers reject remote and unverified image sources", () => {
    expect(resolveLessonImage("playbook", "ev-test-drive-guide", "https://evil.example/image.webp"))
      .toBe("/pic/academy/photo-1559136555-9303baea8ebd.webp");
    expect(resolveInsightImage("ethiopia-ev-tax-policy-2026", "/pic/not-a-real-image.webp"))
      .toBe("/pic/academy/photo-1473341304170-971dccb5ac1e.webp");
    expect(resolveMarkdownImage("photo-1518770660439-4636190af475.jpg"))
      .toBe("/pic/academy/photo-1518770660439-4636190af475.webp");
    expect(resolveMarkdownImage("article-image.webp", "/pic/hero/photo-1593941707882-a5bba14938c7.webp"))
      .toBe("/pic/hero/photo-1593941707882-a5bba14938c7.webp");
  });

  test("unknown vehicle gallery slugs return only the verified cover slide", () => {
    expect(getVehicleGalleryImages("unknown-model", "hero.webp")).toEqual([
      { src: "/pic/hero/0.webp", cat: "Exterior", label: "Main Profile" },
    ]);
  });
});
