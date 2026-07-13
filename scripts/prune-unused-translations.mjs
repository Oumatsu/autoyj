/**
 * prune-unused-translations.mjs
 *
 * 1. 从飞书 I18n Locale 表中拉取所有记录
 * 2. 找到 Key 为 "meta.title"、"meta.description"、"locale.switch" 的记录
 * 3. 调用飞书批量删除接口将其物理删除
 * 4. 触发本地 sync-i18n.mjs，重新生成干净的本地 TS 语言字典
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";

const TARGET_KEYS = ["meta.title", "meta.description", "locale.switch"];

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

function extractText(fieldVal) {
  if (!fieldVal) return "";
  if (typeof fieldVal === "string") return fieldVal;
  if (Array.isArray(fieldVal)) {
    return fieldVal.map((item) => item.text || "").join("");
  }
  if (typeof fieldVal === "object" && fieldVal.text) {
    return fieldVal.text;
  }
  return String(fieldVal);
}

/**
 * 按表名从飞书 Base 解析 table_id
 */
async function fetchTokenAndResolveTable(token, baseToken, tableName) {
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

async function run() {
  try {
    console.log("🔑 获取飞书 Access Token...");
    const token = await getToken();
    const baseToken = requireEnv("FEISHU_BASE_APP_TOKEN");
    const tableName = "I18n Locale";
    console.log(`🔍 按名称 "${tableName}" 从飞书 Base 中查找表 ID...`);
    const tableId = await fetchTokenAndResolveTable(token, baseToken, tableName);
    console.log(`   ✅ 找到表: ${tableId}`);

    console.log(`📥 从飞书表 ${tableId} 中拉取全部记录以查找要清理的 Key...`);
    const baseUrl = `${FEISHU_API}/open-apis/bitable/v1/apps/${baseToken}/tables/${tableId}/records`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json; charset=utf-8",
    };

    let pageToken = "";
    let hasMore = true;
    const recordsToDelete = [];

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
        const key = extractText(item.fields?.Key);
        if (TARGET_KEYS.includes(key)) {
          recordsToDelete.push({ id: item.record_id, key });
        }
      }

      pageToken = data.data?.page_token || "";
      hasMore = data.data?.has_more || false;
    }

    if (recordsToDelete.length === 0) {
      console.log("✨ 飞书中没有发现这 3 个要清理的 Key，或者它们已经被清理了。");
    } else {
      console.log(`🗑️ 发现要清理的记录：\n${recordsToDelete.map(r => `   - Key: ${r.key} (Record ID: ${r.id})`).join("\n")}`);
      console.log("📤 正在从飞书批量物理删除记录...");

      const deleteUrl = `${FEISHU_API}/open-apis/bitable/v1/apps/${baseToken}/tables/${tableId}/records/batch_delete`;
      const deleteRes = await fetch(deleteUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          records: recordsToDelete.map(r => r.id)
        })
      });

      const deleteData = await deleteRes.json();
      if (deleteData.code !== 0) {
        console.error("Full Feishu Error Response:", deleteData);
        throw new Error(`Feishu batch delete failed: ${deleteData.msg || JSON.stringify(deleteData)}`);
      }
      console.log("✅ 飞书端冗余字段删除成功！");
    }

    console.log("🔄 开始同步到本地代码...");
    execSync("node scripts/sync-i18n.mjs", { stdio: "inherit" });
    console.log("🎉 清理与同步全部完成！");

  } catch (err) {
    console.error("❌ 清理失败:", err.message);
  }
}

run();
