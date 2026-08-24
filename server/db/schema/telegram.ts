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
