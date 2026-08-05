import { chromium } from "@playwright/test";

async function main() {
  console.log("🚀 Starting Mode 1: Agentic Direct Browser QA (Zero External Keys)...");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  console.log("🌐 Navigating to http://localhost:3000/portal...");
  await page.goto("http://localhost:3000/portal", { waitUntil: "domcontentloaded" });

  console.log("🔍 Inspecting login form accessibility locators...");
  const emailInput = page.locator("#login-email");
  const codeInput = page.locator("#login-access-code");
  const submitBtn = page.locator("form button[type='submit'], form button", { hasText: /Sign In/i });

  await emailInput.waitFor({ state: "visible", timeout: 5000 });
  await codeInput.waitFor({ state: "visible", timeout: 5000 });
  await submitBtn.waitFor({ state: "visible", timeout: 5000 });

  console.log("🔑 Filling partner test credentials...");
  await emailInput.fill("partner@example.com");
  await codeInput.fill("partner-demo-2026");

  console.log("👆 Submitting login form...");
  await submitBtn.click();

  console.log("⏳ Verifying portal workspace layout and logout button...");
  const logoutBtn = page.locator("button", { hasText: /退出登录|Log Out|Sign Out|Logout/i }).first();
  await logoutBtn.waitFor({ state: "visible", timeout: 10000 });

  const headingText = await page.locator("h1, h2").first().innerText();
  console.log(`✨ Workspace loaded successfully! First heading: "${headingText}"`);

  console.log("🚪 Testing logout flow...");
  await logoutBtn.click();
  await emailInput.waitFor({ state: "visible", timeout: 5000 });

  await browser.close();

  if (consoleErrors.length > 0) {
    console.error("❌ Detected runtime console errors:", consoleErrors);
    process.exit(1);
  }

  console.log("✅ Mode 1 Agentic Direct Browser QA Passed 100% (Zero Errors, Zero External Keys)!");
}

main().catch((err) => {
  console.error("Agentic QA Error:", err);
  process.exit(1);
});
