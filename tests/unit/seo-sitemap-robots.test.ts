import { describe, expect, test } from "bun:test";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

describe("SEO & Crawler Integrity Tests", () => {
  const robotsPath = resolve(import.meta.dir, "../../public/robots.txt");
  const sitemapPath = resolve(import.meta.dir, "../../public/sitemap.xml");

  test("public/robots.txt exists and specifies sitemap and crawler rules", () => {
    expect(existsSync(robotsPath)).toBe(true);
    const content = readFileSync(robotsPath, "utf-8");
    expect(content).toContain("User-agent: *");
    expect(content).toContain("Allow: /");
    expect(content).toContain("Disallow: /admin/");
    expect(content).toContain("Sitemap: https://youguard.net/sitemap.xml");
  });

  test("public/sitemap.xml exists and contains multi-lingual hreflang links", () => {
    expect(existsSync(sitemapPath)).toBe(true);
    const xml = readFileSync(sitemapPath, "utf-8");
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(xml).toContain("https://youguard.net/en");
    expect(xml).toContain("https://youguard.net/zh");
    expect(xml).toContain("https://youguard.net/am");
    expect(xml).toContain("https://youguard.net/en/products");
    expect(xml).toContain("https://youguard.net/en/academy");
    expect(xml).toContain("https://youguard.net/en/insights");
    expect(xml).toContain('hreflang="en"');
    expect(xml).toContain('hreflang="zh"');
    expect(xml).toContain('hreflang="am"');
  });
});
