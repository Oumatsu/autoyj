import { describe, expect, test } from "bun:test";
import {
  queryVehicleModels,
  queryVehicles,
  queryVehicleTrims,
  invalidateVehicleCache,
} from "../../server/db/d1";

describe("D1 Vehicle In-Memory Cache Optimization", () => {
  test("caches query results and reduces repetitive database queries", async () => {
    let d1QueriesExecuted = 0;
    const mockDb = {
      prepare(sql: string) {
        return {
          bind(...args: any[]) {
            return this;
          },
          async all<T>() {
            d1QueriesExecuted++;
            if (/FROM\s+vehicle_models/i.test(sql)) {
              return { results: [{ id: "m-1", brand: "BYD", model: "Yangwang U8" }] as T[] };
            }
            if (/FROM\s+vehicles/i.test(sql)) {
              return { results: [{ id: "v-1", brand: "BYD", model: "Yangwang U8", stage: "connected" }] as T[] };
            }
            if (/FROM\s+vehicle_trims/i.test(sql)) {
              return { results: [{ id: "t-1", model_id: "m-1", trim: "Deluxe" }] as T[] };
            }
            return { results: [] as T[] };
          },
        };
      },
    } as unknown as D1Database;

    invalidateVehicleCache(mockDb);

    // 1st call: hits database
    const models1 = await queryVehicleModels(mockDb);
    expect(models1.length).toBe(1);
    expect(d1QueriesExecuted).toBe(1);

    // 2nd call: hits in-memory cache, no extra DB query
    const models2 = await queryVehicleModels(mockDb);
    expect(models2.length).toBe(1);
    expect(d1QueriesExecuted).toBe(1);

    // Vehicles query
    const vehicles1 = await queryVehicles(mockDb);
    expect(vehicles1.length).toBe(1);
    expect(d1QueriesExecuted).toBe(2);

    const vehicles2 = await queryVehicles(mockDb);
    expect(vehicles2.length).toBe(1);
    expect(d1QueriesExecuted).toBe(2);

    // Trims query
    const trims1 = await queryVehicleTrims(mockDb, "m-1");
    expect(trims1.length).toBe(1);
    expect(d1QueriesExecuted).toBe(3);

    const trims2 = await queryVehicleTrims(mockDb, "m-1");
    expect(trims2.length).toBe(1);
    expect(d1QueriesExecuted).toBe(3);

    // After invalidation, next call queries DB again
    invalidateVehicleCache(mockDb);
    await queryVehicleModels(mockDb);
    expect(d1QueriesExecuted).toBe(4);
  });
});
