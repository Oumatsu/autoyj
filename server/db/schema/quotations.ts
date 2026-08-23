import { relations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { inquiries } from "./inquiries";

export const quotes = sqliteTable("quotes", {
  id: text("id").primaryKey(),
  quoteNo: text("quote_no").notNull().unique(),
  inquiryNo: text("inquiry_no").notNull(),
  customerId: text("customer_id").notNull(),
  vehicleId: text("vehicle_id").notNull(),
  price: real("price").notNull(),
  status: text("status").default("Active"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const negotiations = sqliteTable("negotiations", {
  id: text("id").primaryKey(),
  inquiryNo: text("inquiry_no").notNull(),
  quoteNo: text("quote_no"),
  actorUserId: text("actor_user_id").notNull(),
  actorName: text("actor_name"),
  actorRole: text("actor_role"),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull(),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  orderNo: text("order_no").notNull().unique(),
  inquiryNo: text("inquiry_no").notNull(),
  customerId: text("customer_id").notNull(),
  vehicleId: text("vehicle_id").notNull(),
  quantity: integer("quantity").notNull(),
  status: text("status").default("Pending"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const quotesRelations = relations(quotes, ({ one }) => ({
  inquiry: one(inquiries, {
    fields: [quotes.inquiryNo],
    references: [inquiries.inquiryNo],
  }),
}));

export const negotiationsRelations = relations(negotiations, ({ one }) => ({
  inquiry: one(inquiries, {
    fields: [negotiations.inquiryNo],
    references: [inquiries.inquiryNo],
  }),
  quote: one(quotes, {
    fields: [negotiations.quoteNo],
    references: [quotes.quoteNo],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  inquiry: one(inquiries, {
    fields: [orders.inquiryNo],
    references: [inquiries.inquiryNo],
  }),
}));

export type QuoteRow = typeof quotes.$inferSelect;
export type InsertQuoteRow = typeof quotes.$inferInsert;
export type NegotiationRow = typeof negotiations.$inferSelect;
export type InsertNegotiationRow = typeof negotiations.$inferInsert;
export type OrderRow = typeof orders.$inferSelect;
export type InsertOrderRow = typeof orders.$inferInsert;
