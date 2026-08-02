import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import fs from "node:fs";
import path from "node:path";

// 🌟 单点输入原则 (Single Source of Truth)：
// 从唯一源文件 .dev.vars 读取所有开发配置，自动映射补全 NEXT_PUBLIC_ 前缀，无需维护多份文件。
function loadDevVars() {
  const devVarsPath = path.resolve(__dirname, ".dev.vars");
  if (!fs.existsSync(devVarsPath)) return {};
  
  const content = fs.readFileSync(devVarsPath, "utf-8");
  const vars: Record<string, string> = {};
  
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx > -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        vars[k] = v;
      }
    }
  }
  return vars;
}

const devVars = loadDevVars();

// 自动补全 process.env 与 NEXT_PUBLIC_ 变量
for (const [k, v] of Object.entries(devVars)) {
  process.env[k] = v;
  if (k.startsWith("TOLGEE_")) {
    process.env[`NEXT_PUBLIC_${k}`] = v;
  }
}

export default defineConfig({
  define: {
    "process.env.NEXT_PUBLIC_TOLGEE_API_KEY": JSON.stringify(devVars.TOLGEE_API_KEY || ""),
    "process.env.NEXT_PUBLIC_TOLGEE_API_URL": JSON.stringify(devVars.TOLGEE_API_URL || "https://app.tolgee.io"),
  },
  server: {
    strictPort: false,
  },
  plugins: [
    vinext(),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});

