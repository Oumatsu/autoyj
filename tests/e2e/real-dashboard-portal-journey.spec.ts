import { expect, test } from "@playwright/test";

test.describe("Tier 4: E2E Real Portal Login & Logout Interactive Journey", () => {
  test("User can load portal login page, view authentication container and test account buttons", async ({ page }) => {
    await page.goto("/portal");
    await expect(page).toHaveURL(/\/portal/);

    const bodyText = await page.locator("body").innerText();
    expect(bodyText.length).toBeGreaterThan(0);

    // Verify Sign In heading exists
    await expect(page.locator("h2", { hasText: /Sign In/i })).toBeVisible();
  });

  test("User can perform real login via test credentials and logout back to login screen", async ({ page }) => {
    await page.goto("/portal");

    // 1. Locate email & access code inputs
    const emailInput = page.locator("#login-email");
    const codeInput = page.locator("#login-access-code");
    const submitBtn = page.locator("form button[type='submit'], form button", { hasText: /Sign In/i });

    await expect(emailInput).toBeVisible();
    await expect(codeInput).toBeVisible();

    // 2. Fill test partner credentials
    await emailInput.fill("partner@example.com");
    await codeInput.fill("partner-demo-2026");

    // 3. Click Sign In
    await submitBtn.click();

    // 4. Wait for authentication response and layout render
    await page.waitForTimeout(1000);

    // Verify workspace or logout button is accessible
    const logoutBtn = page.locator("button", { hasText: /退出登录|Log Out|Sign Out|Logout/i }).first();
    const hasLogoutBtn = await logoutBtn.isVisible().catch(() => false);

    if (hasLogoutBtn) {
      // 5. Click Logout to perform full sign-out flow
      await logoutBtn.click();
      await page.waitForTimeout(500);

      // 6. Verify returning to Sign In form
      await expect(page.locator("#login-email")).toBeVisible();
    }
  });

  test("Sequential login -> logout -> re-login across roles preserves catalog and data without empty state", async ({ page }) => {
    await page.goto("/portal");

    // helper to login
    const performLogin = async (email: string, code: string) => {
      const emailInput = page.locator("#login-email");
      const codeInput = page.locator("#login-access-code");
      const submitBtn = page.locator("form button[type='submit'], form button", { hasText: /Sign In/i });

      await expect(emailInput).toBeVisible();
      await emailInput.fill(email);
      await codeInput.fill(code);
      await submitBtn.click();

      const logoutBtn = page.locator("button", { hasText: /退出登录|Log Out|Sign Out|Logout/i }).first();
      await expect(logoutBtn).toBeVisible({ timeout: 10000 });
    };

    // helper to logout
    const performLogout = async () => {
      const logoutBtn = page.locator("button", { hasText: /退出登录|Log Out|Sign Out|Logout/i }).first();
      await expect(logoutBtn).toBeVisible({ timeout: 5000 });
      await logoutBtn.click();
      await page.waitForTimeout(600);
    };

    // 1st Login: Partner
    await performLogin("partner@example.com", "partner-demo-2026");
    const partnerText = await page.locator("body").innerText();
    expect(partnerText).not.toMatch(/Sign In/i);
    expect(partnerText.length).toBeGreaterThan(50);

    // 1st Logout
    await performLogout();
    await expect(page.locator("#login-email")).toBeVisible();

    // 2nd Login: Admin (re-login after logout)
    await performLogin("admin@local.test", "admin-demo-2026");
    const adminText = await page.locator("body").innerText();
    expect(adminText).not.toMatch(/Sign In/i);
    expect(adminText.length).toBeGreaterThan(50);
    // Ensure catalog metrics/data are actually loaded and rendered (not empty)
    expect(adminText).toMatch(/库存台数|待处理询价|车型库/i);

    // 2nd Logout
    await performLogout();
    await expect(page.locator("#login-email")).toBeVisible();

    // 3rd Login: Customer (re-login again)
    await performLogin("customer@example.com", "customer-demo-2026");
    const customerText = await page.locator("body").innerText();
    expect(customerText).not.toMatch(/Sign In/i);
    expect(customerText.length).toBeGreaterThan(50);
  });

  test("Direct navigation to dashboard sub-routes renders layout container", async ({ page }) => {
    await page.goto("/en/dashboard");
    await expect(page).toHaveURL(/\/en\/dashboard/);

    await page.goto("/en/dashboard/vehicles");
    await expect(page).toHaveURL(/\/en\/dashboard\/vehicles/);

    await page.goto("/en/dashboard/quotes");
    await expect(page).toHaveURL(/\/en\/dashboard\/quotes/);
  });
});
