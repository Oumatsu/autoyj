/**
 * setup-i18n-tables.mjs
 *
 * 在已有的飞书多维表格（Base）中，自动创建三张多语言翻译子表：
 *   - ZH Locale（中文翻译）
 *   - EN Locale（英文翻译）
 *   - AM Locale（阿姆哈拉语翻译）
 *
 * 每张表只有三个字段：Key（主键）、Value（翻译文本）、Notes（运营备注）
 *
 * 创建完成后，会将三张表的 table_id 打印出来，
 * 请将它们手动复制到 .dev.vars 中：
 *   FEISHU_TABLE_I18N_ZH=tblXXXXXXXX
 *   FEISHU_TABLE_I18N_EN=tblXXXXXXXX
 *   FEISHU_TABLE_I18N_AM=tblXXXXXXXX
 *
 * 首次运行后，配合 npm run sync:i18n-seed 可以将现有本地翻译文件
 * 作为初始数据批量写入飞书。
 *
 * Usage:
 *   node scripts/setup-i18n-tables.mjs
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

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

function run(args) {
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

// ─── 主流程 ───────────────────────────────────────────────────
const baseToken = requireEnv("FEISHU_BASE_APP_TOKEN");

// 三张翻译表的定义
const I18N_TABLES = [
  { name: "ZH Locale", envKey: "FEISHU_TABLE_I18N_ZH", label: "中文翻译" },
  { name: "EN Locale", envKey: "FEISHU_TABLE_I18N_EN", label: "英文翻译" },
  { name: "AM Locale", envKey: "FEISHU_TABLE_I18N_AM", label: "阿姆语翻译" },
];

// 每张表统一使用这三个字段，极简可读
const I18N_FIELDS = [
  { name: "Key",   type: "text" },
  { name: "Value", type: "text" },
  { name: "Notes", type: "text" },
];

// 先列出现有的所有表，避免重复创建
console.log("📋 读取飞书多维表格现有子表列表...");
let tableListData;
try {
  tableListData = run([
    "base", "+table-list",
    "--as", "user",
    "--base-token", baseToken,
    "--limit", "100",
  ]);
} catch (err) {
  console.error(`❌ 无法列取表格列表: ${err.message}`);
  console.error("   请确认 lark-cli 已正确登录，且 FEISHU_BASE_APP_TOKEN 正确。");
  process.exit(1);
}

const existingTables = tableListData.items || tableListData.tables || tableListData.data?.items || [];
const existingMap = {};
for (const t of existingTables) {
  const id = t.table_id || t.id;
  const name = t.name || t.table_name;
  if (id && name) existingMap[name] = id;
}
console.log(`   已找到 ${Object.keys(existingMap).length} 张现有子表。\n`);

// 逐一检查并创建翻译表（只创建，不在此阶段读 ID）
const created = new Set();
for (const { name, envKey, label } of I18N_TABLES) {
  if (existingMap[name]) {
    console.log(`✅ "${name}" (${label}) 已存在，跳过创建。`);
    created.add(name);
  } else {
    console.log(`🆕 创建 "${name}" (${label})...`);
    try {
      run([
        "base", "+table-create",
        "--as", "user",
        "--base-token", baseToken,
        "--name", name,
        "--fields", jsonFileArg(name, I18N_FIELDS),
      ]);
      console.log(`   ✅ 创建成功`);
      created.add(name);
    } catch (err) {
      console.error(`   ❌ 创建失败: ${err.message}`);
    }
  }
}

// 所有表创建完毕后，统一拉取一次表列表获取所有 ID
console.log("\n📋 统一获取所有翻译表 ID...");
const finalList = run([
  "base", "+table-list",
  "--as", "user",
  "--base-token", baseToken,
  "--limit", "100",
]);
const finalTables = finalList.items || finalList.tables || finalList.data?.items || [];
const finalMap = {};
for (const t of finalTables) {
  const id = t.table_id || t.id;
  const name = t.name || t.table_name;
  if (id && name) finalMap[name] = id;
}

const results = {};
for (const { name, envKey } of I18N_TABLES) {
  if (finalMap[name]) {
    results[envKey] = finalMap[name];
    console.log(`   ${name}: ${finalMap[name]}`);
  } else {
    console.error(`   ❌ 未找到表: ${name}`);
  }
}

// 打印最终结果和需要添加的环境变量
console.log("\n─────────────────────────────────────────");
console.log("🎉 三张多语言翻译表已就绪！");
console.log("\n请将以下变量添加到 .dev.vars 文件中：\n");
for (const { envKey } of I18N_TABLES) {
  console.log(`${envKey}=${results[envKey] || "（创建失败，请检查错误）"}`);
}
console.log("\n配置完成后，运行以下命令将现有本地翻译导入飞书：");
console.log("  npm run sync:i18n-seed\n");
console.log("配置完成后，运行以下命令将飞书翻译同步到本地代码：");
console.log("  npm run sync:i18n\n");
