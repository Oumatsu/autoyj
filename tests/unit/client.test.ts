import { describe, expect, test } from "bun:test";
import { getDb, schema } from "../../server/db/client";

describe("Drizzle ORM Client & Schema Definitions", () => {
  test("schema exports all 21 core domain tables", () => {
    expect(schema.vehicleModels).toBeDefined();
    expect(schema.vehicleTrims).toBeDefined();
    expect(schema.vehicles).toBeDefined();
    expect(schema.inquiries).toBeDefined();
    expect(schema.inquiryNotes).toBeDefined();
    expect(schema.inquiryParticipants).toBeDefined();
    expect(schema.inquiryReads).toBeDefined();
    expect(schema.inquiryStatusHistory).toBeDefined();
    expect(schema.quotes).toBeDefined();
    expect(schema.negotiations).toBeDefined();
    expect(schema.orders).toBeDefined();
    expect(schema.users).toBeDefined();
    expect(schema.sessions).toBeDefined();
    expect(schema.accounts).toBeDefined();
    expect(schema.verifications).toBeDefined();
    expect(schema.portalUsers).toBeDefined();
    expect(schema.userTelegramBindings).toBeDefined();
    expect(schema.articles).toBeDefined();
    expect(schema.academyLessons).toBeDefined();
    expect(schema.academyVault).toBeDefined();
    expect(schema.publicContactSubmissions).toBeDefined();
  });

  test("getDb factory accepts a D1Database mock and creates a Drizzle client", () => {
    const mockD1: any = {
      prepare: () => ({
        bind: () => ({
          all: async () => ({ results: [] }),
          raw: async () => [],
          run: async () => ({ success: true }),
        }),
      }),
      batch: async () => [],
      exec: async () => ({ count: 0, duration: 0 }),
    };

    const db = getDb(mockD1);
    expect(db).toBeDefined();
    expect(typeof db.select).toBe("function");
    expect(typeof db.insert).toBe("function");
    expect(typeof db.update).toBe("function");
    expect(typeof db.delete).toBe("function");
    expect(db.query).toBeDefined();
  });
});
