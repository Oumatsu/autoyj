const fs = require("fs");
const path = require("path");

const root = process.cwd();
const envText = fs.readFileSync(path.join(root, ".dev.vars"), "utf8");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

const apiBase = "https://open.feishu.cn/open-apis";
const appToken = "Is6Xb3btbazhFhsDXgFcqFG1nRc";
const targets = [
  { name: "models", tableId: "tblxVNjP9dnJ7b3o", viewId: "vewppBx2ht" },
  { name: "variants", tableId: "tbl8YzkZkMxvHRoT", viewId: "vew1Se8rpJ" },
];

let tokenCache = null;

async function tenantToken() {
  if (tokenCache) return tokenCache;
  const res = await fetch(`${apiBase}/auth/v3/tenant_access_token/internal`, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      app_id: env.FEISHU_APP_ID,
      app_secret: env.FEISHU_APP_SECRET,
    }),
  });
  const data = await res.json();
  if (!res.ok || data.code) throw new Error(`tenant token failed: ${JSON.stringify(data)}`);
  tokenCache = data.tenant_access_token;
  return tokenCache;
}

async function feishu(pathname, options = {}) {
  const res = await fetch(`${apiBase}${pathname}`, {
    ...options,
    headers: {
      "content-type": "application/json; charset=utf-8",
      authorization: `Bearer ${await tenantToken()}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok || data.code) {
    throw new Error(`${options.method || "GET"} ${pathname} failed: ${JSON.stringify(data)}`);
  }
  return data.data || data;
}

async function listFields(tableId) {
  const fields = [];
  let pageToken = "";
  for (;;) {
    const query = new URLSearchParams({ page_size: "100" });
    if (pageToken) query.set("page_token", pageToken);
    const data = await feishu(`/bitable/v1/apps/${appToken}/tables/${tableId}/fields?${query}`);
    fields.push(...(data.items || []));
    if (!data.has_more || !data.page_token) break;
    pageToken = data.page_token;
  }
  return fields;
}

async function listRecords(tableId, viewId) {
  const records = [];
  let pageToken = "";
  for (;;) {
    const query = new URLSearchParams({ page_size: "500", view_id: viewId });
    if (pageToken) query.set("page_token", pageToken);
    const data = await feishu(`/bitable/v1/apps/${appToken}/tables/${tableId}/records?${query}`);
    records.push(...(data.items || []));
    if (!data.has_more || !data.page_token) break;
    pageToken = data.page_token;
  }
  return records;
}

function present(value) {
  return !(
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "string" && value.trim() === "")
  );
}

(async () => {
  const outDir = path.join(root, "tmp", "feishu-model-fill");
  fs.mkdirSync(outDir, { recursive: true });
  const summary = {};
  for (const target of targets) {
    const fields = await listFields(target.tableId);
    const records = await listRecords(target.tableId, target.viewId);
    fs.writeFileSync(path.join(outDir, `${target.name}-fields.json`), JSON.stringify(fields, null, 2));
    fs.writeFileSync(path.join(outDir, `${target.name}-records.json`), JSON.stringify(records, null, 2));
    const fieldNames = fields.map((field) => field.field_name || field.name);
    const missing = fieldNames
      .map((field) => ({ field, missing: records.filter((record) => !present(record.fields[field])).length }))
      .sort((a, b) => b.missing - a.missing);
    fs.writeFileSync(path.join(outDir, `${target.name}-missing.json`), JSON.stringify(missing, null, 2));
    summary[target.name] = { records: records.length, fields: fields.length, missing: missing.slice(0, 20) };
  }
  console.log(JSON.stringify(summary, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
