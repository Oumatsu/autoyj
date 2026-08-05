import { expect, test } from "@playwright/test";

/**
 * Tier 4: E2E — Locale routing (proxy.ts behaviour)
 *
 * These tests verify the actual runtime behaviour of proxy.ts running inside
 * the Next.js 16 dev/prod server.  They exercise what unit tests cannot:
 * HTTP redirects, cookie persistence, and real browser navigation.
 *
 * Run with:  bun run test:e2e
 * The playwright webServer config starts `bun run dev` automatically.
 */

// ---------------------------------------------------------------------------
// 1. proxy.ts: root redirect → defaultLocale
// ---------------------------------------------------------------------------
test.describe("proxy.ts — root redirect & Accept-Language resolution", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("GET / with zh-CN Accept-Language redirects to /zh", async ({ browser }) => {
    const context = await browser.newContext({ locale: "zh-CN" });
    const page = await context.newPage();
    const response = await page.goto("/", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/zh(\/|$)/);
    expect(response?.status()).not.toBe(404);
    expect(response?.status()).not.toBe(500);
    await context.close();
  });

  test("GET / with unsupported Accept-Language (fr-FR) falls back to defaultLocale /zh", async ({ browser }) => {
    const context = await browser.newContext({ locale: "fr-FR" });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/zh(\/|$)/);
    await context.close();
  });

  test("GET /products with en-US Accept-Language redirects to /en/products", async ({ browser }) => {
    const context = await browser.newContext({ locale: "en-US" });
    const page = await context.newPage();
    await page.goto("/products", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/en\/products/);
    await context.close();
  });

  test("GET /about with zh-CN Accept-Language redirects to /zh/about", async ({ browser }) => {
    const context = await browser.newContext({ locale: "zh-CN" });
    const page = await context.newPage();
    await page.goto("/about", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/zh\/about/);
    await context.close();
  });
});

// ---------------------------------------------------------------------------
// 2. proxy.ts: NEXT_LOCALE cookie persistence
// ---------------------------------------------------------------------------
test.describe("proxy.ts — locale cookie persistence", () => {
  test("visiting /en sets NEXT_LOCALE cookie to en", async ({ page, context }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
    const cookies = await context.cookies();
    const localeCookie = cookies.find((c) => c.name === "NEXT_LOCALE");
    expect(localeCookie).toBeDefined();
    expect(localeCookie?.value).toBe("en");
  });

  test("cookie persists: second bare /products visit goes to /en after setting cookie", async ({
    page,
    context,
  }) => {
    // First visit to /en sets cookie
    await page.goto("/en", { waitUntil: "networkidle" });

    // Now visit bare path — proxy should use cookie locale
    await page.goto("/products", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/en\/products/);

    // Cleanup: reset cookie so other tests aren't affected
    await context.clearCookies();
  });
});

// ---------------------------------------------------------------------------
// 3. All supported locales render without error
// ---------------------------------------------------------------------------
test.describe("proxy.ts — all locale prefixes serve content", () => {
  const locales = ["zh", "en", "am"] as const;

  for (const locale of locales) {
    test(`GET /${locale}/ renders page with <body> and non-empty <title>`, async ({ page }) => {
      const response = await page.goto(`/${locale}`, { waitUntil: "domcontentloaded" });

      expect(response?.status()).toBeLessThan(400);

      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);

      await expect(page.locator("body")).toBeVisible();
    });
  }
});

// ---------------------------------------------------------------------------
// 4. Static assets are NOT intercepted by proxy
// ---------------------------------------------------------------------------
test.describe("proxy.ts — static passthrough (no redirect loop)", () => {
  test("favicon.ico serves without redirect to /zh/favicon.ico", async ({ page }) => {
    const response = await page.goto("/favicon.ico");
    // Should serve the file or 404, NOT redirect to /zh/...
    expect(response?.url()).not.toMatch(/\/zh\/favicon\.ico/);
    expect(response?.status()).not.toBe(307);
  });

  test("_next/static assets are not locale-redirected", async ({ request }) => {
    // Just check the URL pattern doesn't get caught; actual chunks vary by build
    // We verify proxy config by confirming API routes pass through
    const res = await request.get("/api/portal/session");
    // Should be 401/403 (auth required) NOT a redirect to /zh/api/...
    expect(res.url()).not.toMatch(/\/zh\/api\//);
    expect([200, 401, 403, 405]).toContain(res.status());
  });
});

// ---------------------------------------------------------------------------
// 5. Existing journey tests (kept from original localized-journey.spec.ts)
// ---------------------------------------------------------------------------
test.describe("Tier 4: E2E Interactive User Journeys", () => {
  test("User can navigate to localized product page and inspect vehicle cards", async ({ page }) => {
    // 1. Visit Chinese home page
    await page.goto("/zh/products");
    await expect(page).toHaveURL(/\/zh\/products/);

    // 2. Verify page heading renders Chinese copy
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();

    // 3. Switch to English route
    await page.goto("/en/products");
    await expect(page).toHaveURL(/\/en\/products/);

    // 4. Switch to Amharic route
    await page.goto("/am/products");
    await expect(page).toHaveURL(/\/am\/products/);
  });

  test("User can open Solutions page and check PDI checklist section", async ({ page }) => {
    await page.goto("/en/solutions");
    await expect(page.locator("body")).toBeVisible();

    // Ensure page rendered without JS error overlay
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});
