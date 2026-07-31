/**
 * seed-i18n-to-feishu-v2.mjs
 *
 * 读取本地 zh.ts, en.ts, am.ts 翻译文件，
 * 横向对齐所有翻译 Key，打包成 [Key, ZH, EN, AM, Notes] 的结构，
 * 批量上传到飞书的 【I18n Locale】 表中。
 *
 * Usage:
 *   node scripts/seed-i18n-to-feishu-v2.mjs
 *   node scripts/seed-i18n-to-feishu-v2.mjs --dry-run
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

// ─── 参数解析 ─────────────────────────────────────────────────
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");

// ─── 加载 .dev.vars ────────────────────────────────────────────
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
  if (!val) throw new Error(`Missing env var: ${key}. Please set in .dev.vars`);
  return val;
}

// ─── lark-cli 封装 ────────────────────────────────────────────
const tempDir = ".lark-tmp";
mkdirSync(tempDir, { recursive: true });

function runLarkCli(args) {
  const command =
    process.platform === "win32"
      ? "powershell.exe"
      : process.env.LARK_CLI_BIN || "lark-cli";
  const commandArgs =
    process.platform === "win32"
      ? [
          "-NoProfile",
          "-ExecutionPolicy",
          "Bypass",
          "-File",
          process.env.LARK_CLI_BIN || join(process.env.APPDATA || "", "npm", "lark-cli.ps1"),
          ...args,
        ]
      : args;

  const output = execFileSync(command, commandArgs, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const start = output.indexOf("{");
  const end = output.lastIndexOf("}");
  if (start === -1 || end === -1)
    throw new Error(`lark-cli returned non-JSON output:\n${output}`);
  return JSON.parse(output.slice(start, end + 1));
}

function jsonFileArg(name, value) {
  const file = join(tempDir, `${name}-${Math.random().toString(36).slice(2)}.json`);
  writeFileSync(file, JSON.stringify(value), "utf8");
  return `@./${file.replaceAll("\\", "/")}`;
}

// ─── 平铺对象为 dot-notation key-value map ────────────────────
function flattenObject(obj, prefix = "", result = {}) {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      result[fullKey] = JSON.stringify(value);
    } else if (value !== null && typeof value === "object") {
      flattenObject(value, fullKey, result);
    } else {
      result[fullKey] = String(value ?? "");
    }
  }
  return result;
}

// ─── 剥离 TS 语法并解析为 JS 对象 ───────────────────────────────
function loadLocalTranslation(tsFilePath) {
  const fullPath = resolve(process.cwd(), tsFilePath);
  if (!existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }

  let content = readFileSync(fullPath, "utf8");
  content = content.replace(/^\s*export\s+default\s+/, "");
  content = content.replace(/;\s*$/, "");
  content = content.replace(/\s+as\s+[\w\[\]|<>,\s.]+/g, "");

  // eslint-disable-next-line no-new-func
  return new Function(`return (${content})`)();
}

// ─── 批量写入飞书 ──────────────────────────────────────────────
function batchCreateRecords(baseToken, tableId, rows) {
  const BATCH_SIZE = 200;
  let created = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    runLarkCli([
      "base", "+record-batch-create",
      "--as", "user",
      "--base-token", baseToken,
      "--table-id", tableId,
      "--json",
      jsonFileArg(`i18n-seed-${tableId}`, {
        fields: ["Key", "ZH", "EN", "AM", "Notes"],
        rows: batch.map((r) => [r.key, r.zh, r.en, r.am, ""]),
      }),
    ]);
    created += batch.length;
    process.stdout.write(`\r   已写入 ${created}/${rows.length} 条...`);
  }
  process.stdout.write("\n");
  return created;
}

/**
 * 按表名从飞书 Base 解析 table_id
 */
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

async function resolveTableIdByName(token, baseToken, tableName) {
  // ⚠️ 不能用 base/v3 —— 那个端点拒绝多表 Base，会返回 400
  const url = `${FEISHU_API}/open-apis/bitable/v1/apps/${baseToken}/tables?page_size=100`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json; charset=utf-8",
    },
  });
  if (!res.ok) throw new Error(`Feishu API error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  if (data.code !== 0) throw new Error(`Feishu API error ${data.code}: ${data.msg}`);
  const found = data.data?.items?.find((t) => t.name === tableName);
  if (!found) throw new Error(`飞书 Base 中未找到名为 "${tableName}" 的表`);
  return found.table_id;
}

// ─── 主流程 ───────────────────────────────────────────────────
async function main() {
  console.log("🌱 Youguard i18n Seed V2 — 本地三语合并 → 飞书单表\n");

  if (isDryRun) console.log("⚠️  DRY RUN 模式：不会实际写入飞书。\n");

  console.log("🔑 获取飞书 Access Token...");
  const token = await getToken();
  console.log("   ✅ 授权成功");

  const baseToken = requireEnv("FEISHU_BASE_APP_TOKEN");
  // 按表名动态解析，不再依赖 FEISHU_TABLE_I18N 环境变量
  const tableName = "I18n Locale";
  console.log(`🔍 按名称 "${tableName}" 从飞书 Base 中查找表 ID...`);
  const tableId = await resolveTableIdByName(token, baseToken, tableName);
  console.log(`   ✅ 找到表: ${tableId}`);

  console.log("📥 读取本地三语翻译文件...");
  const zhObj = loadLocalTranslation("i18n/translations/zh.ts");
  const enObj = loadLocalTranslation("i18n/translations/en.ts");
  const amObj = loadLocalTranslation("i18n/translations/am.ts");

  console.log("🔧 展平字典对象...");
  const zhMap = flattenObject(zhObj);
  const enMap = flattenObject(enObj);
  const amMap = flattenObject(amObj);

  // 获取所有不同的 Key 列表
  const allKeys = new Set([
    ...Object.keys(zhMap),
    ...Object.keys(enMap),
    ...Object.keys(amMap),
  ]);

  console.log(`📋 合并 Key 对齐，共 ${allKeys.size} 条翻译键值`);

  const rows = [];
  for (const key of allKeys) {
    rows.push({
      key,
      zh: zhMap[key] || "",
      en: enMap[key] || "",
      am: amMap[key] || "",
    });
  }

  if (isDryRun) {
    console.log("   [dry-run] 前 5 条合并对齐预览:");
    for (const r of rows.slice(0, 5)) {
      console.log(`     Key: ${r.key}`);
      console.log(`       ZH: "${r.zh.slice(0, 40)}"`);
      console.log(`       EN: "${r.en.slice(0, 40)}"`);
      console.log(`       AM: "${r.am.slice(0, 40)}"`);
    }
    console.log();
    return;
  }

  console.log(`📤 正在向飞书表 ${tableId} 写入记录...`);
  try {
    const count = batchCreateRecords(baseToken, tableId, rows);
    console.log(`\n🎉 成功向飞书单表导入 ${count} 条记录！`);
  } catch (err) {
    console.error(`❌ 写入飞书失败: ${err.message}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`💥 导入失败: ${err.message}`);
  process.exit(1);
});
