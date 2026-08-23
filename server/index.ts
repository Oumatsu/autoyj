import handler from "vinext/server/app-router-entry";
import { handlePortalRequest } from "./api/portal";
import { runFeishuScheduledSync } from "./jobs/feishu-sync";
import type { ExecutionContext, WorkerEnv } from "./types";

const STATIC_EXTENSIONS = /\.(webp|png|jpg|jpeg|svg|ico|gif|woff2?|ttf|eot|css|js|map|json|pdf|txt|xml|webmanifest)$/i;

function isStaticAssetPath(pathname: string): boolean {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/pic/") ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/reports/") ||
    pathname.startsWith("/insights/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/logo") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/fonts") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js" ||
    STATIC_EXTENSIONS.test(pathname)
  );
}

function isPublicCacheableRoute(pathname: string): boolean {
  return !pathname.startsWith("/api/");
}


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

    // Direct edge asset serving: bypass Worker runtime JS routing for all static files
    if (isStaticAssetPath(url.pathname)) {
      try {
        const assetResponse = await env.ASSETS.fetch(request);
        if (assetResponse.status === 200 || assetResponse.status === 304 || assetResponse.status === 206) {
          const headers = new Headers(assetResponse.headers);
          if (url.pathname.startsWith("/_next/static/")) {
            headers.set("cache-control", "public, max-age=31536000, immutable");
          } else if (url.pathname.endsWith(".xml")) {
            headers.set("content-type", "application/xml; charset=utf-8");
            headers.set("cache-control", "public, max-age=86400, stale-while-revalidate=604800");
          } else if (url.pathname === "/robots.txt") {
            headers.set("content-type", "text/plain; charset=utf-8");
            headers.set("cache-control", "public, max-age=86400, stale-while-revalidate=604800");
          } else if (url.pathname === "/manifest.webmanifest") {
            headers.set("content-type", "application/manifest+json; charset=utf-8");
            headers.set("cache-control", "public, max-age=86400, stale-while-revalidate=604800");
          } else if (url.pathname === "/sw.js") {
            headers.set("content-type", "application/javascript; charset=utf-8");
            headers.set("cache-control", "no-cache, no-store, must-revalidate, max-age=0");
            headers.set("pragma", "no-cache");
            headers.set("expires", "0");
          } else if (
            url.pathname.startsWith("/pic/") ||
            url.pathname.startsWith("/insights/images/") ||
            url.pathname.startsWith("/assets/") ||
            url.pathname.startsWith("/icons/") ||
            url.pathname.startsWith("/favicon") ||
            url.pathname.startsWith("/logo") ||
            STATIC_EXTENSIONS.test(url.pathname)
          ) {
            headers.set("cache-control", "public, max-age=2592000, stale-while-revalidate=86400");
          } else {
            headers.set("cache-control", "public, max-age=86400, stale-while-revalidate=604800");
          }
          return new Response(assetResponse.body, {
            status: assetResponse.status,
            statusText: assetResponse.statusText,
            headers,
          });
        }
      } catch {
        // Fall through if ASSETS fetch failed
      }
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

    try {
      const response = await handler.fetch(request, env, ctx);

      // Apply Edge caching for public marketing/catalog HTML pages to eliminate Error 1102
      if (
        request.method === "GET" &&
        response.status === 200 &&
        isPublicCacheableRoute(url.pathname)
      ) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("text/html") || response.headers.get("rsc")) {
          const headers = new Headers(response.headers);
          if (!headers.has("cache-control") || headers.get("cache-control")?.includes("no-store")) {
            headers.set("cache-control", "public, max-age=0, s-maxage=300, stale-while-revalidate=86400");
            return new Response(response.body, {
              status: response.status,
              statusText: response.statusText,
              headers,
            });
          }
        }
      }

      return response;
    } catch (fetchError) {
      console.error("[server:edge-worker] Uncaught error during fetch handler:", fetchError);
      return new Response(
        JSON.stringify({
          error: "Internal Server Error",
          message: fetchError instanceof Error ? fetchError.message : "Unexpected worker execution failure",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
  async scheduled(_event: { cron: string }, env: WorkerEnv, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      runFeishuScheduledSync(env).catch((err) => {
        console.error("[cron:feishu-sync] Uncaught error during scheduled sync:", err);
      })
    );
  },
};
