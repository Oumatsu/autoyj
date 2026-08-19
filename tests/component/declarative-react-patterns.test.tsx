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
    expect(source).not.toContain("document.getElementById");
    expect(source).toContain("isVisible");
  });

  test("views/insights.tsx uses feedRef and scrollIntoView with zero document.getElementById", async () => {
    const source = await readFile(new URL("../../views/insights.tsx", import.meta.url), "utf8");
    expect(source).not.toContain("document.getElementById");
    expect(source).toContain("feedRef");
    expect(source).toContain("scrollIntoView");
  });

  test("views/academy.tsx uses isVisible state with zero tabBar style, classList mutations, or document.getElementById", async () => {
    const source = await readFile(new URL("../../views/academy.tsx", import.meta.url), "utf8");
    expect(source).not.toContain("tabBar.classList.toggle");
    expect(source).not.toContain("tabBar.style.top");
    expect(source).not.toContain("document.getElementById");
    expect(source).toContain("isVisible");
  });

  test("app/layout.tsx contains zero document.documentElement mutations in inline scripts", async () => {
    const source = await readFile(new URL("../../app/layout.tsx", import.meta.url), "utf8");
    expect(source).not.toContain("document.documentElement");
  });

  test("components/HeroSlider.tsx uses declarative state with zero classList/setAttribute/textContent mutations", async () => {
    const source = await readFile(new URL("../../components/HeroSlider.tsx", import.meta.url), "utf8");
    expect(source).not.toContain("classList.toggle");
    expect(source).not.toContain("setAttribute");
    expect(source).not.toContain("counterRef.current.textContent");
    expect(source).not.toContain("querySelectorAll");
    expect(source).toContain("currentIndex");
  });

  test("components/ui/collapsible.tsx uses React Context with zero displayName reflection", async () => {
    const source = await readFile(new URL("../../components/ui/collapsible.tsx", import.meta.url), "utf8");
    expect(source).not.toContain("React.Children.map");
    expect(source).not.toContain("displayName ===");
    expect(source).toContain("CollapsibleContext");
  });

  test("components/ui/hover-card.tsx uses React Context with zero displayName reflection", async () => {
    const source = await readFile(new URL("../../components/ui/hover-card.tsx", import.meta.url), "utf8");
    expect(source).not.toContain("React.Children.map");
    expect(source).not.toContain("displayName ===");
    expect(source).toContain("HoverCardContext");
  });

  test("views/products/detailTranslations.ts is pure and contains zero window.location references", async () => {
    const source = await readFile(new URL("../../views/products/detailTranslations.ts", import.meta.url), "utf8");
    expect(source).not.toContain("window.location");
  });

  test("views/qr.tsx and views/page.tsx use declarative download links without document.createElement(a)", async () => {
    const qrSource = await readFile(new URL("../../views/qr.tsx", import.meta.url), "utf8");
    const pageSource = await readFile(new URL("../../views/page.tsx", import.meta.url), "utf8");
    expect(qrSource).not.toContain("document.createElement");
    expect(pageSource).not.toContain("document.createElement");
    expect(qrSource).toContain("download=");
    expect(pageSource).toContain("download=");
  });

  test("components/Navbar.tsx uses Next.js router with zero window.location.assign", async () => {
    const source = await readFile(new URL("../../components/Navbar.tsx", import.meta.url), "utf8");
    expect(source).not.toContain("window.location.assign");
    expect(source).toContain("router.push");
  });

  test("components/ui/dropdown-menu.tsx and popover.tsx use W3C pointerdown events instead of legacy mousedown", async () => {
    const dropdownSource = await readFile(new URL("../../components/ui/dropdown-menu.tsx", import.meta.url), "utf8");
    const popoverSource = await readFile(new URL("../../components/ui/popover.tsx", import.meta.url), "utf8");
    expect(dropdownSource).toContain("pointerdown");
    expect(dropdownSource).not.toContain("mousedown");
    expect(popoverSource).toContain("pointerdown");
    expect(popoverSource).not.toContain("mousedown");
  });

  test("components/HeroSlider.tsx implements unified mobile touch & pointer swipe support", async () => {
    const source = await readFile(new URL("../../components/HeroSlider.tsx", import.meta.url), "utf8");
    expect(source).toContain("onPointerDown");
    expect(source).toContain("onPointerUp");
    expect(source).toContain("touch-pan-y");
  });
});
