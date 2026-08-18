import { test, expect } from "@playwright/test";

const routesToTest = [
  "/zh",
  "/en",
  "/am",
  "/zh/portal",
  "/en/portal",
  "/am/portal",
  "/zh/dashboard",
  "/en/dashboard",
  "/am/dashboard",
  "/zh/dashboard/vehicles",
  "/en/dashboard/quotes",
  "/am/dashboard/orders",
  "/zh/products",
  "/en/products",
  "/am/products",
  "/zh/products/revenue-king",
  "/en/products/revenue-king/byd-seagull",
  "/zh/solutions",
  "/en/solutions",
  "/am/solutions",
  "/zh/solutions/configure-kit",
  "/en/solutions/request-quote",
  "/zh/academy",
  "/en/academy",
  "/am/academy",
  "/zh/insights",
  "/en/insights",
  "/am/insights",
  "/zh/about",
  "/en/about",
  "/am/about",
  "/zh/company",
  "/en/company",
  "/am/company",
  "/zh/privacy",
  "/en/privacy",
  "/am/privacy",
  "/zh/terms",
  "/en/terms",
  "/am/terms",
  "/zh/qr",
  "/en/qr",
  "/am/qr",
];

test.describe("Tier 4: E2E Real Browser Traversal & Console Interception", () => {
  for (const route of routesToTest) {
    test(`visits ${route} without console errors or warnings`, async ({ page }) => {
      const consoleErrors: string[] = [];

      page.on("console", (msg) => {
        const text = msg.text();
        // Ignore static asset 404 resources (e.g. un-uploaded WebP images/favicons) & dev server logs
        if (text.includes("Failed to load resource") || text.includes("favicon.ico")) {
          return;
        }
        if (msg.type() === "error" || msg.type() === "warning") {
          consoleErrors.push(`[${msg.type()}] ${text}`);
        }
      });

      page.on("pageerror", (err) => {
        if (!err.message.includes("NEXT_REDIRECT")) {
          consoleErrors.push(`[UnhandledException] ${err.message}`);
        }
      });

      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBeLessThan(400);
      await page.waitForLoadState("load");
      await page.waitForTimeout(200);

      const content = await page.content();
      expect(content.includes("[object Object]")).toBe(false);
      expect(consoleErrors).toEqual([]);
    });
  }
});
