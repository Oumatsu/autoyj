import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

describe("Next.js Declarative UI Standards (No Anti-Patterns)", () => {
  test("components/SiteChrome.tsx contains zero imperative document.documentElement mutations", async () => {
    const source = await readFile(new URL("../../components/SiteChrome.tsx", import.meta.url), "utf8");
    expect(source).not.toContain("document.documentElement");
    expect(source).toContain("<div lang={locale}");
  });

  test("components/Navbar.tsx contains zero document.getElementById or document.documentElement mutations", async () => {
    const source = await readFile(new URL("../../components/Navbar.tsx", import.meta.url), "utf8");
    expect(source).not.toContain("document.getElementById");
    expect(source).not.toContain("document.documentElement");
    expect(source).toContain("isScrolled");
  });

  test("components/TcoCounter.tsx uses useRef and IntersectionObserver without document.getElementById", async () => {
    const source = await readFile(new URL("../../components/TcoCounter.tsx", import.meta.url), "utf8");
    expect(source).not.toContain("document.getElementById");
    expect(source).toContain("useRef");
    expect(source).toContain("IntersectionObserver");
  });

  test("components/SectionTabs.tsx uses declarative React state for visibility and scroll offsets", async () => {
    const source = await readFile(new URL("../../components/SectionTabs.tsx", import.meta.url), "utf8");
    expect(source).not.toContain("tabBar.classList.toggle");
    expect(source).not.toContain("tabBar.style.top");
    expect(source).toContain("isVisible");
  });
});
