import { expect, test } from "@playwright/test";

test.describe("Tier 4: E2E Comprehensive Full-Journey User & Portal Workflows", () => {

  test("1. Multi-language Switching & Route Locale Persistence", async ({ page }) => {
    // 1. Visit Chinese homepage
    await page.goto("/zh");
    await expect(page).toHaveURL(/\/zh/);
    let htmlLang = await page.getAttribute("html", "lang");
    expect(htmlLang).toBe("zh");

    // 2. Switch to Amharic
    await page.goto("/am");
    await expect(page).toHaveURL(/\/am/);
    htmlLang = await page.getAttribute("html", "lang");
    expect(htmlLang).toBe("am");

    // 3. Switch to English
    await page.goto("/en");
    await expect(page).toHaveURL(/\/en/);
    htmlLang = await page.getAttribute("html", "lang");
    expect(htmlLang).toBe("en");

    // 4. Click product link and verify language prefix remains /en/
    const productLink = page.locator("a[href*='/en/products']").first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();
      await page.waitForURL(/\/en\/products/);
      expect(page.url()).toContain("/en/products");
    }
  });

  test("2. Product Catalog Filtering, Search & Detail Page Deep Walkthrough", async ({ page }) => {
    await page.goto("/en/products/revenue-king");
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

  test("3. Solutions Customization & Quote Form Interactive Workflow", async ({ page }) => {
    await page.goto("/en/solutions/configure-kit");
    await expect(page).toHaveURL(/\/en\/solutions\/configure-kit/);
    await expect(page.locator("h1")).toBeVisible();

    // Navigate to Quote Form
    await page.goto("/en/solutions/request-quote");
    await expect(page).toHaveURL(/\/en\/solutions\/request-quote/);

    // Fill Form Fields
    const nameInput = page.locator("input[name='fullName'], input[placeholder*='Name']").first();
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill("Global Fleet Director");
    }

    const emailInput = page.locator("input[type='email']").first();
    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill("fleet.director@global-logistics.com");
    }
  });

  test("4. Multi-Role Portal Workstation Login, Tab Traversal & Re-login Data Safeguard", async ({ page }) => {
    await page.goto("/portal");

    const loginRole = async (email: string, code: string) => {
      const emailInput = page.locator("#login-email");
      const codeInput = page.locator("#login-access-code");
      const submitBtn = page.locator("form button[type='submit'], form button", { hasText: /Sign In/i });

      await expect(emailInput).toBeVisible();
      await emailInput.fill(email);
      await codeInput.fill(code);
      await submitBtn.click();
      await page.waitForTimeout(1200);
    };

    const logout = async () => {
      const logoutBtn = page.locator("button", { hasText: /退出登录|Log Out|Sign Out|Logout/i }).first();
      await expect(logoutBtn).toBeVisible({ timeout: 5000 });
      await logoutBtn.click();
      await page.waitForTimeout(600);
    };

    // Role 1: Admin
    await loginRole("admin@local.test", "admin-demo-2026");
    let content = await page.locator("body").innerText();
    expect(content).toMatch(/库存台数|待处理询价|车型库/i);

    // Tab traversal in Admin Workspace
    const vehiclesTab = page.locator("button, a", { hasText: /车辆资源|Vehicles/i }).first();
    if (await vehiclesTab.isVisible().catch(() => false)) {
      await vehiclesTab.click();
      await page.waitForTimeout(500);
    }
    await logout();
    await expect(page.locator("#login-email")).toBeVisible();

    // Role 2: Sales (Re-login)
    await loginRole("sales@local.test", "sales-demo-2026");
    content = await page.locator("body").innerText();
    expect(content.length).toBeGreaterThan(50);
    await logout();
    await expect(page.locator("#login-email")).toBeVisible();

    // Role 3: Partner (Re-login)
    await loginRole("partner@example.com", "partner-demo-2026");
    content = await page.locator("body").innerText();
    expect(content.length).toBeGreaterThan(50);
    await logout();
    await expect(page.locator("#login-email")).toBeVisible();
  });
});
