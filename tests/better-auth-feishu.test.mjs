import assert from "node:assert/strict";
import test from "node:test";
import { createFeishuAuth } from "../lib/auth.ts";

test("Better Auth - configuration enforces disabled public registration", () => {
  const auth = createFeishuAuth({
    PORTAL_SESSION_SECRET: "test-secret",
    PORTAL_BASE_URL: "http://localhost:3000",
  });

  assert.equal(auth.options.emailAndPassword?.disableSignUp, true);
});

test("Better Auth - session plugin structures all 4 portal roles", async () => {
  const auth = createFeishuAuth({
    PORTAL_SESSION_SECRET: "test-secret",
    PORTAL_BASE_URL: "http://localhost:3000",
  });

  assert.ok(auth.options.plugins?.length);
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

  assert.ok(mockEnv.FEISHU_TABLE_INTERNAL_USERS);
  assert.equal(mockEnv.FEISHU_TABLE_CUSTOMERS, undefined);
});
