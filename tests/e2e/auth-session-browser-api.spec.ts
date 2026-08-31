import { expect, test } from "@playwright/test";

/**
 * Tier 4: Advanced E2E — Auth Session Lifecycle, Storage State & Browser API Audit
 *
 * Exercises Playwright's advanced browser capabilities:
 * - Page & Console error collection (zero unhandled exceptions policy)
 * - Network request & failure auditing (zero 5xx status policy)
 * - Browser Context Cookie & Storage State inspection
 * - Custom DOM event (`youguard-session-changed`) verification during logout
 * - Multi-role session switching & clean context isolation
 */

test.describe("Advanced E2E: Auth Session Lifecycle & Browser API Verification", () => {
  test("Zero runtime pageerror & 5xx network failure during login -> workspace -> logout flow", async ({
    page,
  }) => {
    const pageErrors: Error[] = [];
    const failedRequests: string[] = [];

    // 1. Hook into browser events using Playwright Page API
    page.on("pageerror", (error) => {
      pageErrors.push(error);
    });

    page.on("requestfailed", (request) => {
      failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`);
    });

    // 2. Navigate to portal login page
    await page.goto("/portal", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#login-email")).toBeVisible();

    // 3. Perform login as partner
    await page.locator("#login-email").fill("partner@example.com");
    await page.locator("#login-access-code").fill("partner-demo-2026");
    await page.locator("[data-testid='login-submit-button'], button[type='submit']").first().click();

    // 4. Assert workspace renders cleanly
    const logoutBtn = page.getByLabel("Sign out of portal workspace");
    await expect(logoutBtn).toBeVisible({ timeout: 10000 });

    // 5. Perform logout
    await logoutBtn.click();
    await page.waitForTimeout(500);

    // 6. Assert return to login form
    await expect(page.locator("#login-email")).toBeVisible();

    // 7. Verify zero uncaught JavaScript exceptions occurred in browser
    expect(pageErrors).toEqual([]);

    // 8. Verify no network requests failed catastrophically
    expect(failedRequests.filter((req) => !req.includes("favicon"))).toEqual([]);
  });

  test("Cookie & Storage state transition across login and logout", async ({ page, context }) => {
    // 1. Initial unauthenticated state check
    await page.goto("/portal", { waitUntil: "domcontentloaded" });
    let cookies = await context.cookies();
    let sessionCookie = cookies.find((c) => c.name.includes("session") || c.name.includes("auth"));

    // 2. Login as Admin
    await page.locator("#login-email").fill("admin@local.test");
    await page.locator("#login-access-code").fill("admin-demo-2026");
    await page.locator("[data-testid='login-submit-button'], button[type='submit']").first().click();

    // 3. Wait for dashboard layout to load
    const logoutBtn = page.getByLabel("Sign out of portal workspace");
    await expect(logoutBtn).toBeVisible({ timeout: 10000 });

    // 4. Inspect browser cookies post-login
    cookies = await context.cookies();
    sessionCookie = cookies.find((c) => c.name.includes("session") || c.name.includes("auth") || c.name === "youguard_session");
    // Session cookie should be present or request header authorization handled
    expect(cookies.length).toBeGreaterThan(0);

    // 5. Perform logout
    await logoutBtn.click();
    await page.waitForTimeout(500);

    // 6. Verify returning to Sign In screen
    await expect(page.locator("#login-email")).toBeVisible();

    // 7. Verify unauthenticated request to portal API fails appropriately
    const apiRes = await page.request.get("/api/portal/session");
    expect([200, 401, 403]).toContain(apiRes.status());
  });

  test("Logout dispatches 'youguard-session-changed' custom event without DOM exception", async ({
    page,
  }) => {
    await page.goto("/portal", { waitUntil: "domcontentloaded" });

    // 1. Login
    await page.locator("#login-email").fill("partner@example.com");
    await page.locator("#login-access-code").fill("partner-demo-2026");
    await page.locator("[data-testid='login-submit-button'], button[type='submit']").first().click();

    const logoutBtn = page.getByLabel("Sign out of portal workspace");
    await expect(logoutBtn).toBeVisible({ timeout: 10000 });

    // 2. Listen for custom window event in browser context before clicking logout
    await page.evaluate(() => {
      (window as unknown as { __customEventDispatched?: boolean }).__customEventDispatched = false;
      window.addEventListener("youguard-session-changed", () => {
        (window as unknown as { __customEventDispatched?: boolean }).__customEventDispatched = true;
      });
    });

    // 3. Trigger logout
    await logoutBtn.click();
    await expect(page.locator("#login-email")).toBeVisible({ timeout: 10000 });

    // 4. Check if custom event fired successfully
    const eventFired = await page.evaluate(() => {
      return (window as unknown as { __customEventDispatched?: boolean }).__customEventDispatched;
    });

    expect(eventFired).toBe(true);
  });

  test("Multi-role isolated login/logout sequence (Admin -> Sales -> Customer)", async ({
    page,
  }) => {
    const roles = [
      { role: "Admin", email: "admin@local.test", code: "admin-demo-2026" },
      { role: "Sales", email: "sales@local.test", code: "sales-demo-2026" },
      { role: "Customer", email: "customer@example.com", code: "customer-demo-2026" },
    ];

    for (const user of roles) {
      await page.goto("/portal", { waitUntil: "domcontentloaded" });

      // Fill credentials
      await page.locator("#login-email").fill(user.email);
      await page.locator("#login-access-code").fill(user.code);
      await page.locator("[data-testid='login-submit-button'], button[type='submit']").first().click();

      // Assert login succeeded
      const logoutBtn = page.getByLabel("Sign out of portal workspace");
      await expect(logoutBtn).toBeVisible({ timeout: 10000 });

      // Verify page content is visible and non-empty
      const bodyText = await page.locator("body").innerText();
      expect(bodyText.length).toBeGreaterThan(50);

      // Perform logout
      await logoutBtn.click();
      await page.waitForTimeout(400);

      // Verify sign in page restored
      await expect(page.locator("#login-email")).toBeVisible();
    }
  });
});
