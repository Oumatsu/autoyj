import { relations } from "drizzle-orm";
import { index, integer, primaryKey, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const inquiries = sqliteTable(
  "inquiries",
  {
    id: text("id").primaryKey(),
    inquiryNo: text("inquiry_no").notNull().unique(),
    customerId: text("customer_id").notNull(),
    vehicleId: text("vehicle_id").notNull(),
    vehicleModel: text("vehicle_model").notNull(),
    title: text("title").notNull().default(""),
    quantity: integer("quantity").notNull(),
    destinationPort: text("destination_port"),
    tradeTerm: text("trade_term").notNull(),
    targetPrice: real("target_price"),
    initialNote: text("initial_note"),
    vehicleSnapshotJson: text("vehicle_snapshot_json").notNull().default(""),
    isPublic: integer("is_public").notNull().default(0),
    status: text("status").notNull().default("open"),
    source: text("source").notNull().default("Customer Portal"),
    deletedAt: text("deleted_at"),
    deletedByUserId: text("deleted_by_user_id"),
    deletedByName: text("deleted_by_name"),
    deletionReason: text("deletion_reason"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_inquiries_customer_updated").on(table.customerId, table.updatedAt),
    index("idx_inquiries_deleted_at").on(table.deletedAt),
  ]
);

export const inquiryParticipants = sqliteTable(
  "inquiry_participants",
  {
    id: text("id").primaryKey(),
    inquiryNo: text("inquiry_no").notNull().references(() => inquiries.inquiryNo),
    customerId: text("customer_id"),
    userId: text("user_id").notNull(),
    company: text("company"),
    role: text("role").notNull(),
    accessSource: text("access_source").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("idx_inquiry_participants_user").on(table.userId, table.inquiryNo),
    uniqueIndex("idx_inquiry_participants_unique").on(table.inquiryNo, table.userId),
  ]
);

export const inquiryNotes = sqliteTable(
  "inquiry_notes",
  {
    id: text("id").primaryKey(),
    noteId: text("note_id").notNull().unique(),
    inquiryNo: text("inquiry_no").notNull().references(() => inquiries.inquiryNo),
    parentNoteId: text("parent_note_id"),
    authorUserId: text("author_user_id").notNull(),
    authorName: text("author_name").notNull(),
    authorRole: text("author_role").notNull(),
    body: text("body").notNull(),
    isPublic: integer("is_public").notNull().default(0),
    deletedAt: text("deleted_at"),
    deletedByUserId: text("deleted_by_user_id"),
    deletedByName: text("deleted_by_name"),
    deletionReason: text("deletion_reason"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("idx_inquiry_notes_inquiry_created").on(table.inquiryNo, table.createdAt),
    index("idx_inquiry_notes_deleted_at").on(table.deletedAt),
  ]
);

export const inquiryReads = sqliteTable(
  "inquiry_reads",
  {
    inquiryNo: text("inquiry_no").notNull().references(() => inquiries.inquiryNo),
    userId: text("user_id").notNull(),
    lastReadAt: text("last_read_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.inquiryNo, table.userId] }),
  ]
);

export const inquiryStatusHistory = sqliteTable(
  "inquiry_status_history",
  {
    id: text("id").primaryKey(),
    historyId: text("history_id").notNull().unique(),
    inquiryNo: text("inquiry_no").notNull().references(() => inquiries.inquiryNo),
    fromStatus: text("from_status"),
    toStatus: text("to_status").notNull(),
    reason: text("reason").notNull().default(""),
    actorUserId: text("actor_user_id").notNull(),
    actorName: text("actor_name").notNull(),
    actorRole: text("actor_role").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("idx_inquiry_status_history_inquiry_created").on(table.inquiryNo, table.createdAt),
  ]
);

export const inquiriesRelations = relations(inquiries, ({ many }) => ({
  participants: many(inquiryParticipants),
  notes: many(inquiryNotes),
  reads: many(inquiryReads),
  statusHistory: many(inquiryStatusHistory),
}));

export const inquiryParticipantsRelations = relations(inquiryParticipants, ({ one }) => ({
  inquiry: one(inquiries, {
    fields: [inquiryParticipants.inquiryNo],
    references: [inquiries.inquiryNo],
  }),
}));

export const inquiryNotesRelations = relations(inquiryNotes, ({ one, many }) => ({
  inquiry: one(inquiries, {
    fields: [inquiryNotes.inquiryNo],
    references: [inquiries.inquiryNo],
  }),
  parentNote: one(inquiryNotes, {
    fields: [inquiryNotes.parentNoteId],
    references: [inquiryNotes.noteId],
    relationName: "parentChildNotes",
  }),
  childNotes: many(inquiryNotes, {
    relationName: "parentChildNotes",
  }),
}));

export const inquiryReadsRelations = relations(inquiryReads, ({ one }) => ({
  inquiry: one(inquiries, {
    fields: [inquiryReads.inquiryNo],
    references: [inquiries.inquiryNo],
  }),
}));

export const inquiryStatusHistoryRelations = relations(inquiryStatusHistory, ({ one }) => ({
  inquiry: one(inquiries, {
    fields: [inquiryStatusHistory.inquiryNo],
    references: [inquiries.inquiryNo],
  }),
}));

export type InquiryRow = typeof inquiries.$inferSelect;
export type InsertInquiryRow = typeof inquiries.$inferInsert;
export type InquiryParticipantRow = typeof inquiryParticipants.$inferSelect;
export type InsertInquiryParticipantRow = typeof inquiryParticipants.$inferInsert;
export type InquiryNoteRow = typeof inquiryNotes.$inferSelect;
export type InsertInquiryNoteRow = typeof inquiryNotes.$inferInsert;
export type InquiryReadRow = typeof inquiryReads.$inferSelect;
export type InsertInquiryReadRow = typeof inquiryReads.$inferInsert;
export type InquiryStatusHistoryRow = typeof inquiryStatusHistory.$inferSelect;
export type InsertInquiryStatusHistoryRow = typeof inquiryStatusHistory.$inferInsert;
