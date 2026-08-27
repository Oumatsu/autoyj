import { chromium } from "@playwright/test";
import Database from "bun:sqlite";

async function runPwaPushDiagnostics() {
  console.log("================================================================================");
  console.log("🔍 STARTING AUTOMATED PWA & WEB PUSH REAL-BROWSER DIAGNOSTIC SUITE");
  console.log("================================================================================\n");

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--enable-features=WebNotification,PushMessaging",
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
  });

  const context = await browser.newContext({
    baseURL: "http://localhost:3000",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
  });

  // Explicitly grant notification permissions for origin
  await context.grantPermissions(["notifications"], { origin: "http://localhost:3000" });

  const page = await context.newPage();

  page.on("console", (msg) => {
    console.log(`[Browser Console ${msg.type()}]:`, msg.text());
  });

  page.on("pageerror", (err) => {
    console.error("[Browser Page Error]:", err.message);
  });

  const trackedRequests: Array<{ url: string; method: string; status?: number; responseBody?: any }> = [];
  page.on("response", async (res) => {
    const url = res.url();
    if (url.includes("/api/portal/push/")) {
      const body = await res.json().catch(() => null);
      trackedRequests.push({
        url,
        method: res.request().method(),
        status: res.status(),
        responseBody: body,
      });
      console.log(`[Network Response] ${res.request().method()} ${url} -> ${res.status()}`, JSON.stringify(body));
    }
  });

  console.log("1. Navigating to http://localhost:3000/zh/portal ...");
  await page.goto("http://localhost:3000/zh/portal", { waitUntil: "networkidle" });

  console.log("2. Verifying Service Worker registration in browser context ...");
  const swState = await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) {
      return { supported: false, error: "serviceWorker not in navigator" };
    }
    const regs = await navigator.serviceWorker.getRegistrations();
    const reg = regs[0];
    return {
      supported: true,
      registrationsCount: regs.length,
      activeScript: reg?.active?.scriptURL,
      state: reg?.active?.state,
      permission: Notification.permission,
    };
  });
  console.log("   Service Worker State:", JSON.stringify(swState, null, 2));

  console.log("3. Logging in as Partner Agent test account ...");
  await page.fill("#login-email", "partner@example.com");
  await page.fill("#login-access-code", "partner-demo-2026");
  await page.click('button:has-text("立即登录"), button:has-text("Sign In")');
  await page.waitForTimeout(2000);

  const sessionData = await page.evaluate(async () => {
    const res = await fetch("/api/portal/session");
    return res.json();
  });
  console.log("   Session User:", JSON.stringify(sessionData, null, 2));

  console.log("4. Opening Notification Channels Dialog (🔔) ...");
  const notificationTrigger = page.locator('[data-testid="open-notification-dialog-trigger"]');
  await notificationTrigger.waitFor({ state: "visible", timeout: 10000 });
  await notificationTrigger.click();
  await page.waitForTimeout(1000);
  console.log("   Clicked 🔔 Notification Center button.");

  console.log("5. Clicking '开启浏览器推送' / Subscribing Push Manager in browser ...");
  const enablePushBtn = page.locator('button:has-text("开启浏览器推送"), button:has-text("开启 Web Push")').first();
  if (await enablePushBtn.isVisible()) {
    await enablePushBtn.click();
    await page.waitForTimeout(3000);
    console.log("   Clicked Enable Push button.");
  } else {
    console.log("   Push already granted or button not present.");
  }

  console.log("6. Inspecting browser PushSubscription after subscription action ...");
  const subDetails = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return { subscribed: false };
    const json = sub.toJSON();
    return {
      subscribed: true,
      endpoint: json.endpoint,
      hasP256dh: !!json.keys?.p256dh,
      hasAuth: !!json.keys?.auth,
      p256dhPreview: json.keys?.p256dh?.slice(0, 20) + "...",
      permission: Notification.permission,
    };
  });
  console.log("   Browser PushSubscription Details:", JSON.stringify(subDetails, null, 2));

  console.log("7. Checking SQLite database user_push_subscriptions table ...");
  for (const dbPath of [
    ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/715ce89f38e55e09f583f707106093d56b4618e474ca6fa70fceecdae9a59523.sqlite",
    ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/0625f3c0d5be24f79f643b802ea421f9f427e41f631a244bdc1ee43795750de9.sqlite",
  ]) {
    try {
      const db = new Database(dbPath);
      const records = db.query("SELECT * FROM user_push_subscriptions").all();
      console.log(`   Database [${dbPath}] stored subscriptions: ${records.length}`, records);
    } catch (err: any) {
      console.log(`   Database [${dbPath}] query error:`, err.message);
    }
  }

  console.log("8. Clicking '发送测试通知' (Send Test Push) ...");
  const testPushBtn = page.locator('button:has-text("发送测试通知"), button:has-text("Send Test Push")').first();
  if (await testPushBtn.isVisible()) {
    await testPushBtn.click();
    await page.waitForTimeout(3000);
    console.log("   Clicked Send Test Push button.");
  } else {
    console.log("   Send Test Push button not found in dialog.");
  }

  console.log("9. Verifying test push delivery feedback in Dialog UI ...");
  const dialogContent = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    return dialog ? dialog.textContent : "Dialog not open";
  });
  console.log("   Dialog text snippet:", dialogContent);

  console.log("\n================================================================================");
  console.log("📊 DIAGNOSTIC RUN SUMMARY:");
  console.log("   - Service Worker Registered:", swState.supported && swState.registrationsCount > 0);
  console.log("   - Push Manager Subscribed:", subDetails.subscribed);
  console.log("   - Tracked Push Network Requests:", trackedRequests.length);
  console.log("================================================================================\n");

  await browser.close();
}

runPwaPushDiagnostics().catch((err) => {
  console.error("FATAL DIAGNOSTIC ERROR:", err);
  process.exit(1);
});
