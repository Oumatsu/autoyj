import { describe, expect, test } from "bun:test";

describe("Unit: SingleFlight Request Deduplication", () => {
  test("SingleFlight deduplication prevents duplicate pending fetches", async () => {
    const flightMap = new Map<string, Promise<any>>();
    let realFetchCount = 0;

    function singleFlight<T>(key: string, fn: () => Promise<T>): Promise<T> {
      if (flightMap.has(key)) return flightMap.get(key)!;
      const promise = fn().finally(() => flightMap.delete(key));
      flightMap.set(key, promise);
      return promise;
    }

    async function mockFetchData() {
      realFetchCount++;
      await new Promise((resolve) => setTimeout(resolve, 20));
      return { ok: true, data: "bootstrap_payload" };
    }

    const concurrentRequests = Array.from({ length: 20 }, () =>
      singleFlight("bootstrap_key", mockFetchData)
    );

    const results = await Promise.all(concurrentRequests);

    expect(results.length).toBe(20);
    expect(realFetchCount).toBe(1);
    expect(results[0].data).toBe("bootstrap_payload");
  });
});
