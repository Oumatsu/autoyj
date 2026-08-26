import { test, expect } from "@playwright/test";

test.describe("E2E Journey: Inquiry → Quote → Counter-Offer → Order", () => {
  test("verifies complete customer and sales quote collaboration lifecycle", async ({ request }) => {
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

    // 4. Customer creates an inquiry
    const createInquiryRes = await request.post("/api/portal/inquiries", {
      headers: { Cookie: customerCookie },
      data: {
        vehicleId: data.vehicles?.[0]?.id || "V-001",
        vehicleModel: "BYD Seal 2026",
        title: "Bulk Fleet Purchase 5 units",
        quantity: 5,
        tradeTerm: "FOB",
        notes: "Inquiring about FOB price for 5 units to Djibouti port.",
      },
    });
    expect(createInquiryRes.status()).toBe(201);
    const inquiryResult = await createInquiryRes.json();
    expect(inquiryResult).toHaveProperty("inquiryNo");
    const inquiryNo = inquiryResult.inquiryNo;
    expect(typeof inquiryNo).toBe("string");

    // 5. Sales creates quote for the inquiry
    const createQuoteRes = await request.post("/api/portal/quotes", {
      headers: { Cookie: salesCookie },
      data: {
        inquiryNo,
        vehicleId: data.vehicles?.[0]?.id || "V-001",
        quantity: 5,
        unitPrice: 28500,
      },
    });
    expect(createQuoteRes.status()).toBe(201);
    const quoteResult = await createQuoteRes.json();
    expect(quoteResult).toHaveProperty("quoteNo");
    const quoteNo = quoteResult.quoteNo;
    expect(typeof quoteNo).toBe("string");

    // 6. Customer accepts the quotation -> triggers order creation
    const acceptQuoteRes = await request.post(`/api/portal/quotes/${encodeURIComponent(quoteNo)}/accept`, {
      headers: { Cookie: customerCookie },
      data: {},
    });
    expect(acceptQuoteRes.status()).toBe(201);
    const acceptResult = await acceptQuoteRes.json();
    expect(acceptResult).toHaveProperty("orderNo");
    expect(typeof acceptResult.orderNo).toBe("string");
    expect(acceptResult.orderNo.length).toBeGreaterThan(0);
  });

  test("sales adds a partner to an inquiry topic", async ({ request }) => {
    const salesLogin = await request.post("/api/portal/dev-session", { data: { role: "sales" } });
    const salesCookie = salesLogin.headers()["set-cookie"] || "";
    const customerLogin = await request.post("/api/portal/dev-session", { data: { role: "customer" } });
    const customerCookie = customerLogin.headers()["set-cookie"] || "";
    const catalog = await request.get("/api/portal/bootstrap", { headers: { Cookie: salesCookie } });
    const data = await catalog.json();
    const createInquiry = await request.post("/api/portal/inquiries", {
      headers: { Cookie: customerCookie },
      data: { vehicleId: data.vehicles?.[0]?.id || "V-001", vehicleModel: "Shared vehicle", title: "Shared topic", quantity: 1, tradeTerm: "FOB", notes: "Partner collaboration" },
    });
    expect(createInquiry.status()).toBe(201);
    const { inquiryNo } = await createInquiry.json();

    const before = await request.get(`/api/portal/inquiries/${encodeURIComponent(inquiryNo)}/participants`, { headers: { Cookie: salesCookie } });
    expect(before.status()).toBe(200);
    const candidate = (await before.json()).candidates.find((entry: { role: string }) => entry.role === "partner");
    expect(candidate).toBeTruthy();
    const added = await request.post(`/api/portal/inquiries/${encodeURIComponent(inquiryNo)}/participants`, {
      headers: { Cookie: salesCookie }, data: { userId: candidate.userId },
    });
    expect(added.status()).toBe(201);
    const after = await request.get(`/api/portal/inquiries/${encodeURIComponent(inquiryNo)}/participants`, { headers: { Cookie: salesCookie } });
    expect((await after.json()).participants).toEqual(expect.arrayContaining([expect.objectContaining({ userId: candidate.userId, role: "partner" })]));
  });
});
