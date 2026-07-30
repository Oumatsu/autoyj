import test from "node:test";
import assert from "node:assert/strict";

test("SingleFlight deduplication prevents duplicate pending fetches", async () => {
  const flightMap = new Map();
  let realFetchCount = 0;

  function singleFlight(key, fn) {
    if (flightMap.has(key)) return flightMap.get(key);
    const promise = fn().finally(() => flightMap.delete(key));
    flightMap.set(key, promise);
    return promise;
  }

  async function mockFetchData() {
    realFetchCount++;
    await new Promise((resolve) => setTimeout(resolve, 50));
    return { ok: true, data: "bootstrap_payload" };
  }

  // Simulate 20 concurrent requests coming at the exact same millisecond
  const concurrentRequests = Array.from({ length: 20 }, () =>
    singleFlight("bootstrap_key", mockFetchData)
  );

  const results = await Promise.all(concurrentRequests);

  assert.equal(results.length, 20);
  assert.equal(realFetchCount, 1, "20 concurrent requests must trigger only 1 actual fetch!");
  assert.equal(results[0].data, "bootstrap_payload");
});
