import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
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
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
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
