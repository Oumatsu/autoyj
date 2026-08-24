import { describe, expect, test } from "bun:test";
import { eq, desc } from "drizzle-orm";
import { getDb, schema } from "../../../server/db/client";

describe("Integration: Drizzle ORM Type-Safe D1 Database Layer", () => {
  test("creates typed Drizzle instance over D1 interface and builds queries", async () => {
    let lastQuery = "";
    const mockInquiry = {
      id: "inq-1",
      inquiry_no: "INQ-20260823-001",
      customer_id: "cus-1",
      vehicle_id: "veh-1",
      vehicle_model: "BYD Yangwang U8",
      title: "Bulk Order for Dubai Port",
      quantity: 5,
      destination_port: "Jebel Ali",
      trade_term: "CIF",
      target_price: 120000,
      initial_note: "Urgent shipment",
      vehicle_snapshot_json: "{}",
      is_public: 1,
      status: "open",
      source: "Customer Portal",
      deleted_at: null,
      deleted_by_user_id: null,
      deleted_by_name: null,
      deletion_reason: null,
      created_at: "2026-08-23T10:00:00.000Z",
      updated_at: "2026-08-23T10:00:00.000Z",
    };

    const mockD1: any = {
      prepare: (query: string) => {
        lastQuery = query;
        return {
          bind: (..._args: any[]) => ({
            all: async () => ({ results: [mockInquiry] }),
            raw: async () => [Object.values(mockInquiry)],
            run: async () => ({ success: true }),
          }),
        };
      },
      batch: async () => [],
      exec: async () => ({ count: 0, duration: 0 }),
    };

    const db = getDb(mockD1);

    // 1. Select with where clause
    const items = await db
      .select()
      .from(schema.inquiries)
      .where(eq(schema.inquiries.inquiryNo, "INQ-20260823-001"))
      .orderBy(desc(schema.inquiries.createdAt));

    expect(items).toBeDefined();
    expect(items.length).toBe(1);
    expect(items[0].inquiryNo).toBe("INQ-20260823-001");
    expect(items[0].vehicleModel).toBe("BYD Yangwang U8");
    expect(lastQuery).toContain('from "inquiries"');
    expect(lastQuery).toContain('"inquiries"."inquiry_no" = ?');
  });

  test("supports typed relational schema mappings for vehicles and trims", async () => {
    const mockSelected = ["mod-1", "BYD", "Yangwang U8"];

    const mockD1: any = {
      prepare: () => ({
        bind: () => ({
          all: async () => ({ results: [{ id: "mod-1", brand: "BYD", model: "Yangwang U8" }] }),
          raw: async () => [mockSelected],
          run: async () => ({ success: true }),
        }),
      }),
    };

    const db = getDb(mockD1);
    const models = await db
      .select({
        id: schema.vehicleModels.id,
        brand: schema.vehicleModels.brand,
        model: schema.vehicleModels.model,
      })
      .from(schema.vehicleModels)
      .where(eq(schema.vehicleModels.brand, "BYD"));

    expect(models.length).toBe(1);
    expect(models[0].brand).toBe("BYD");
    expect(models[0].model).toBe("Yangwang U8");
  });
});
