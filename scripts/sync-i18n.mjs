/**
 * sync-i18n.mjs
 *
 * 从飞书多维表格拉取三张多语言翻译表（zh_locale / en_locale / am_locale），
 * 将 flat key-value 还原为嵌套对象，写入 i18n/translations/*.ts 中。
 *
 * Usage:
 *   node scripts/sync-i18n.mjs               # 拉取并写入所有三份语言文件
 *   node scripts/sync-i18n.mjs --dry-run      # 打印将要写入的内容，但不实际覆盖文件
 *   node scripts/sync-i18n.mjs --locale zh    # 只同步中文
 *
 * 环境变量（从 .dev.vars 读取）：
 *   FEISHU_APP_ID
 *   FEISHU_APP_SECRET
 *   FEISHU_BASE_APP_TOKEN
 *   FEISHU_TABLE_I18N_ZH   （飞书中文翻译表的 table_id）
 *   FEISHU_TABLE_I18N_EN   （飞书英文翻译表的 table_id）
 *   FEISHU_TABLE_I18N_AM   （飞书阿姆语翻译表的 table_id）
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

// ─── 参数解析 ─────────────────────────────────────────────────
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const onlyLocale = args.includes("--locale")
  ? args[args.indexOf("--locale") + 1]
  : null;

// ─── 加载 .dev.vars 环境变量 ───────────────────────────────────
function loadDevVars(path = ".dev.vars") {
  const fullPath = resolve(process.cwd(), path);
  if (!existsSync(fullPath)) return {};
  const lines = readFileSync(fullPath, "utf8").split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const idx = trimmed.indexOf("=");
    env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
  return env;
}

const env = { ...process.env, ...loadDevVars() };

function requireEnv(key) {
  const val = env[key];
  if (!val) {
    throw new Error(`Missing required env var: ${key}. Please set it in .dev.vars`);
  }
  return val;
}

// ─── 飞书 API 封装 ────────────────────────────────────────────
const FEISHU_API = "https://open.feishu.cn";

async function getToken() {
  const appId = requireEnv("FEISHU_APP_ID");
  const appSecret = requireEnv("FEISHU_APP_SECRET");
  const res = await fetch(
    `${FEISHU_API}/open-apis/auth/v3/tenant_access_token/internal`,
    {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
    }
  );
  const data = await res.json();
  if (data.code !== 0 || !data.tenant_access_token) {
    throw new Error(`Feishu auth failed: ${data.msg || res.statusText}`);
  }
  return data.tenant_access_token;
}

/**
 * 分页拉取飞书表格的所有行
 * @param {string} token       - tenant_access_token
 * @param {string} baseToken   - FEISHU_BASE_APP_TOKEN
 * @param {string} tableId     - table_id (如 tblXXXXXX)
 * @returns {Array<{Key: string, Value: string}>}
 */
async function fetchAllRecords(token, baseToken, tableId) {
  const baseUrl = `${FEISHU_API}/open-apis/bitable/v1/apps/${baseToken}/tables/${tableId}/records`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "content-type": "application/json; charset=utf-8",
  };

  const records = [];
  let pageToken = "";
  let hasMore = true;

  while (hasMore) {
    const url = pageToken
      ? `${baseUrl}?page_size=500&page_token=${encodeURIComponent(pageToken)}`
      : `${baseUrl}?page_size=500`;

    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(
        `Feishu API error: ${res.status} ${res.statusText} for table ${tableId}`
      );
    }
    const data = await res.json();
    if (data.code !== 0) {
      throw new Error(`Feishu API error ${data.code}: ${data.msg} for table ${tableId}`);
    }

    const items = data.data?.items || [];
    for (const item of items) {
      const key = extractText(item.fields?.Key);
      const value = extractText(item.fields?.Value);
      if (key) records.push({ key, value: value ?? "" });
    }

    hasMore = data.data?.has_more ?? false;
    pageToken = data.data?.page_token ?? "";
  }

  return records;
}

/**
 * 从飞书字段值中提取纯文本（兼容文本类型和富文本类型）
 */
function extractText(field) {
  if (field === undefined || field === null) return "";
  if (typeof field === "string") return field;
  if (typeof field === "number") return String(field);
  // 富文本格式：[{ type: "text", text: "..." }, ...]
  if (Array.isArray(field)) {
    return field
      .map((seg) => (typeof seg === "object" ? seg.text ?? "" : String(seg)))
      .join("");
  }
  return String(field);
}

// ─── 平铺 key-value → 嵌套对象 ───────────────────────────────
/**
 * 将 "about.heritage.heading" 这样的 dot-notation 键值对，
 * 还原为深层嵌套的 JavaScript 对象。
 */
function buildNestedObject(records) {
  const root = {};
  for (const { key, value } of records) {
    const parts = key.split(".");
    let current = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (current[part] === undefined || typeof current[part] !== "object") {
        current[part] = {};
      }
      current = current[part];
    }
    const lastPart = parts[parts.length - 1];
    // 尝试解析 JSON 数组（如 "[{\"label\":\"...\"}]"），否则当字符串存储
    if (typeof value === "string" && value.trimStart().startsWith("[")) {
      try {
        current[lastPart] = JSON.parse(value);
      } catch {
        current[lastPart] = value;
      }
    } else {
      current[lastPart] = value;
    }
  }
  return root;
}

// ─── 对象序列化为 TS 模块格式 ──────────────────────────────────
/**
 * 将嵌套对象序列化为格式化的 TypeScript export default { ... } 字符串。
 */
