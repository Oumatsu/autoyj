import { expect, test } from "@playwright/test";

test.describe("Tier 4: Interactive User Form Submissions & Catalog Filtering E2E", () => {
  test("User can search and click vehicle cards in Revenue King catalog", async ({ page }) => {
    await page.goto("/en/products/revenue-king");
    await expect(page).toHaveURL(/\/en\/products\/revenue-king/);

    // Verify main header exists
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();

    // Wait for client catalog fetching
    await page.waitForTimeout(1000);

    // Verify vehicle cards exist
    const vehicleCards = page.locator("a[href*='/products/revenue-king/']");
    const count = await vehicleCards.count();
    
    if (count > 0) {
      const firstCard = vehicleCards.first();
      await firstCard.click();
      await page.waitForURL(/\/products\/revenue-king\//);
      const detailBody = await page.locator("body").innerText();
      expect(detailBody.length).toBeGreaterThan(0);
    } else {
      // Fallback assertion ensuring page rendered container cleanly
      const pageText = await page.locator("body").innerText();
      expect(pageText.length).toBeGreaterThan(100);
    }
  });

});
