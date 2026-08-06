import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

describe("Inquiry visibility schema", () => {
  test("defines public flags and per-user read watermarks", () => {
    const schema = readFileSync("server/db/schema.sql", "utf8");
    const migration = readFileSync("server/db/migrations/0004_inquiry_visibility_and_reads.sql", "utf8");

    expect(schema).toMatch(/CREATE TABLE IF NOT EXISTS inquiries[\s\S]*?is_public INTEGER NOT NULL DEFAULT 0/);
    expect(schema).toMatch(/CREATE TABLE IF NOT EXISTS inquiry_notes[\s\S]*?is_public INTEGER NOT NULL DEFAULT 0/);
    expect(schema).toContain("CREATE TABLE IF NOT EXISTS inquiry_reads");
    expect(migration).toContain("ALTER TABLE inquiries ADD COLUMN is_public INTEGER NOT NULL DEFAULT 0");
    expect(migration).toContain("ALTER TABLE inquiry_notes ADD COLUMN is_public INTEGER NOT NULL DEFAULT 0");
    expect(migration).toContain("PRIMARY KEY (inquiry_no, user_id)");
  });

  test("stores a separate title for inquiries without a selected vehicle resource", () => {
    const schema = readFileSync("server/db/schema.sql", "utf8");
    const migration = readFileSync("server/db/migrations/0005_inquiry_titles.sql", "utf8");

    expect(schema).toMatch(/CREATE TABLE IF NOT EXISTS inquiries[\s\S]*?title TEXT NOT NULL DEFAULT ''/);
    expect(migration).toContain("ALTER TABLE inquiries ADD COLUMN title TEXT NOT NULL DEFAULT ''");
  });
});
