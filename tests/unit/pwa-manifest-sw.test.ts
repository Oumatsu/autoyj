import { describe, expect, test } from "bun:test";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

describe("PWA Manifest & Service Worker Integrity", () => {
  const manifestPath = resolve(import.meta.dir, "../../public/manifest.webmanifest");
  const swPath = resolve(import.meta.dir, "../../public/sw.js");
  const icon192Path = resolve(import.meta.dir, "../../public/icons/icon-192.png");
  const icon512Path = resolve(import.meta.dir, "../../public/icons/icon-512.png");
  const appleTouchIconPath = resolve(import.meta.dir, "../../public/icons/apple-touch-icon.png");

  test("public/manifest.webmanifest exists and contains valid PWA configuration", () => {
    expect(existsSync(manifestPath)).toBe(true);
    const content = readFileSync(manifestPath, "utf-8");
    const json = JSON.parse(content);
    expect(json.name).toContain("Youguard");
    expect(json.short_name).toBe("Youguard Auto");
    expect(json.start_url).toBe("/en");
    expect(json.display).toBe("standalone");
    expect(json.background_color).toBe("#0b1425");
    expect(json.theme_color).toBe("#0b1425");
    expect(Array.isArray(json.icons)).toBe(true);
    expect(json.icons.length).toBeGreaterThanOrEqual(3);
  });

  test("public/sw.js exists and implements defensive caching strategy", () => {
    expect(existsSync(swPath)).toBe(true);
    const swContent = readFileSync(swPath, "utf-8");
    expect(swContent).toContain("CACHE_NAME");
    expect(swContent).toContain("addEventListener(\"install\"");
    expect(swContent).toContain("addEventListener(\"activate\"");
    expect(swContent).toContain("addEventListener(\"fetch\"");
    expect(swContent).toContain("/api/"); // API route bypass
    expect(swContent).toContain("navigate"); // Page navigation fallback
  });

  test("PWA icon assets exist in public/icons/", () => {
    expect(existsSync(icon192Path)).toBe(true);
    expect(existsSync(icon512Path)).toBe(true);
    expect(existsSync(appleTouchIconPath)).toBe(true);
  });
});
