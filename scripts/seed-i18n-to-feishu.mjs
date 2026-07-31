/**
 * seed-i18n-to-feishu.mjs
 *
 * 将本地现有的 i18n/translations/*.ts 翻译文件，
 * 序列化并以 flat key-value 格式批量写入到飞书对应的翻译表中。
 *
 * 这是一次性的"初始化导入"操作，通常只在首次设置飞书翻译表时运行。
 * 之后的日常工作流是：直接在飞书表格中修改 Value → 运行 npm run sync:i18n。
 *
 * Usage:
 *   node scripts/seed-i18n-to-feishu.mjs             # 导入所有三个语言
 *   node scripts/seed-i18n-to-feishu.mjs --locale zh # 只导入中文
 *   node scripts/seed-i18n-to-feishu.mjs --dry-run   # 只打印不实际写入
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

// ─── 参数解析 ─────────────────────────────────────────────────
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const onlyLocale = args.includes("--locale")
  ? args[args.indexOf("--locale") + 1]
  : null;

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

// ─── 将嵌套对象展平为 dot-notation key-value 数组 ──────────────
function flattenObject(obj, prefix = "", result = []) {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      // 数组字段使用 JSON 字符串存储
      result.push({ key: fullKey, value: JSON.stringify(value) });
    } else if (value !== null && typeof value === "object") {
      flattenObject(value, fullKey, result);
    } else {
      result.push({ key: fullKey, value: String(value ?? "") });
    }
  }
  return result;
}

// ─── 加载本地 TS 翻译文件（剥离 TS 语法后 eval） ─────────────────
async function loadLocalTranslation(tsFilePath) {
  const fullPath = resolve(process.cwd(), tsFilePath);
  if (!existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }

  let content = readFileSync(fullPath, "utf8");

  // 1. 去掉 "export default" 前缀
  content = content.replace(/^\s*export\s+default\s+/, "");
  // 2. 去掉末尾分号
  content = content.replace(/;\s*$/, "");
  // 3. 剥离 TypeScript 类型断言：" as SomeType" / " as any[]" / " as any" 等
  //    必须在 eval 之前去掉，否则 JS 引擎不认识 "as"
  content = content.replace(/\s+as\s+[\w\[\]|<>,\s.]+/g, "");

  // 使用 Function 构造器安全求值（仅含数据字面量）
  // eslint-disable-next-line no-new-func
  return new Function(`return (${content})`)();
}

// ─── 批量写入记录到飞书（分批，每批 500 条）──────────────────────
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
        fields: ["Key", "Value", "Notes"],
        rows: batch.map((r) => [r.key, r.value, ""]),
      }),
    ]);
    created += batch.length;
    process.stdout.write(`\r   已写入 ${created}/${rows.length} 条...`);
  }
  process.stdout.write("\n");
  return created;
}

// ─── 主流程 ───────────────────────────────────────────────────
const LOCALES = [
  {
    locale: "zh",
    envKey: "FEISHU_TABLE_I18N_ZH",
    tsFile: "i18n/translations/zh.ts",
    label: "中文",
  },
  {
    locale: "en",
    envKey: "FEISHU_TABLE_I18N_EN",
    tsFile: "i18n/translations/en.ts",
    label: "English",
  },
  {
    locale: "am",
    envKey: "FEISHU_TABLE_I18N_AM",
    tsFile: "i18n/translations/am.ts",
    label: "አማርኛ",
  },
];

async function main() {
  console.log("🌱 Youguard i18n Seed — 本地 TS → 飞书\n");

  if (isDryRun) console.log("⚠️  DRY RUN 模式：不会向飞书写入任何数据。\n");

  const baseToken = requireEnv("FEISHU_BASE_APP_TOKEN");

  const targets = onlyLocale
    ? LOCALES.filter((l) => l.locale === onlyLocale)
    : LOCALES;

  for (const { locale, envKey, tsFile, label } of targets) {
    const tableId = env[envKey];
    if (!tableId) {
      console.warn(`⚠️  ${envKey} 未配置，跳过 ${label}。`);
      console.warn(`   请先运行 npm run setup:i18n 创建飞书翻译表。\n`);
      continue;
    }

    console.log(`📤 导入 ${label} (${locale})...`);
    console.log(`   源文件: ${tsFile}`);
    console.log(`   飞书表: ${tableId}`);

    let translation;
    try {
      translation = await loadLocalTranslation(tsFile);
    } catch (err) {
      console.error(`   ❌ 读取本地文件失败: ${err.message}\n`);
      continue;
    }

    const rows = flattenObject(translation);
    console.log(`   共 ${rows.length} 条翻译键值对`);

    if (isDryRun) {
      console.log(`   [dry-run] 前 5 条预览:`);
      for (const r of rows.slice(0, 5)) {
        console.log(`     ${r.key} = "${r.value.slice(0, 60)}${r.value.length > 60 ? "..." : ""}"`);
      }
      console.log();
      continue;
    }

    try {
      const count = batchCreateRecords(baseToken, tableId, rows);
      console.log(`   ✅ 成功写入 ${count} 条记录\n`);
    } catch (err) {
      console.error(`   ❌ 写入飞书失败: ${err.message}\n`);
    }
  }

  console.log("🎉 Seed 完成！");
  console.log("   之后请直接在飞书表格中编辑 Value 列来修改翻译。");
  console.log("   修改后运行 npm run sync:i18n 将飞书翻译同步到本地代码。");
}

main().catch((err) => {
  console.error(`\n💥 Seed 失败: ${err.message}`);
  process.exit(1);
});
