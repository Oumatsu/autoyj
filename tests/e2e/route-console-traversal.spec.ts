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
  test("keeps the retired service-centre quote route unreachable in every locale", async ({ page }) => {
    for (const locale of ["zh", "en", "am"]) {
      const response = await page.goto(`/${locale}/solutions/request-quote`, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBe(404);
    }
  });

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

      const body = page.locator("body");
      await expect(body).toBeVisible();
      const text = await body.innerText().catch(() => "");
      expect(text.includes("[object Object]")).toBe(false);
      expect(consoleErrors).toEqual([]);
    });
  }
});
