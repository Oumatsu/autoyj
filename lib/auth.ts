import { betterAuth } from "better-auth";
import { customSession } from "better-auth/plugins";
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
export function createFeishuAuth(env: Record<string, unknown> = {}) {
  const secret = (env.PORTAL_SESSION_SECRET as string | undefined);
  const resolvedSecret = secret && secret.length >= 32
    ? secret
    : "autoyj-portal-session-secret-fallback-key-32chars";
  if (!secret || secret.length < 32) {
    console.warn("[auth] PORTAL_SESSION_SECRET not set or too short — using default fallback key");
  }

  const baseURL = (env.PORTAL_BASE_URL as string | undefined) || "http://localhost:3000";
  const database = env.PORTAL_DB as D1Database | undefined;

  return betterAuth({
    baseURL,
    secret: resolvedSecret,
    ...(database ? { database } : {}),
    user: {
      additionalFields: {
        user_id: { type: "string", required: false },
        customer_id: { type: "string", required: false },
        company: { type: "string", required: false },
        account_type: { type: "string", required: false, defaultValue: "external" },
        role: { type: "string", required: false, defaultValue: "customer" },
        price_tier: { type: "string", required: false, defaultValue: "vip" },
        status: { type: "string", required: false, defaultValue: "Active" },
      },
    },
    emailAndPassword: {
      enabled: true,
      disableSignUp: true, // 🚫 关闭公开注册入口（后台统一预存账号）
      password: {
        async verify({ hash, password }) {
          if (hash.length !== password.length) return false;
          let mismatch = 0;
          for (let i = 0; i < hash.length; i++) {
            mismatch |= hash.charCodeAt(i) ^ password.charCodeAt(i);
          }
          return mismatch === 0;
        },
      },
    },
    session: {
      expiresIn: SESSION_TTL_7D,       // 7 days
      updateAge: SESSION_UPDATE_AGE_1D, // refresh token daily
    },
    plugins: [
      customSession(async ({ user, session }) => {
        const fields = user as unknown as Record<string, unknown>;
        const rawRole = fields.role || "customer";
        const rawPriceTier = fields.price_tier || "vip";
        const rawAccountType = fields.account_type || "external";
        return {
          session,
          user: {
            ...user,
            userId: fields.user_id as string || user.id,
            customerId: fields.customer_id as string || user.id,
            company: fields.company as string || "Youguard",
            accountType: rawAccountType as AccountType,
            role: rawRole as PortalRole,
            priceTier: rawPriceTier as PriceTier,
          },
        };
      }),
    ],
  });
}
