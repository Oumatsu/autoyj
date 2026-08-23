import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: integer("emailVerified").notNull().default(0),
    image: text("image"),
    createdAt: integer("createdAt").notNull(),
    updatedAt: integer("updatedAt").notNull(),
    userId: text("user_id"),
    customerId: text("customer_id"),
    company: text("company"),
    accountType: text("account_type").default("external"),
    role: text("role").default("customer"),
    status: text("status").default("Active"),
  },
  (table) => [
    index("idx_user_email").on(table.email),
  ]
);

export const sessions = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: integer("expiresAt").notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    createdAt: integer("createdAt").notNull(),
    updatedAt: integer("updatedAt").notNull(),
  },
  (table) => [
    index("idx_session_userId").on(table.userId),
  ]
);

export const accounts = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    accessTokenExpiresAt: integer("accessTokenExpiresAt"),
    refreshTokenExpiresAt: integer("refreshTokenExpiresAt"),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("createdAt").notNull(),
    updatedAt: integer("updatedAt").notNull(),
  },
  (table) => [
    index("idx_account_userId").on(table.userId),
  ]
);

export const verifications = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt").notNull(),
  createdAt: integer("createdAt"),
  updatedAt: integer("updatedAt"),
});

export const portalUsers = sqliteTable(
  "portal_users",
  {
    userId: text("user_id").primaryKey(),
    customerId: text("customer_id").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    company: text("company").notNull().default(""),
    whatsapp: text("whatsapp").notNull().default(""),
    telegramChatId: text("telegram_chat_id").notNull().default(""),
    telegramUsername: text("telegram_username").notNull().default(""),
    accountType: text("account_type").notNull().default("external"),
    role: text("role").notNull().default("customer"),
    password: text("password").notNull(),
    status: text("status").notNull().default("Active"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_portal_users_email").on(table.email),
    index("idx_portal_users_role").on(table.role),
  ]
);

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export type UserRow = typeof users.$inferSelect;
export type InsertUserRow = typeof users.$inferInsert;
export type SessionRow = typeof sessions.$inferSelect;
export type InsertSessionRow = typeof sessions.$inferInsert;
export type AccountRow = typeof accounts.$inferSelect;
export type InsertAccountRow = typeof accounts.$inferInsert;
export type VerificationRow = typeof verifications.$inferSelect;
export type InsertVerificationRow = typeof verifications.$inferInsert;
export type PortalUserRow = typeof portalUsers.$inferSelect;
export type InsertPortalUserRow = typeof portalUsers.$inferInsert;
