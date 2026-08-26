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
    
    // Check that it contains multi-language home screen copy
    const text = container.textContent || "";
    const hasHomeScreenText =
      text.includes("Add to Home Screen") ||
      text.includes("添加到主屏幕") ||
      text.includes("ወደ መነሻ ማያ ገጽ");
    expect(hasHomeScreenText).toBe(true);

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

  test("responds to custom youguard-open-pwa-guide event to trigger modal", async () => {
    Object.defineProperty(window.navigator, "userAgent", {
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.8 Mobile/15E148 Safari/604.1",
      configurable: true,
    });

    const root = createRoot(container);
    await act(async () => {
      root.render(<PwaInstallPrompt />);
    });

    // Dispatch custom open event using window.Event in DOM environment
    await act(async () => {
      window.dispatchEvent(new window.Event("youguard-open-pwa-guide"));
    });

    expect(container.querySelector('[role="dialog"]')).not.toBeNull();

    await act(async () => root.unmount());
  });
});
