import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

test("quotes persist their own selected vehicle and quantity, while migration backfills legacy quotes", async () => {
  const [schema, migration] = await Promise.all([
    readFile(new URL("../../server/db/schema.sql", import.meta.url), "utf8"),
    readFile(new URL("../../migrations/0002_quote_vehicle_selection.sql", import.meta.url), "utf8"),
  ]);

  expect(schema).toMatch(/CREATE TABLE IF NOT EXISTS quotes[\s\S]*?quantity INTEGER NOT NULL DEFAULT 1/);
  expect(migration).toContain("ALTER TABLE quotes ADD COLUMN quantity INTEGER");
  expect(migration).toContain("UPDATE quotes");
  expect(migration).toContain("FROM inquiries");
});
