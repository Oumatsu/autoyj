import * as Sentry from "@sentry/nextjs";
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

function resolveRootLocale(request: Request): string {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)NEXT_LOCALE=([a-z]{2})/i);
  if (match && (match[1] === "zh" || match[1] === "en" || match[1] === "am")) {
    return match[1].toLowerCase();
  }
  const acceptLang = request.headers.get("accept-language") || "";
  if (/^zh\b|[\s,]zh\b/i.test(acceptLang)) return "zh";
  if (/^am\b|[\s,]am\b/i.test(acceptLang)) return "am";
  return "en";
}

function isPublicMarketingPage(pathname: string): boolean {
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/portal") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin")
  ) {
    return false;
  }
  return /^\/(zh|en|am)(\/.*)?$/.test(pathname);
}

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Instant zero-CPU edge locale redirect for root path to eliminate Error 1102
    if (url.pathname === "/" || url.pathname === "") {
      const targetLocale = resolveRootLocale(request);
      const redirectUrl = new URL(`/${targetLocale}`, request.url);
      return new Response(null, {
        status: 307,
        headers: {
          Location: redirectUrl.toString(),
          "Set-Cookie": `NEXT_LOCALE=${targetLocale}; Path=/; Max-Age=31536000; SameSite=Lax`,
          "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
          Vary: "Accept-Language, Cookie",
        },
      });
    }

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

    // Check Cloudflare Edge Cache for public marketing HTML
    let cache: any;
    let cacheKey: Request | undefined;
    if (
      request.method === "GET" &&
      isPublicMarketingPage(url.pathname) &&
      typeof caches !== "undefined" &&
      (caches as any).default
    ) {
      try {
        cache = (caches as any).default;
        // Standard normalized GET cache key per full URL path (including query)
        cacheKey = new Request(url.toString(), { method: "GET" });
        const cachedRes = await cache.match(cacheKey);
        if (cachedRes) {
          const hitHeaders = new Headers(cachedRes.headers);
          hitHeaders.set("cf-edge-cache", "HIT");
          return new Response(cachedRes.body, {
            status: cachedRes.status,
            statusText: cachedRes.statusText,
            headers: hitHeaders,
          });
        }
      } catch {
        // Fall through on cache match error
      }
    }

    try {
      const response = await handler.fetch(request, env, ctx);

      // Apply Edge caching for public marketing/catalog HTML pages to eliminate Error 1102 and reduce TTFB to < 20ms
      if (
        request.method === "GET" &&
        response.status === 200 &&
        isPublicMarketingPage(url.pathname)
      ) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("text/html") || response.headers.get("rsc")) {
          const responseHeaders = new Headers(response.headers);
          responseHeaders.set("cache-control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800");
          responseHeaders.set("cf-edge-cache", "MISS");

          // For Cloudflare Cache API: clone response and strip Set-Cookie (which causes Cloudflare to refuse caching)
          if (cache && cacheKey) {
            const storeHeaders = new Headers(response.headers);
            storeHeaders.delete("set-cookie");
            storeHeaders.set("cache-control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800");
            storeHeaders.set("vary", "Accept-Encoding");
            storeHeaders.set("cf-edge-cache", "HIT");

            const responseToCache = new Response(response.clone().body, {
              status: response.status,
              statusText: response.statusText,
              headers: storeHeaders,
            });
            ctx.waitUntil(cache.put(cacheKey, responseToCache).catch(() => {}));
          }

          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
          });
        }
      }

      return response;
    } catch (fetchError) {
      console.error("[server:edge-worker] Uncaught error during fetch handler:", fetchError);
      Sentry.captureException(fetchError, {
        tags: { runtime: "cloudflare-workers", path: url.pathname },
      });
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
        Sentry.captureException(err, {
          tags: { runtime: "cloudflare-workers", job: "feishu-sync" },
        });
      })
    );
  },
};

