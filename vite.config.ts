import { defineConfig, type Plugin } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { VitePWA } from "vite-plugin-pwa";
import fs from "node:fs";
import path from "node:path";

// ─────────────────────────────────────────────────────────────────────────────
// 单点输入原则 (Single Source of Truth)
// ─────────────────────────────────────────────────────────────────────────────
// 唯一数据源：.dev.vars（Cloudflare Workers 标准格式）
// 自动派生规则：
//   TOLGEE_*  → 同时注入为 NEXT_PUBLIC_TOLGEE_*（浏览器端可访问）
//
// 无需维护 .env.local 或任何第二份配置文件。
// ─────────────────────────────────────────────────────────────────────────────

type Vars = Record<string, string>;

function parseDevVars(): Vars {
  const devVarsPath = path.join(import.meta.dirname, ".dev.vars");
  if (!fs.existsSync(devVarsPath)) return {};

  return fs
    .readFileSync(devVarsPath, "utf-8")
    .split("\n")
    .reduce<Vars>((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return acc;
      const idx = trimmed.indexOf("=");
      if (idx > -1) {
        acc[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
      }
      return acc;
    }, {});
}

/** 将 .dev.vars 注入到 process.env，供 SSR / Workers 运行时使用 */
function devVarsPlugin(): Plugin {
  return {
    name: "dev-vars-injector",
    config() {
      const vars = parseDevVars();

      // 注入 SSR 侧（process.env），以 process.env 现有的值为最高优先级
      for (const [k, v] of Object.entries(vars)) {
        process.env[k] ??= v;
        if (k.startsWith("TOLGEE_")) {
          process.env[`NEXT_PUBLIC_${k}`] ??= v;
        }
      }
    },
  };
}

/** 将 NEXT_PUBLIC_* 变量替换为静态字符串，让浏览器 bundle 可以访问 */
function buildDefines(): Record<string, string> {
  const devVars = parseDevVars();
  const defines: Record<string, string> = {};

  // 优先级：process.env.NEXT_PUBLIC_* > process.env.TOLGEE_* > devVars.NEXT_PUBLIC_* > devVars.TOLGEE_*
  const apiKey =
    process.env.NEXT_PUBLIC_TOLGEE_API_KEY ||
    process.env.TOLGEE_API_KEY ||
    devVars.NEXT_PUBLIC_TOLGEE_API_KEY ||
    devVars.TOLGEE_API_KEY;

  const apiUrl =
    process.env.NEXT_PUBLIC_TOLGEE_API_URL ||
    process.env.TOLGEE_API_URL ||
    devVars.NEXT_PUBLIC_TOLGEE_API_URL ||
    devVars.TOLGEE_API_URL;

  const projectId =
    process.env.NEXT_PUBLIC_TOLGEE_PROJECT_ID ||
    process.env.TOLGEE_PROJECT_ID ||
    devVars.NEXT_PUBLIC_TOLGEE_PROJECT_ID ||
    devVars.TOLGEE_PROJECT_ID;

  if (apiKey) {
    defines["process.env.NEXT_PUBLIC_TOLGEE_API_KEY"] = JSON.stringify(apiKey);
    defines["import.meta.env.NEXT_PUBLIC_TOLGEE_API_KEY"] = JSON.stringify(apiKey);
  }
  if (apiUrl) {
    defines["process.env.NEXT_PUBLIC_TOLGEE_API_URL"] = JSON.stringify(apiUrl);
    defines["import.meta.env.NEXT_PUBLIC_TOLGEE_API_URL"] = JSON.stringify(apiUrl);
  }
  if (projectId) {
    defines["process.env.NEXT_PUBLIC_TOLGEE_PROJECT_ID"] = JSON.stringify(projectId);
    defines["import.meta.env.NEXT_PUBLIC_TOLGEE_PROJECT_ID"] = JSON.stringify(projectId);
  }

  // 收集其他 NEXT_PUBLIC_* 环境变量
  const allKeys = new Set([...Object.keys(process.env), ...Object.keys(devVars)]);
  for (const k of allKeys) {
    if (k.startsWith("NEXT_PUBLIC_") && !defines[`process.env.${k}`]) {
      const val = process.env[k] || devVars[k];
      if (val !== undefined) {
        defines[`process.env.${k}`] = JSON.stringify(val);
        defines[`import.meta.env.${k}`] = JSON.stringify(val);
      }
    }
  }

  return defines;
}

export default defineConfig({
  define: buildDefines(),
  optimizeDeps: {
    exclude: [
      "@better-auth/core",
      "@better-auth/core/api",
      "@better-auth/core/context",
      "@better-auth/core/db",
      "@better-auth/core/db/adapter",
      "@better-auth/core/env",
      "@better-auth/core/error",
      "@better-auth/core/instrumentation",
      "@better-auth/core/oauth2",
      "@better-auth/core/social-providers",
      "@better-auth/core/utils/db",
      "@better-auth/core/utils/deprecate",
      "@better-auth/core/utils/error-codes",
      "@better-auth/core/utils/fetch-metadata",
      "@better-auth/core/utils/host",
      "@better-auth/core/utils/id",
      "@better-auth/core/utils/ip",
      "@better-auth/core/utils/is-api-error",
      "@better-auth/core/utils/json",
      "@better-auth/core/utils/url",
      "@better-auth/kysely-adapter",
      "@better-auth/memory-adapter",
      "@better-auth/telemetry",
      "@better-auth/utils",
      "@better-auth/utils/base64",
      "@better-auth/utils/binary",
      "@better-auth/utils/hash",
      "@better-auth/utils/hmac",
      "@better-auth/utils/otp",
      "@better-auth/utils/password",
      "@better-auth/utils/random",
      "@better-fetch/fetch",
      "@noble/ciphers/chacha.js",
      "@noble/ciphers/utils.js",
      "@noble/hashes/hkdf.js",
      "@noble/hashes/sha2.js",
      "@noble/hashes/sha3.js",
      "@noble/hashes/utils.js",
      "better-auth",
      "better-call",
      "defu",
      "jose",
      "jose/errors",
      "kysely",
      "zod",
    ],
  },
  plugins: [
    devVarsPlugin(),
    vinext(),
    VitePWA({
      outDir: "dist/client",
      registerType: "autoUpdate",
      strategies: "injectManifest",
      srcDir: "service-worker",
      filename: "sw.ts",
      injectManifest: {
        globDirectory: "dist/client",
        globPatterns: ["**/*.{js,css,webmanifest}"],
      },
      manifest: {
        name: "Youguard - EV Sourcing for Africa",
        short_name: "Youguard Auto",
        id: "/",
        description: "China's premier EV export partner for African dealers. Expert sourcing, transparent PDI, turnkey dealer empowerment.",
        start_url: "/en",
        scope: "/",
        display: "standalone",
        orientation: "portrait-primary",
        background_color: "#0b1425",
        theme_color: "#0b1425",
        related_applications: [
          {
            platform: "webapp",
            url: "/manifest.webmanifest",
            id: "/",
          },
        ],
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-1024.png",
            sizes: "1024x1024",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/maskable-icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icons/maskable-icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icons/maskable-icon-1024.png",
            sizes: "1024x1024",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/logo.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
    cloudflare({
      // Keep local SSR on the persisted Miniflare bindings used by Wrangler.
      persistState: { path: ".wrangler/local-d1" },
      remoteBindings: false,
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
