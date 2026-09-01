import { expect, test, type Page } from "@playwright/test";

async function loginAs(page: Page, email: string, code: string) {
  await page.goto("/en/portal", { waitUntil: "domcontentloaded" });
  const logoutBtn = page.getByLabel("Sign out of portal workspace");
  if (await logoutBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await logoutBtn.click();
  }
  const emailInput = page.locator("#login-email");
  const codeInput = page.locator("#login-access-code");
  const submitBtn = page.locator("[data-testid='login-submit-button'], button[type='submit']").first();

  await expect(emailInput).toBeVisible({ timeout: 15000 });
  await emailInput.fill(email);
  await codeInput.fill(code);
  await submitBtn.click();
}

test.describe("Tier 4: Admin Feishu Manual Sync & PWA Push Notification Delivery E2E", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.grantPermissions(["notifications"]);
  });

  test("1. Admin Manual Feishu Sync Workflow with Real-time Diagnostics", async ({ page }) => {
    // 1. Log in as Admin
    await loginAs(page, "admin@local.test", "admin-demo-2026");

    // 2. Verify Admin Header is visible
    const syncBtn = page.locator("[data-testid='admin-manual-sync-trigger']");
    await expect(syncBtn).toBeVisible({ timeout: 10000 });

    // 3. Intercept and mock or monitor /api/portal/admin/sync-d1
    await page.route("**/api/portal/admin/sync-d1", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ok: true,
            syncedAt: new Date().toISOString(),
            stats: { models: 115, trims: 350, vehicles: 1968, elapsed: 420 },
            message: "Manual Feishu-to-D1 sync triggered successfully.",
          }),
        });
      } else {
        await route.continue();
      }
    });

    // 4. Click manual sync button
    await syncBtn.click();

    // 5. Verify success feedback appears
    const successFeedback = page.locator("text=/飞书数据同步成功|Feishu data synced successfully/i");
    await expect(successFeedback).toBeVisible({ timeout: 10000 });
  });

  test("2. PWA Push Notification Center Dialog & Test Push Dispatch", async ({ page }) => {
    // 1. Log in as Admin
    await loginAs(page, "admin@local.test", "admin-demo-2026");

    // 2. Open Notification Channels Dialog
    const notifBtn = page.locator("[data-testid='open-notification-dialog-trigger']");
    await expect(notifBtn).toBeVisible({ timeout: 10000 });
    await notifBtn.click();

    // 3. Verify dialog is displayed
    const dialogTitle = page.locator("#notification-center-title");
    await expect(dialogTitle).toBeVisible({ timeout: 5000 });

    // 4. Intercept /api/portal/push/test
    await page.route("**/api/portal/push/test", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          attemptedCount: 1,
          sentCount: 1,
          details: [{ success: true, status: 201 }],
        }),
      });
    });

    // 5. Click Test Push button or Enable Push if available
    const testPushBtn = page.locator("[data-testid='test-web-push-action'], [data-testid='enable-web-push-action']").first();
    if (await testPushBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await testPushBtn.click();
      const feedback = page.locator("text=/测试|Test|成功|dispatched|enabled/i").first();
      await expect(feedback).toBeVisible({ timeout: 8000 });
    }

    // 6. Close Dialog
    const closeBtn = page.locator("[data-testid='close-notification-dialog'], [data-testid='done-notification-dialog']").first();
    await closeBtn.click();
    await expect(dialogTitle).not.toBeVisible();
  });

  test("3. Sales Role Manual Feishu Sync Workflow with Real-time Diagnostics", async ({ page }) => {
    // 1. Log in as Sales
    await loginAs(page, "sales@local.test", "sales-demo-2026");

    // 2. Verify Sync button is visible for Sales role
    const syncBtn = page.locator("[data-testid='admin-manual-sync-trigger']");
    await expect(syncBtn).toBeVisible({ timeout: 10000 });

    // 3. Intercept and mock /api/portal/admin/sync-d1
    await page.route("**/api/portal/admin/sync-d1", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ok: true,
            syncedAt: new Date().toISOString(),
            stats: { models: 115, trims: 350, vehicles: 1968, elapsed: 380 },
            message: "Manual Feishu-to-D1 sync triggered successfully by sales.",
          }),
        });
      } else {
        await route.continue();
      }
    });

    // 4. Click manual sync button
    await syncBtn.click();

    // 5. Verify success feedback appears
    const successFeedback = page.locator("text=/飞书数据同步成功|Feishu data synced successfully/i");
    await expect(successFeedback).toBeVisible({ timeout: 10000 });
  });
});


