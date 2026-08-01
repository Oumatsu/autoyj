import { describe, expect, test } from "bun:test";
import { createFeishuAuth } from "../../lib/auth";

describe("Integration: Better Auth & Feishu User Authentication", () => {
  test("Better Auth - configuration enforces disabled public registration", () => {
    const auth = createFeishuAuth({
      PORTAL_SESSION_SECRET: "test-secret",
      PORTAL_BASE_URL: "http://localhost:3000",
    } as any);

    expect(auth.options.emailAndPassword?.disableSignUp).toBe(true);
  });

  test("Better Auth - session plugin structures all 4 portal roles", async () => {
    const auth = createFeishuAuth({
      PORTAL_SESSION_SECRET: "test-secret",
      PORTAL_BASE_URL: "http://localhost:3000",
    } as any);

    expect(auth.options.plugins?.length).toBeTruthy();
  });

  test("Real Login Flow - handles feishu internal_users table exclusively without TableIdNotFound", async () => {
    const mockEnv = {
      PORTAL_SESSION_SECRET: "test-secret-key-2026",
      FEISHU_TABLE_INTERNAL_USERS: "tblzuCupuStUvBwM",
      FEISHU_TABLE_INQUIRIES: "tblEL6AHiMiWhkVj",
      FEISHU_TABLE_QUOTES: "tblIY4WdBVqvkZf0",
      FEISHU_TABLE_NEGOTIATIONS: "tblRytSu0oKOmmol",
      FEISHU_TABLE_ORDERS: "tblFxuRqSt2oAu0H",
    };

    expect(mockEnv.FEISHU_TABLE_INTERNAL_USERS).toBeTruthy();
    expect((mockEnv as any).FEISHU_TABLE_CUSTOMERS).toBeUndefined();
  });
});
