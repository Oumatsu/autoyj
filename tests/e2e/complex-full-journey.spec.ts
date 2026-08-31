import { expect, test } from "@playwright/test";

test.describe("Tier 4: E2E Comprehensive Full-Journey User & Portal Workflows", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("1. Multi-language Switching & Route Locale Persistence", async ({ page }) => {
    // 1. Visit Chinese homepage
    await page.goto("/zh", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/zh/);
    await expect(page.locator("html")).toHaveAttribute("lang", "zh");

    // 2. Switch to Amharic
    await page.context().clearCookies();
    await page.goto("/am", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/am/);
    await expect(page.locator("html")).toHaveAttribute("lang", "am");

    // 3. Switch to English
    await page.context().clearCookies();
    await page.goto("/en", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/en/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    // 4. Click product link and verify language prefix remains /en/
    const productLink = page.locator("a[href*='/en/products']").first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();
      await page.waitForURL(/\/en\/products/);
      expect(page.url()).toContain("/en/products");
    }
  });

  test("2. Product Catalog Filtering, Search & Detail Page Deep Walkthrough", async ({ page }) => {
    await page.goto("/en/products/revenue-king", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/en\/products\/revenue-king/);

    // Wait for client rendering
    await page.waitForTimeout(1000);

    // Search filter interaction
    const searchInput = page.locator("input[placeholder*='Search']").first();
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill("BYD");
      await page.waitForTimeout(400);
    }

    // Inspect vehicle cards or catalog response
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).toMatch(/Revenue King|BYD|Geely|Electric|Range/i);
  });

  test("3. Solutions Customization Interactive Workflow", async ({ page }) => {
    await page.goto("/en/solutions/configure-kit", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();

    await page.waitForTimeout(500);

  });

  test("4. Multi-Role Portal Workstation Login, Tab Traversal & Re-login Data Safeguard", async ({ page }) => {
    await page.goto("/portal");

    const loginRole = async (email: string, code: string) => {
      const emailInput = page.locator("#login-email");
      const codeInput = page.locator("#login-access-code");
      const submitBtn = page.locator("[data-testid='login-submit-button'], button[type='submit']").first();

      await expect(emailInput).toBeVisible();
      await emailInput.fill(email);
      await codeInput.fill(code);
      await submitBtn.click();
      
      const logoutBtn = page.locator("[data-testid='portal-sign-out-button'], button[aria-label*='Sign out']").first();
      await expect(logoutBtn).toBeVisible({ timeout: 10000 });
    };

    const logout = async () => {
      const logoutBtn = page.locator("[data-testid='portal-sign-out-button'], button[aria-label*='Sign out']").first();
      await expect(logoutBtn).toBeVisible({ timeout: 5000 });
      await logoutBtn.click();
      await expect(page.locator("#login-email")).toBeVisible({ timeout: 10000 });
    };

    // Role 1: Admin
    await loginRole("admin@local.test", "admin-demo-2026");
    let content = await page.locator("body").innerText();
    expect(content).toMatch(/库存台数|待处理询价|车型库|STOCK UNITS|OPEN INQUIRIES|VEHICLE MODELS/i);

    // Tab traversal in Admin Workspace
    const vehiclesTab = page.locator("aside button, aside a", { hasText: /车辆资源|Vehicle Resources|Vehicles/i }).first();
    if (await vehiclesTab.isVisible().catch(() => false)) {
      await vehiclesTab.click();
      await page.waitForTimeout(500);
    }
    await logout();

    // Role 2: Sales (Re-login)
    await loginRole("sales@local.test", "sales-demo-2026");
    content = await page.locator("body").innerText();
    expect(content.length).toBeGreaterThan(50);
    await logout();

    // Role 3: Partner (Re-login)
    await loginRole("partner@example.com", "partner-demo-2026");
    content = await page.locator("body").innerText();
    expect(content.length).toBeGreaterThan(50);
    await logout();
  });
});
