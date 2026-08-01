import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/portal/bootstrap", () => {
    return HttpResponse.json({
      ok: true,
      user: { id: "usr-mock-123", email: "test@youguard.auto", role: "CUSTOMER" },
      vehicles: [
        { id: "v-1", name: "BYD Seagull 2025", brand: "BYD", priceUsd: 12500 }
      ],
    });
  }),
  http.get("/api/portal/public/insights", () => {
    return HttpResponse.json({
      ok: true,
      insights: [
        { id: "ins-1", title: "Ethiopia EV Market Report 2026", date: "2026-07-01" }
      ],
    });
  }),
];
