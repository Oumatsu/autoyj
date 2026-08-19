import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import React, { act, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  DashboardNavigationProvider,
  useDashboardNavigation,
} from "../../components/DashboardNavigationContext";
import { Sheet } from "../../components/ui/sheet";

describe("Mobile navigation drawers", () => {
  test("shares the dashboard drawer state between the global header and dashboard content", async () => {
    const container = document.createElement("div");
    const root = createRoot(container);
    let openDashboardNavigation: (() => void) | undefined;
    let isDashboardNavigationOpen = false;

    function Probe() {
      const navigation = useDashboardNavigation();
      useEffect(() => {
        openDashboardNavigation = navigation.openDashboardNavigation;
        isDashboardNavigationOpen = navigation.isDashboardNavigationOpen;
      });
      return <span>{navigation.isDashboardNavigationOpen ? "open" : "closed"}</span>;
    }

    await act(async () => {
      root.render(<DashboardNavigationProvider><Probe /></DashboardNavigationProvider>);
    });
    expect(container.textContent).toBe("closed");

    await act(async () => openDashboardNavigation?.());
    expect(container.textContent).toBe("open");
    expect(isDashboardNavigationOpen).toBe(true);

    await act(async () => root.unmount());
  });

  test("keeps the mobile brand centered between separate dashboard and main-menu controls", async () => {
    const [navbar, portal, chrome] = await Promise.all([
      readFile(new URL("../../components/Navbar.tsx", import.meta.url), "utf8"),
      readFile(new URL("../../app/portal/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../../components/SiteChrome.tsx", import.meta.url), "utf8"),
    ]);

    expect(chrome).toContain("<DashboardNavigationProvider>");
    expect(navbar).toContain('aria-label="Open dashboard navigation"');
    expect(navbar).toContain('aria-controls="main-navigation-drawer"');
    expect(navbar).toContain("grid-cols-[44px_minmax(0,1fr)_44px]");
    expect(navbar).toContain("openDashboardNavigation");
    expect(portal).toContain('id="dashboard-navigation-drawer"');
    expect(portal).toContain("isDashboardNavigationOpen");
    expect(portal).toContain("setDashboardNavigationOpen");
    expect(portal).not.toContain('aria-label="Toggle navigation drawer"');
  });

  test("lets keyboard users dismiss the main navigation drawer with Escape", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    let requestedClose = false;

    await act(async () => {
      root.render(<Sheet open onOpenChange={(open) => { requestedClose = !open; }} contentId="main-navigation-drawer" ariaLabel="Main navigation"><p>Menu</p></Sheet>);
    });
    await act(async () => window.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })));

    expect(requestedClose).toBe(true);
    expect(container.querySelector('[role="dialog"]')?.getAttribute("aria-label")).toBe("Main navigation");
    await act(async () => root.unmount());
    container.remove();
  });
});
