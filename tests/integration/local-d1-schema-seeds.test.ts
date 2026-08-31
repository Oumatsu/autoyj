import { expect, test } from "bun:test";

test("local D1 schema does not seed the four deprecated test login emails", async () => {
  const schema = await Bun.file("server/db/schema.sql").text();

  expect(schema).not.toContain("admin@local.test");
  expect(schema).not.toContain("sales@local.test");
  expect(schema).not.toContain("partner@example.com");
  expect(schema).not.toContain("customer@example.com");
  expect(schema).not.toContain("-- Seed System Users into D1");
});
