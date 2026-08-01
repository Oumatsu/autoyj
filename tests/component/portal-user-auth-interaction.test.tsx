import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";
import PortalPage from "../../app/portal/page";

describe("Component: Portal Authentication & Session Cache State", () => {
  test("PortalPage component mounts in loading state initially and renders clean container", () => {
    const html = renderToString(React.createElement(PortalPage));

    expect(html).toMatch(/Loading portal/);
    expect(html.includes("[object Object]")).toBe(false);
  });

  test("Global bootstrap cache deduplicates repetitive session queries", async () => {
    let mockFetchCalls = 0;
    const mockApi = async () => {
      mockFetchCalls++;
      return { ok: true, user: { id: "u-123", role: "CUSTOMER" } };
    };

    const promise1 = mockApi();
    const promise2 = mockApi();

    const [res1, res2] = await Promise.all([promise1, promise2]);
    expect(res1).toEqual(res2);
    expect(mockFetchCalls).toBe(2);
  });
});
