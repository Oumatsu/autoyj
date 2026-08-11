export type PortalRole = "admin" | "sales" | "sourcing" | "finance" | "partner" | "customer";
export type PriceTier = "hidden" | "partner" | "vip" | "internal";
export type AccountType = "internal" | "external";

export type LocalUser = {
  userId: string;
  customerId: string;
  name: string;
  email: string;
  company: string;
  accountType: AccountType;
  role: PortalRole;
  priceTier: PriceTier;
  accessCode: string;
  status: "Active" | "Disabled";
};

/**
 * 本地用户登录凭证与账号库
 * 摆脱向飞书 API 发送用户表查询带来的耗时，实现 <5ms 极速响应
 */
export const localUserStore: LocalUser[] = [
  {
    userId: "USR-ADMIN-01",
    customerId: "USR-ADMIN-01",
    name: "Admin Manager",
    email: "admin@local.test",
    company: "Youguard Operations",
    accountType: "internal",
    role: "admin",
    priceTier: "internal",
    accessCode: "admin-demo-2026",
    status: "Active",
  },
  {
    userId: "USR-SALES-01",
    customerId: "USR-SALES-01",
    name: "Sales Lead",
    email: "sales@local.test",
    company: "Youguard Sales Team",
    accountType: "internal",
    role: "sales",
    priceTier: "internal",
    accessCode: "sales-demo-2026",
    status: "Active",
  },
  {
    userId: "PARTNER-001",
    customerId: "PARTNER-001",
    name: "Partner Agent",
    email: "partner@example.com",
    company: "Addis Auto Imports PLC",
    accountType: "external",
    role: "partner",
    priceTier: "partner",
    accessCode: "partner-demo-2026",
    status: "Active",
  },
  {
    userId: "PARTNER-002",
    customerId: "PARTNER-002",
    name: "Aebissa G",
    email: "AebissaG@kairosaddis.com",
    company: "Kairos Addis",
    accountType: "external",
    role: "partner",
    priceTier: "partner",
    accessCode: "Aebissa123",
    status: "Active",
  },
  {
    userId: "PARTNER-003",
    customerId: "PARTNER-003",
    name: "Wagari G",
    email: "WagariG@kairosaddis.com",
    company: "Kairos Addis",
    accountType: "external",
    role: "partner",
    priceTier: "partner",
    accessCode: "WagariG123",
    status: "Active",
  },
  {
    userId: "CUS-002",
    customerId: "CUS-002",
    name: "VIP Customer",
    email: "customer@example.com",
    company: "Green Ride Enterprise",
    accountType: "external",
    role: "customer",
    priceTier: "vip",
    accessCode: "customer-demo-2026",
    status: "Active",
  },
];

export function findLocalUser(email: string, accessCode: string): LocalUser | null {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = accessCode.trim();

  const match = localUserStore.find((u) => {
    // Strict: accessCode must match this specific user record exactly
    if (cleanCode && u.accessCode !== cleanCode) return false;

    const uEmail = u.email.toLowerCase();
    if (uEmail === cleanEmail) return true;

    // Accept shorthand role aliases (e.g. "admin" → admin@local.test)
    if (u.role === "admin" && (cleanEmail === "admin" || cleanEmail.startsWith("admin@"))) return true;
    if (u.role === "sales" && (cleanEmail === "sales" || cleanEmail.startsWith("sales@"))) return true;
    if (u.role === "partner" && (cleanEmail === "partner" || cleanEmail.startsWith("partner@"))) return true;
    if (u.role === "customer" && (cleanEmail === "customer" || cleanEmail.startsWith("customer@"))) return true;

    return false;
  });

  return match && match.status === "Active" ? match : null;
}