function serializeToTS(obj, indent = 2) {
  function serialize(val, depth) {
    const pad = " ".repeat(depth * indent);
    const padInner = " ".repeat((depth + 1) * indent);

    if (Array.isArray(val)) {
      if (val.length === 0) return "[]";
      const items = val
        .map((item) => `${padInner}${serialize(item, depth + 1)}`)
        .join(",\n");
      return `[\n${items},\n${pad}]`;
    }

    if (val !== null && typeof val === "object") {
      const entries = Object.entries(val);
      if (entries.length === 0) return "{}";
      const lines = entries
        .map(([k, v]) => {
          // 如果 key 包含特殊字符或空格，使用引号包裹
          const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
          return `${padInner}${safeKey}: ${serialize(v, depth + 1)}`;
        })
        .join(",\n");
      return `{\n${lines},\n${pad}}`;
    }

    if (typeof val === "string") {
      // 转义反引号字符，使用双引号字符串
      const escaped = val
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r");
      return `"${escaped}"`;
    }

    return JSON.stringify(val);
  }

  return `export default ${serialize(obj, 0)};\n`;
}

// ─── 主流程 ───────────────────────────────────────────────────
const LOCALES = [
  {
    locale: "zh",
    envKey: "FEISHU_TABLE_I18N_ZH",
    outFile: "i18n/translations/zh.ts",
    label: "中文",
  },
  {
    locale: "en",
    envKey: "FEISHU_TABLE_I18N_EN",
    outFile: "i18n/translations/en.ts",
    label: "English",
  },
  {
    locale: "am",
    envKey: "FEISHU_TABLE_I18N_AM",
    outFile: "i18n/translations/am.ts",
    label: "አማርኛ",
  },
];

async function main() {
  console.log("🌐 autoYJ i18n Sync — Feishu → Local TS\n");

  // 校验基础配置是否存在
  const baseToken = requireEnv("FEISHU_BASE_APP_TOKEN");

  // 过滤要同步的语言
  const targets = onlyLocale
    ? LOCALES.filter((l) => l.locale === onlyLocale)
    : LOCALES;

  if (targets.length === 0) {
    console.error(`❌ 未知 locale: ${onlyLocale}。可选: zh, en, am`);
    process.exit(1);
  }

  // 检查所有目标表的环境变量是否配置
  const missingTableIds = targets.filter((t) => !env[t.envKey]);
  if (missingTableIds.length > 0) {
    console.warn("⚠️  以下飞书翻译表 ID 尚未配置（将跳过）：");
    for (const t of missingTableIds) {
      console.warn(`   ${t.envKey}  →  ${t.outFile}`);
    }
    console.warn(
      "\n   请在 .dev.vars 中添加这些变量后重新运行，或先在飞书中创建对应的翻译表。"
    );
    console.warn(
      "   如需一键在飞书中创建这三张表，运行: npm run setup:i18n\n"
    );
  }

  const configuredTargets = targets.filter((t) => !!env[t.envKey]);
  if (configuredTargets.length === 0) {
    console.log("没有可同步的表格。退出。");
    process.exit(0);
  }

  // 获取 Token
  console.log("🔑 获取飞书 Access Token...");
  let token;
  try {
    token = await getToken();
    console.log("   ✅ 授权成功\n");
  } catch (err) {
    console.error(`❌ 飞书授权失败: ${err.message}`);
    console.error("   请检查 FEISHU_APP_ID 和 FEISHU_APP_SECRET 是否正确。");
    process.exit(1);
  }

  // 逐语言同步
  let successCount = 0;
  for (const target of configuredTargets) {
    const tableId = env[target.envKey];
    console.log(`📥 同步 ${target.label} (${target.locale})...`);
    console.log(`   表格 ID: ${tableId}`);

    let records;
    try {
      records = await fetchAllRecords(token, baseToken, tableId);
    } catch (err) {
      console.error(`   ❌ 拉取失败: ${err.message}`);
      console.error("   跳过此语言，保留本地原文件。\n");
      continue;
    }

    if (records.length === 0) {
      console.warn(`   ⚠️  表格为空，跳过（本地文件不会被修改）。\n`);
      continue;
    }

    console.log(`   ✅ 获取 ${records.length} 条翻译记录`);

    const nested = buildNestedObject(records);
    const tsContent = serializeToTS(nested);

    const outPath = resolve(process.cwd(), target.outFile);

    if (isDryRun) {
      console.log(`   [dry-run] 将写入: ${outPath}`);
      console.log(`   [dry-run] 内容预览（前 400 字符）:\n`);
      console.log(tsContent.slice(0, 400) + "...\n");
    } else {
      // 备份原文件
      if (existsSync(outPath)) {
        const backup = outPath.replace(".ts", `.backup-${Date.now()}.ts`);
        writeFileSync(backup, readFileSync(outPath, "utf8"), "utf8");
        console.log(`   📦 已备份原文件: ${backup}`);
      }
      writeFileSync(outPath, tsContent, "utf8");
      console.log(`   💾 已写入: ${outPath}\n`);
    }

    successCount++;
  }

  if (successCount > 0) {
    console.log(
      `\n✅ 同步完成！共更新 ${successCount} 个语言文件。`
    );
    if (!isDryRun) {
      console.log("   建议运行 npx tsc --noEmit 验证编译是否通过。");
    }
  } else {
    console.log("\n⚠️  没有文件被更新。");
  }
}

main().catch((err) => {
  console.error(`\n💥 同步失败: ${err.message}`);
  process.exit(1);
});
