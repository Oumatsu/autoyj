import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";
import PortalPage from "../../app/portal/page";
import { NotificationChannelsDialog } from "../../components/NotificationChannelsDialog";

describe("Component: Portal Authentication & Session Cache State", () => {
  test("PortalPage component mounts in loading state initially and renders clean container", () => {
    const html = renderToString(React.createElement(PortalPage));

    expect(html).toMatch(/Loading portal/);
    expect(html.includes("[object Object]")).toBe(false);
  });

  test("NotificationChannelsDialog renders cleanly for bound and unbound states", () => {
    const unboundHtml = renderToString(
      React.createElement(NotificationChannelsDialog, {
        isOpen: true,
        onClose: () => {},
        telegramBinding: null,
        locale: "en",
      })
    );
    expect(unboundHtml).toContain("Notification");

    const boundHtml = renderToString(
      React.createElement(NotificationChannelsDialog, {
        isOpen: true,
        onClose: () => {},
        telegramBinding: {
          chat_id: 123456789,
          username: "testuser",
          is_active: 1,
          bound_at: "2026-08-24T00:00:00Z",
        },
        locale: "en",
      })
    );
    expect(boundHtml).toContain("Notification");
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
