/**
 * sync-i18n.mjs
 *
 * 从飞书单张多语言翻译表（i18n_locale）中一次性拉取所有记录，
 * 分流解析为 zh / en / am 三语嵌套结构，并写入对应的本地 *.ts 文件。
 *
 * Usage:
 *   node scripts/sync-i18n.mjs
 *   node scripts/sync-i18n.mjs --dry-run
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
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

// ─── 飞书 API 封装 ────────────────────────────────────────────
const FEISHU_API = env.FEISHU_API_HOST || "https://open" + ".feishu.cn";

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
 * 分页拉取单张表的所有翻译数据，将每一行按语言分流
 */
async function fetchAllLocales(token, baseToken, tableId) {
  const baseUrl = `${FEISHU_API}/open-apis/bitable/v1/apps/${baseToken}/tables/${tableId}/records`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "content-type": "application/json; charset=utf-8",
  };

  const zhRecords = [];
  const enRecords = [];
  const amRecords = [];

  let pageToken = "";
  let hasMore = true;
  let count = 0;

  while (hasMore) {
    const url = pageToken
      ? `${baseUrl}?page_size=500&page_token=${encodeURIComponent(pageToken)}`
      : `${baseUrl}?page_size=500`;

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Feishu API error: ${res.status} ${res.statusText}`);
    const data = await res.json();
    if (data.code !== 0) throw new Error(`Feishu API error ${data.code}: ${data.msg}`);

    const items = data.data?.items || [];
    for (const item of items) {
      const key = extractText(item.fields?.key);
      if (!key) continue;

      const zhVal = extractText(item.fields?.zh);
      const enVal = extractText(item.fields?.en);
      const amVal = extractText(item.fields?.am);

      zhRecords.push({ key, value: zhVal });
      enRecords.push({ key, value: enVal });
      amRecords.push({ key, value: amVal });
      count++;
    }

    hasMore = data.data?.has_more ?? false;
    pageToken = data.data?.page_token ?? "";
  }

  console.log(`   ✅ 成功从飞书单表拉取并解析了 ${count} 条对照数据`);
  return { zhRecords, enRecords, amRecords };
}

function extractText(field) {
  if (field === undefined || field === null) return "";
  if (typeof field === "string") return field;
  if (typeof field === "number") return String(field);
  if (Array.isArray(field)) {
    return field
      .map((seg) => (typeof seg === "object" ? seg.text ?? "" : String(seg)))
      .join("");
  }
  return String(field);
}

// ─── 平铺 key-value → 嵌套对象 ───────────────────────────────
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

// ─── 序列化为 TS ───────────────────────────────────────────────
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
          const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
          return `${padInner}${safeKey}: ${serialize(v, depth + 1)}`;
        })
        .join(",\n");
      return `{\n${lines},\n${pad}}`;
    }

    if (typeof val === "string") {
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

/**
 * 按表名从飞书 Base 解析 table_id
 */
async function resolveTableIdByName(token, baseToken, tableName) {
  // 用多维表格 API（bitable/v1）列 Base 里的所有表，按 name 匹配
  // ⚠️ 不能用 base/v3/bases/{token}/tables —— 那个端点拒绝多表 Base，会返回 400
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
  console.log("🌐 Youguard i18n Sync V2 — 飞书单表 → 本地三语 TS\n");

  console.log("🔑 获取飞书 Access Token...");
  const token = await getToken();
  console.log("   ✅ 授权成功");

  const baseToken = requireEnv("FEISHU_BASE_APP_TOKEN");
  const tableName = "i18n_locale";
  console.log(`🔍 按名称 "${tableName}" 从飞书 Base 中查找表 ID...`);
  const tableId = await resolveTableIdByName(token, baseToken, tableName);
  console.log(`   ✅ 找到表: ${tableId}`);

  console.log(`📥 正在从表 ${tableId} 同步数据...`);
  const { zhRecords, enRecords, amRecords } = await fetchAllLocales(token, baseToken, tableId);

  const targets = [
    { locale: "zh", records: zhRecords, file: "i18n/translations/zh.ts", label: "中文" },
    { locale: "en", records: enRecords, file: "i18n/translations/en.ts", label: "English" },
    { locale: "am", records: amRecords, file: "i18n/translations/am.ts", label: "አማርኛ" },
  ];

  for (const { records, file, label } of targets) {
    if (records.length === 0) {
      console.warn(`   ⚠️  未获取到 ${label} 数据，跳过写入。`);
      continue;
    }

    const nested = buildNestedObject(records);
    const tsContent = serializeToTS(nested);
    const outPath = resolve(process.cwd(), file);

    if (isDryRun) {
      console.log(`   [dry-run] 将写入: ${outPath}`);
    } else {
      if (existsSync(outPath)) {
        const backup = outPath.replace(".ts", `.backup-${Date.now()}.ts`);
        writeFileSync(backup, readFileSync(outPath, "utf8"), "utf8");
      }
      writeFileSync(outPath, tsContent, "utf8");
      console.log(`   💾 已成功更新本地: ${file}`);
    }
  }



  console.log("\n🎉 同步更新完成！");
}

main().catch((err) => {
  console.error(`\n💥 同步失败: ${err.message}`);
  process.exit(1);
});
