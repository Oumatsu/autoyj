import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

describe("Dashboard & Portal Layout Chrome Isolation", () => {
  test("components/SiteChrome.tsx renders global public Navbar on all pages and hides public Footer on app console", async () => {
    const source = await readFile(new URL("../../components/SiteChrome.tsx", import.meta.url), "utf8");
    expect(source).toContain("isDashboardRoute");
    expect(source).toContain("isPortalRoute");
    expect(source).toContain("<Navbar />");
    expect(source).toContain("!hidePublicFooter && <Footer />");
  });

  test("app/portal/page.tsx mobile navigation drawer is positioned cleanly at full height", async () => {
    const source = await readFile(new URL("../../app/portal/page.tsx", import.meta.url), "utf8");
    expect(source).not.toContain("inset-y-[var(--navbar-h,56px)]");
    expect(source).toContain("inset-y-0 left-0 z-50");
  });
});
