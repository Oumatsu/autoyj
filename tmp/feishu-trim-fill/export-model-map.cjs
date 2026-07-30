const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "..");
const envText = fs.readFileSync(path.join(root, ".dev.vars"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#") && line.includes("="))
  .map((line) => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1)]));

const apiBase = "https://open.feishu.cn/open-apis";
const appToken = "Is6Xb3btbazhFhsDXgFcqFG1nRc";
const tableId = "tblxVNjP9dnJ7b3o";

let token;
async function tenantToken() {
  if (token) return token;
  const res = await fetch(`${apiBase}/auth/v3/tenant_access_token/internal`, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ app_id: env.FEISHU_APP_ID, app_secret: env.FEISHU_APP_SECRET }),
  });
  const data = await res.json();
  if (!res.ok || data.code) throw new Error(JSON.stringify(data));
  token = data.tenant_access_token;
  return token;
}

async function feishu(pathname) {
  const res = await fetch(`${apiBase}${pathname}`, { headers: { authorization: `Bearer ${await tenantToken()}` } });
  const data = await res.json();
  if (!res.ok || data.code) throw new Error(JSON.stringify(data));
  return data.data;
}

(async () => {
  const records = [];
  let pageToken = "";
  for (;;) {
    const query = new URLSearchParams({ page_size: "500", view_id: "vewppBx2ht" });
    if (pageToken) query.set("page_token", pageToken);
    const data = await feishu(`/bitable/v1/apps/${appToken}/tables/${tableId}/records?${query}`);
    records.push(...(data.items || []));
    if (!data.has_more || !data.page_token) break;
    pageToken = data.page_token;
  }
  const map = Object.fromEntries(records.map((record) => [record.fields.model_id, {
    record_id: record.record_id,
    model_id: record.fields.model_id,
    brand: record.fields.brand,
    model: record.fields.model,
    MODEL: record.fields.MODEL,
    product_path: record.fields.product_path,
    powertrain_type: record.fields.powertrain_type,
    status: record.fields.status,
  }]).filter(([id]) => id));
  fs.writeFileSync(path.join(__dirname, "model-map.json"), JSON.stringify(map, null, 2));
  console.log(JSON.stringify({ models: Object.keys(map).length }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
