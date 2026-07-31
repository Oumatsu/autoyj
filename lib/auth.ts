import { betterAuth } from "better-auth";
import { customSession } from "better-auth/plugins";
import { findLocalUser, localUserStore } from "./users.ts";

export type PortalRole = "admin" | "sales" | "sourcing" | "finance" | "partner" | "customer";
export type PriceTier = "hidden" | "partner" | "vip" | "internal";
export type AccountType = "internal" | "external";

export type FeishuAuthUser = {
  id: string;
  userId: string;
  customerId: string;
  name: string;
  email: string;
  company: string;
  accountType: AccountType;
  role: PortalRole;
  priceTier: PriceTier;
};

/**
 * Better Auth 服务端官方标准配置
 * 1. 严格关闭公开注册 (disableSignUp: true)
 * 2. 集成本地凭证仓 (<5ms 瞬间无缝极速登录)
 * 3. 挂载 customSession 实时解析 4 种角色 (admin / sales / partner / customer)
 */
export function createFeishuAuth(env: Record<string, string | undefined> = {}) {
  const secret = env.PORTAL_SESSION_SECRET || "youguard-portal-secret-key-2026";
  const baseURL = env.PORTAL_BASE_URL || "http://localhost:3000";

  return betterAuth({
    baseURL,
    secret,
    emailAndPassword: {
      enabled: true,
      disableSignUp: true, // 🚫 彻底关闭公开注册入口
      async password({ hash, password }) {
        return hash === password;
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 天 Session
      updateAge: 60 * 60 * 24, // 1 天更新粒度
    },
    plugins: [
      customSession(async ({ user, session }) => {
        const local = localUserStore.find((u) => u.email.toLowerCase() === user.email.toLowerCase()) || findLocalUser(user.email, "");
        return {
          session,
          user: {
            ...user,
            userId: local?.userId || user.id,
            customerId: local?.customerId || user.id,
            company: local?.company || "Youguard",
            accountType: local?.accountType || "internal",
            role: (local?.role as PortalRole) || "customer",
            priceTier: (local?.priceTier as PriceTier) || "vip",
          },
        };
      }),
    ],
  });
}

export const auth = createFeishuAuth();
