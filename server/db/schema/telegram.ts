import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userTelegramBindings = sqliteTable(
  "user_telegram_bindings",
  {
    userId: text("user_id").primaryKey(),
    chatId: text("chat_id").notNull(),
    telegramUsername: text("telegram_username"),
    firstName: text("first_name"),
    boundAt: text("bound_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_user_telegram_chat_id").on(table.chatId),
  ]
);

export type UserTelegramBindingRow = typeof userTelegramBindings.$inferSelect;
export type InsertUserTelegramBindingRow = typeof userTelegramBindings.$inferInsert;

export const userPushSubscriptions = sqliteTable(
  "user_push_subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    endpoint: text("endpoint").notNull().unique(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    userAgent: text("user_agent").notNull().default(""),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_user_push_sub_user_id").on(table.userId),
  ]
);

export type UserPushSubscriptionRow = typeof userPushSubscriptions.$inferSelect;
export type InsertUserPushSubscriptionRow = typeof userPushSubscriptions.$inferInsert;
