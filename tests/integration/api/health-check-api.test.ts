import { describe, expect, test } from "bun:test";
import { handlePortalRequest } from "../../../server/api/portal";

describe("Integration: System Health Check Endpoint (/api/portal/health)", () => {
  test("GET /api/portal/health returns 200 and database connected when D1 responds", async () => {
    const mockEnv: any = {
      PORTAL_DB: {
        prepare: () => ({
          first: async () => ({ alive: 1 }),
        }),
      },
    };

    const request = new Request("http://localhost:3000/api/portal/health", {
      method: "GET",
    });

    const response = await handlePortalRequest(request, mockEnv);
    expect(response.status).toBe(200);

    const payload = await response.json();
    expect(payload.status).toBe("ok");
    expect(payload.database).toBe("connected");
    expect(payload.service).toBe("autoyj-portal");
    expect(payload.timestamp).toBeDefined();
  });

  test("GET /api/portal/health returns 503 and degraded status when D1 fails", async () => {
    const mockEnv: any = {
      PORTAL_DB: {
        prepare: () => ({
          first: async () => {
            throw new Error("D1 connection timeout");
          },
        }),
      },
    };

    const request = new Request("http://localhost:3000/api/portal/health", {
      method: "GET",
    });

    const response = await handlePortalRequest(request, mockEnv);
    expect(response.status).toBe(503);

    const payload = await response.json();
    expect(payload.status).toBe("degraded");
    expect(payload.database).toBe("degraded");
  });

  test("GET /api/health also responds as standard health alias", async () => {
    const mockEnv: any = {
      PORTAL_DB: {
        prepare: () => ({
          first: async () => ({ alive: 1 }),
        }),
      },
    };

    const request = new Request("http://localhost:3000/api/health", {
      method: "GET",
    });

    const response = await handlePortalRequest(request, mockEnv);
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.status).toBe("ok");
  });
});
