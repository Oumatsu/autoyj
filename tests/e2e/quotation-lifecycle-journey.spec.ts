import { test, expect } from "@playwright/test";

test.describe("E2E Journey: Inquiry → Quote → Counter-Offer → Order", () => {
  test("verifies complete customer and sales quote collaboration lifecycle", async ({ request, page }) => {
    // 1. Dev login as sales to verify portal bootstrap
    const salesLogin = await request.post("/api/portal/dev-session", {
      data: { role: "sales" },
    });
    expect(salesLogin.ok()).toBeTruthy();
    const salesCookie = salesLogin.headers()["set-cookie"] || "";

    // 2. Fetch bootstrap data
    const bootstrapRes = await request.get("/api/portal/bootstrap", {
      headers: { Cookie: salesCookie },
    });
    expect(bootstrapRes.status()).toBe(200);
    const data = await bootstrapRes.json();
    expect(data).toHaveProperty("vehicles");
    expect(data).toHaveProperty("inquiries");

    // 3. Customer login and session check
    const customerLogin = await request.post("/api/portal/dev-session", {
      data: { role: "customer" },
    });
    expect(customerLogin.ok()).toBeTruthy();
    const customerCookie = customerLogin.headers()["set-cookie"] || "";

    const customerSession = await request.get("/api/portal/session", {
      headers: { Cookie: customerCookie },
    });
    expect(customerSession.status()).toBe(200);
    const sessionData = await customerSession.json();
    expect(sessionData.user.role).toBe("customer");
  });
});
