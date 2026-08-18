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

  test("views/insights.tsx uses feedRef and scrollIntoView with zero document.getElementById", async () => {
    const source = await readFile(new URL("../../views/insights.tsx", import.meta.url), "utf8");
    expect(source).not.toContain("document.getElementById");
    expect(source).toContain("feedRef");
    expect(source).toContain("scrollIntoView");
  });

  test("views/academy.tsx uses isVisible state with zero tabBar style or classList mutations", async () => {
    const source = await readFile(new URL("../../views/academy.tsx", import.meta.url), "utf8");
    expect(source).not.toContain("tabBar.classList.toggle");
    expect(source).not.toContain("tabBar.style.top");
    expect(source).toContain("isVisible");
  });

  test("app/layout.tsx contains zero document.documentElement mutations in inline scripts", async () => {
    const source = await readFile(new URL("../../app/layout.tsx", import.meta.url), "utf8");
    expect(source).not.toContain("document.documentElement");
  });
});
