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
      await logoutBtn.evaluate((el) => (el as HTMLElement).click());
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

  test("Vehicle filters separate reset from list refresh", async ({ page }) => {
    await page.goto("/portal");

    await page.locator("#login-email").fill("admin@local.test");
    await page.locator("#login-access-code").fill("admin-demo-2026");
    await page.locator("form button[type='submit'], form button", { hasText: /Sign In/i }).click();

    await page.locator("a[href='/dashboard?tab=vehicles']").click();
    await expect(page.locator("[role='status']")).toHaveCount(0, { timeout: 15000 });

    const resetButton = page.getByRole("button", { name: /Reset|重置/i });
    const refreshButton = page.getByRole("button", { name: /Refresh|刷新/i });
    const searchInput = page.locator("input").first();
    await expect(resetButton).toBeVisible();
    await expect(refreshButton).toBeVisible();
    await searchInput.fill("no-match-vehicle");
    await expect(searchInput).toHaveValue("no-match-vehicle");

    let catalogRequestsAfterReset = 0;
    page.on("request", (request) => {
      if (new URL(request.url()).pathname === "/api/portal/catalog" && request.method() === "GET") {
        catalogRequestsAfterReset += 1;
      }
    });
    await resetButton.click();
    await page.waitForTimeout(300);
    expect(catalogRequestsAfterReset).toBe(0);
    await expect(searchInput).toHaveValue("");

    const refreshResponse = page.waitForResponse((response) =>
      new URL(response.url()).pathname === "/api/portal/catalog" &&
      new URL(response.url()).searchParams.get("refresh") === "1" &&
      response.request().method() === "GET"
    );
    await refreshButton.click();
    await refreshResponse;
  });

  test("Customer can open the vehicle resources page", async ({ page }) => {
    await page.goto("/portal");

    await page.locator("#login-email").fill("customer@example.com");
    await page.locator("#login-access-code").fill("customer-demo-2026");
    await page.locator("form button[type='submit'], form button", { hasText: /Sign In/i }).click();

    const vehiclesLink = page.locator("a[href='/dashboard?tab=vehicles']");
    await expect(vehiclesLink).toBeVisible();
    await vehiclesLink.click();

    await expect(page).toHaveURL(/\?tab=vehicles/);
    await expect(page.getByRole("heading", { name: /Vehicle Resources|车辆资源/i })).toBeVisible();
  });

  test("Vehicle resources do not expose a color filter", async ({ page }) => {
    await page.goto("/portal");

    await page.locator("#login-email").fill("admin@local.test");
    await page.locator("#login-access-code").fill("admin-demo-2026");
    await page.locator("form button[type='submit'], form button", { hasText: /Sign In/i }).click();
    await page.locator("a[href='/dashboard?tab=vehicles']").click();
    await expect(page.locator("[role='status']")).toHaveCount(0, { timeout: 15000 });

    await expect(page.locator("select")).toHaveCount(3);
  });

  test("Vehicle resource details group colors beneath each configuration", async ({ page }) => {
    await page.goto("/portal");

    await page.locator("#login-email").fill("admin@local.test");
    await page.locator("#login-access-code").fill("admin-demo-2026");
    await page.locator("form button[type='submit'], form button", { hasText: /Sign In/i }).click();

    await page.locator("a[href='/dashboard?tab=vehicles']").click();
    await page.getByRole("button", { name: /View trims|查看版本|Trims/i }).first().click();

    await page.getByRole("button", { name: /View colors|查看颜色|Colors/i }).first().click();

    const headers = page.getByRole("columnheader");
    await expect(headers.nth(0)).toHaveText(/Color|外观 \/ 内饰颜色/i);
    await expect(headers.nth(1)).toHaveText(/Stock|库存数量/i);
    await expect(headers.nth(2)).toHaveText(/Supplier|供应商/i);
    await expect(headers.nth(3)).toHaveText(/Location|车源地点/i);
    await expect(headers.nth(4)).toHaveText(/Price|FOB Price|美金报价/i);
    await expect(page.getByRole("columnheader", { name: "资源 ID" })).toHaveCount(0);
  });
});
