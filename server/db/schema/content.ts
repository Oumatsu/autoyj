import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const articles = sqliteTable(
  "articles",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    category: text("category"),
    date: text("date"),
    readTime: text("read_time"),
    coverImage: text("cover_image"),
    overview: text("overview"),
    content: text("content"),
    status: text("status").default("Published"),
    sortOrder: integer("sort_order").default(0),
    syncedAt: text("synced_at").notNull().default(sql`(datetime('now'))`),
  },
  (table) => [
    index("idx_articles_slug").on(table.slug),
  ]
);

export const academyLessons = sqliteTable(
  "academy_lessons",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    category: text("category"),
    tag: text("tag"),
    description: text("description"),
    level: text("level"),
    duration: text("duration"),
    date: text("date"),
    content: text("content"),
    sortOrder: integer("sort_order").default(0),
    syncedAt: text("synced_at").notNull().default(sql`(datetime('now'))`),
  },
  (table) => [
    index("idx_academy_lessons_slug").on(table.slug),
  ]
);

export const academyVault = sqliteTable("academy_vault", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type"),
  description: text("description"),
  fileSize: text("file_size"),
  format: text("format"),
  downloadUrl: text("download_url"),
  category: text("category"),
  sortOrder: integer("sort_order").default(0),
  syncedAt: text("synced_at").notNull().default(sql`(datetime('now'))`),
});

export const publicContactSubmissions = sqliteTable("public_contact_submissions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  message: text("message").notNull().default(""),
  createdAt: text("created_at").notNull(),
  status: text("status").notNull().default("new"),
});

export type ArticleRow = typeof articles.$inferSelect;
export type InsertArticleRow = typeof articles.$inferInsert;
export type AcademyLessonRow = typeof academyLessons.$inferSelect;
export type InsertAcademyLessonRow = typeof academyLessons.$inferInsert;
export type AcademyVaultRow = typeof academyVault.$inferSelect;
export type InsertAcademyVaultRow = typeof academyVault.$inferInsert;
export type PublicContactSubmissionRow = typeof publicContactSubmissions.$inferSelect;
export type InsertPublicContactSubmissionRow = typeof publicContactSubmissions.$inferInsert;
