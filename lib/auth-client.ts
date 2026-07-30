import { createAuthClient } from "better-auth/react";
import { customSessionClient } from "better-auth/client/plugins";

/**
 * Better Auth 官方标准客户端实例
 * 全自动管理 CSRF Token、Session 状态缓存与 HttpOnly Cookies
 */
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
  plugins: [customSessionClient()],
});
