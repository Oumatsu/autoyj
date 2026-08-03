import { defineConfig, type Plugin } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
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

      // 注入 SSR 侧（process.env）
      for (const [k, v] of Object.entries(vars)) {
        process.env[k] ??= v;
        // 派生浏览器可见变量
        if (k.startsWith("TOLGEE_")) {
          process.env[`NEXT_PUBLIC_${k}`] ??= v;
        }
      }
    },
  };
}

/** 将 NEXT_PUBLIC_* 变量替换为静态字符串，让浏览器 bundle 可以访问 */
function buildDefines(): Record<string, string> {
  const vars = parseDevVars();
  const defines: Record<string, string> = {};

  for (const [k, v] of Object.entries(vars)) {
    // 直接写了 NEXT_PUBLIC_ 前缀的变量
    if (k.startsWith("NEXT_PUBLIC_")) {
      defines[`import.meta.env.${k}`] = JSON.stringify(v);
    }
    // TOLGEE_ 自动派生
    if (k.startsWith("TOLGEE_")) {
      defines[`import.meta.env.NEXT_PUBLIC_${k}`] = JSON.stringify(v);
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
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
