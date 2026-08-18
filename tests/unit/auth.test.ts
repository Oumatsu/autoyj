import { describe, expect, test } from "bun:test";
import { createFeishuAuth } from "../../lib/auth";

describe("Unit: createFeishuAuth Configuration & Session Invariants", () => {
  test("createFeishuAuth initializes with default secret fallback and custom session plugin", () => {
    const auth = createFeishuAuth({});
    expect(auth).toBeDefined();
    expect(typeof auth.handler).toBe("function");
  });

  test("createFeishuAuth initializes with custom PORTAL_SESSION_SECRET and BASE_URL", () => {
    const auth = createFeishuAuth({
      PORTAL_SESSION_SECRET: "custom-super-secure-portal-session-secret-key-2026",
      PORTAL_BASE_URL: "https://portal.autoyj.com",
    });
    expect(auth).toBeDefined();
    expect(auth.options.baseURL).toBe("https://portal.autoyj.com");
  });
});
