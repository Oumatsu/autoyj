import type { NextConfig } from "vinext";

/**
 * next.config.ts
 *
 * 通过 BUILD_TARGET 环境变量控制构建模式：
 *
 *   BUILD_TARGET=standalone  →  dist/standalone/server.js  (翻译预览服务器)
 *   (未设置)                 →  Cloudflare Pages 格式      (正式环境)
 *
 * vinext 在 standalone 模式下会自动忽略 @cloudflare/vite-plugin，
 * 两种构建完全独立，互不影响。
 */
const isStandalone = process.env.BUILD_TARGET === "standalone";

const config: NextConfig = {
  ...(isStandalone ? { output: "standalone" } : {}),
};

export default config;
