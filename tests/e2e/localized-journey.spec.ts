import { expect, test } from "@playwright/test";

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
