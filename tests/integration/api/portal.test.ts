import { describe, expect, test } from "bun:test";
import { handlePortalRequest } from "../../../server/api/portal";
import type { PortalEnv as Env } from "../../../server/types";

describe("server/api/portal handlePortalRequest", () => {
  function makeEnv() {
    const db = {
      prepare(_sql: string) {
        return {
          bind() { return this; },
          async first() { return null; },
          async all() { return { results: [] }; },
          async run() { return { success: true }; },
        };
      },
      async batch() { return []; },
    };
    return { PORTAL_DB: db, ENVIRONMENT: "test" } as unknown as Env;
  }

  test("returns 404 for unknown portal route", async () => {
    const env = makeEnv();
    const req = new Request("http://localhost:3000/api/portal/non-existent-route-xyz");
    const res = await handlePortalRequest(req, env);
    expect(res.status).toBe(404);
  });

  test("handles unauthenticated route safely", async () => {
    const env = makeEnv();
    const req = new Request("http://localhost:3000/api/portal/vehicle-models");
    const res = await handlePortalRequest(req, env);
    expect([200, 401, 404]).toContain(res.status);
  });
});
