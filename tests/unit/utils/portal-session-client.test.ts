import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import {
  getPortalSession,
  invalidatePortalSession,
} from "../../../lib/portal-session-client";

describe("portal-session-client", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    invalidatePortalSession();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    invalidatePortalSession();
  });

  test("fetches and returns portal session successfully", async () => {
    const mockUserData = { user: { role: "dealer", name: "John Doe" } };

    globalThis.fetch = mock(async (url: string | URL | Request) => {
      expect(url.toString()).toBe("/api/portal/session");
      return new Response(JSON.stringify(mockUserData), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as unknown as typeof fetch;

    const result = await getPortalSession();
    expect(result).toEqual(mockUserData);
  });

  test("deduplicates concurrent calls to getPortalSession", async () => {
    let fetchCount = 0;
    const mockUserData = { user: { role: "admin", name: "Alice" } };

    globalThis.fetch = mock(async () => {
      fetchCount++;
      return new Response(JSON.stringify(mockUserData), { status: 200 });
    }) as unknown as typeof fetch;

    const p1 = getPortalSession();
    const p2 = getPortalSession();

    expect(p1).toBe(p2);

    const [res1, res2] = await Promise.all([p1, p2]);
    expect(res1).toEqual(mockUserData);
    expect(res2).toEqual(mockUserData);
    expect(fetchCount).toBe(1);
  });

  test("throws error when response is not ok and resets session promise for retry", async () => {
    let fetchCount = 0;

    globalThis.fetch = mock(async () => {
      fetchCount++;
      if (fetchCount === 1) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      return new Response(JSON.stringify({ user: { role: "user" } }), { status: 200 });
    }) as unknown as typeof fetch;

    await expect(getPortalSession()).rejects.toThrow("Unable to load portal session");
    expect(fetchCount).toBe(1);

    // Subsequent call should retry fetch since sessionPromise was reset on catch
    const retryResult = await getPortalSession();
    expect(retryResult).toEqual({ user: { role: "user" } });
    expect(fetchCount).toBe(2);
  });

  test("invalidatePortalSession resets cached session promise", async () => {
    let fetchCount = 0;
    const mockUserData = { user: { role: "admin" } };

    globalThis.fetch = mock(async () => {
      fetchCount++;
      return new Response(JSON.stringify(mockUserData), { status: 200 });
    }) as unknown as typeof fetch;

    await getPortalSession();
    expect(fetchCount).toBe(1);

    // Call getPortalSession again (should return cached promise without fetch)
    await getPortalSession();
    expect(fetchCount).toBe(1);

    // Invalidate and fetch again
    invalidatePortalSession();
    await getPortalSession();
    expect(fetchCount).toBe(2);
  });
});
