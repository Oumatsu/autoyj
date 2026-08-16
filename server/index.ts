import handler from "vinext/server/app-router-entry";
import { handlePortalRequest } from "./api/portal";
import { runFeishuScheduledSync } from "./jobs/feishu-sync";
import type { ExecutionContext, WorkerEnv } from "./types";

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    const upgradeHeader = request.headers.get("Upgrade");
    if (upgradeHeader && upgradeHeader.toLowerCase() === "websocket") {
      try {
        return await env.ASSETS.fetch(request);
      } catch {
        return new Response(null, { status: 101, statusText: "Switching Protocols" });
      }
    }

    if (url.pathname === "/_vinext/image") {
      const assetPath = url.searchParams.get("url") || url.pathname;
      const assetRequest = new Request(new URL(assetPath, request.url), {
        headers: request.headers,
      });
      const assetResponse = await env.ASSETS.fetch(assetRequest);
      if (assetResponse.status === 200) {
        const headers = new Headers(assetResponse.headers);
        headers.set("cache-control", "public, max-age=31536000, immutable");
        return new Response(assetResponse.body, {
          status: assetResponse.status,
          statusText: assetResponse.statusText,
          headers,
        });
      }
      return assetResponse;
    }

    if (url.pathname.startsWith("/api/portal/")) {
      return handlePortalRequest(request, env);
    }

    // Feishu sync is cron-only; request-time manual triggers are intentionally disabled.
    if (url.pathname === "/api/admin/sync-now") {
      return new Response(JSON.stringify({
        ok: false,
        error: "Manual sync is disabled; scheduled cron only",
      }), {
        status: 410,
        headers: { "Content-Type": "application/json" },
      });
    }

    return handler.fetch(request, env, ctx);
  },
  async scheduled(_event: { cron: string }, env: WorkerEnv, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(runFeishuScheduledSync(env));
  },
};
