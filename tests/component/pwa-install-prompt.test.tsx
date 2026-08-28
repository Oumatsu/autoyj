import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { PwaInstallPrompt } from "../../components/PwaInstallPrompt";

describe("Component: PWA Install Prompt", () => {
  let container: HTMLDivElement;
  let originalUserAgent: string;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    if (typeof window !== "undefined" && window.sessionStorage?.clear) {
      window.sessionStorage.clear();
    }
    originalUserAgent = window.navigator.userAgent;
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as any;
    if (typeof window !== "undefined" && window.localStorage?.clear) {
      window.localStorage.clear();
    }
    delete (window.navigator as any).standalone;
  });

  afterEach(() => {
    if (container.parentNode) {
      container.remove();
    }
    Object.defineProperty(window.navigator, "userAgent", {
      value: originalUserAgent,
      configurable: true,
    });
  });

  test("renders iOS install guide banner when running on iOS Safari", async () => {
    Object.defineProperty(window.navigator, "userAgent", {
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.8 Mobile/15E148 Safari/604.1",
      configurable: true,
    });

    const root = createRoot(container);
    await act(async () => {
      root.render(<PwaInstallPrompt />);
    });

    const banner = container.querySelector("aside");
    expect(banner).not.toBeNull();
    expect(container.textContent).toContain("Youguard Auto");

    // Click the Install/Add button to open iOS guide modal
    const installBtn = container.querySelector("button");
    await act(async () => {
      installBtn?.click();
    });

    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    const modalText = container.textContent || "";
    const hasGuideSteps =
      modalText.includes("Safari") ||
      modalText.includes("Share") ||
      modalText.includes("分享") ||
      modalText.includes("ማጋሪያ");
    expect(hasGuideSteps).toBe(true);

    await act(async () => root.unmount());
  });

  test("renders Android install banner and shows Android 3-step guide on manual fallback", async () => {
    Object.defineProperty(window.navigator, "userAgent", {
      value: "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36",
      configurable: true,
    });

    const root = createRoot(container);
    await act(async () => {
      root.render(<PwaInstallPrompt />);
    });

    await act(async () => {
      const event = new window.Event("beforeinstallprompt");
      (event as any).prompt = async () => {};
      (event as any).userChoice = Promise.resolve({ outcome: "dismissed" });
      window.dispatchEvent(event);
    });

    const banner = container.querySelector("aside");
    expect(banner).not.toBeNull();

    // Click the Install button without native beforeinstallprompt available -> opens Android guide
    const installBtn = container.querySelector("button");
    await act(async () => {
      installBtn?.click();
    });

    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    const modalText = container.textContent || "";
    const hasAndroidGuide =
      modalText.includes("Chrome") ||
      modalText.includes("Android") ||
      modalText.includes("菜单") ||
      modalText.includes("3 dots");
    expect(hasAndroidGuide).toBe(true);

    await act(async () => root.unmount());
  });

  test("renders In-App browser warning when opened within WeChat or Lark webview", async () => {
    Object.defineProperty(window.navigator, "userAgent", {
      value: "Mozilla/5.0 (Linux; Android 12; HarmonyOS) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/99.0.4844.88 Mobile Safari/537.36 MicroMessenger/8.0.38",
      configurable: true,
    });

    const root = createRoot(container);
    await act(async () => {
      root.render(<PwaInstallPrompt />);
    });

    // Trigger manual guide event
    await act(async () => {
      window.dispatchEvent(new window.Event("youguard-open-pwa-guide"));
    });

    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    const modalText = container.textContent || "";
    const hasInAppWarning =
      modalText.includes("系统默认浏览器") ||
      modalText.includes("Default Browser") ||
      modalText.includes("Open in Browser") ||
      modalText.includes("በነባሪ አሳሽዎ");
    expect(hasInAppWarning).toBe(true);

    await act(async () => root.unmount());
  });

  test("renders macOS desktop guide with Dock instructions when on Mac Edge/Chrome", async () => {
    Object.defineProperty(window.navigator, "userAgent", {
      value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
      configurable: true,
    });

    const root = createRoot(container);
    await act(async () => {
      root.render(<PwaInstallPrompt />);
    });

    await act(async () => {
      const event = new window.Event("beforeinstallprompt");
      (event as any).prompt = async () => {};
      (event as any).userChoice = Promise.resolve({ outcome: "dismissed" });
      window.dispatchEvent(event);
    });

    // Click install button on banner
    const installBtn = container.querySelector("button");
    await act(async () => {
      installBtn?.click();
    });

    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    const modalText = container.textContent || "";
    expect(modalText).toContain("Mac");
    expect(modalText.includes("Dock") || modalText.includes("程序坞") || modalText.includes("地址栏")).toBe(true);

    await act(async () => root.unmount());
  });

  test("responds to custom youguard-open-pwa-guide event and allows platform switching via expander", async () => {
    Object.defineProperty(window.navigator, "userAgent", {
      value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      configurable: true,
    });

    const root = createRoot(container);
    await act(async () => {
      root.render(<PwaInstallPrompt />);
    });

    // Dispatch custom open event
    await act(async () => {
      window.dispatchEvent(new window.Event("youguard-open-pwa-guide"));
    });

    expect(container.querySelector('[role="dialog"]')).not.toBeNull();

    // Click the toggle to reveal other platform buttons
    const expandBtn = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("其他设备") || b.textContent?.includes("another device")
    );
    expect(expandBtn).toBeDefined();
    await act(async () => {
      expandBtn?.click();
    });

    // Switch to iOS tab
    const iosTabButton = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.includes("iOS")
    );
    expect(iosTabButton).toBeDefined();
    await act(async () => {
      iosTabButton?.click();
    });

    expect(container.textContent).toContain("Safari");

    await act(async () => root.unmount());
  });

  test("renders completely null and silent when running inside installed standalone PWA", async () => {
    window.matchMedia = ((query: string) => ({
      matches: query.includes("standalone"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as any;

    const root = createRoot(container);
    await act(async () => {
      root.render(<PwaInstallPrompt />);
    });

    expect(container.querySelector("aside")).toBeNull();
    expect(container.textContent).toBe("");

    await act(async () => root.unmount());
  });

  test("suppresses floating banner if app was already installed on this device", async () => {
    window.localStorage?.setItem("youguard_pwa_installed", "true");

    const root = createRoot(container);
    await act(async () => {
      root.render(<PwaInstallPrompt />);
    });

    expect(container.querySelector("aside")).toBeNull();

    await act(async () => root.unmount());
    window.localStorage?.removeItem("youguard_pwa_installed");
  });
});
