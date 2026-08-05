import { betterAuth } from "better-auth";
import { customSession } from "better-auth/plugins";
import { findLocalUser, localUserStore } from "./users.ts";
import { SESSION_TTL_7D, SESSION_UPDATE_AGE_1D } from "./constants";

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
  const secret = env.PORTAL_SESSION_SECRET;
  const resolvedSecret = secret && secret.length >= 32 
    ? secret 
    : "autoyj-portal-session-secret-fallback-key-32chars";
  if (!secret || secret.length < 32) {
    console.warn("[auth] PORTAL_SESSION_SECRET not set or too short — using default fallback key");
  }

  // PORTAL_BASE_URL defaults to localhost only for local development
  const baseURL = env.PORTAL_BASE_URL || "http://localhost:3000";


  return betterAuth({
    baseURL,
    secret: resolvedSecret,
    emailAndPassword: {
      enabled: true,
      disableSignUp: true, // 🚫 彻底关闭公开注册入口
      async password({ hash, password }) {
        // Access codes are pre-shared fixed strings, not personal passwords.
        // We store and compare them as-is (no bcrypt hash needed).
        // Use constant-time comparison to prevent timing attacks.
        if (hash.length !== password.length) return false;
        let mismatch = 0;
        for (let i = 0; i < hash.length; i++) {
          mismatch |= hash.charCodeAt(i) ^ password.charCodeAt(i);
        }
        return mismatch === 0;
      },
    },
    session: {
      expiresIn: SESSION_TTL_7D,       // 7 days
      updateAge: SESSION_UPDATE_AGE_1D, // refresh token daily
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
