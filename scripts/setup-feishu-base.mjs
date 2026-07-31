import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const baseName = process.argv.includes("--name")
  ? process.argv[process.argv.indexOf("--name") + 1]
  : "Youguard EV Export Portal";
const existingBaseToken = process.argv.includes("--base-token")
  ? process.argv[process.argv.indexOf("--base-token") + 1]
  : "";

const now = new Date().toISOString();
const tempDir = ".lark-tmp";
mkdirSync(tempDir, { recursive: true });

const schemas = {
  "Internal Users": [
    { name: "User ID", type: "text" },
    { name: "Name", type: "text" },
    { name: "Email", type: "text" },
    { name: "Access Code", type: "text" },
    { name: "Role", type: "select", multiple: false, options: [{ name: "admin" }, { name: "sales" }, { name: "sourcing" }, { name: "finance" }] },
    { name: "Status", type: "select", multiple: false, options: [{ name: "Active" }, { name: "Disabled" }] },
    { name: "Department", type: "text" },
    { name: "Can Edit Vehicles", type: "checkbox" },
    { name: "Can See Cost", type: "checkbox" },
    { name: "Can See Supplier", type: "checkbox" },
    { name: "Sourcing Commission Rate", type: "number" },
    { name: "Sales Commission Rate", type: "number" },
  ],
  "External Accounts": [
    { name: "Account ID", type: "text" },
    { name: "Company", type: "text" },
    { name: "Contact", type: "text" },
    { name: "Email", type: "text" },
    { name: "Access Code", type: "text" },
    { name: "Role", type: "select", multiple: false, options: [{ name: "partner" }, { name: "customer" }] },
    { name: "Price Tier", type: "select", multiple: false, options: [{ name: "hidden" }, { name: "partner" }, { name: "vip" }] },
    { name: "Status", type: "select", multiple: false, options: [{ name: "Active" }, { name: "Disabled" }] },
    { name: "Country", type: "text" },
    { name: "Owner", type: "text" },
  ],
  "Vehicle Models": [
    { name: "Model ID", type: "text" },
    { name: "Brand", type: "text" },
    { name: "Model", type: "text" },
    { name: "Year", type: "text" },
    { name: "Version", type: "text" },
    { name: "China Guide Price CNY", type: "text" },
    { name: "Review Notes", type: "text" },
    { name: "Image URL", type: "text" },
    { name: "Brochure URL", type: "text" },
    { name: "Source URL", type: "text", style: { type: "url" } },
    { name: "Source Name", type: "text" },
    { name: "Last Synced At", type: "datetime", style: { format: "yyyy-MM-dd HH:mm" } },
    { name: "Status", type: "select", multiple: false, options: [{ name: "Active" }, { name: "Draft" }, { name: "Needs Review" }, { name: "Archived" }] },
  ],
  "Vehicle Model Specs": [
    { name: "Model ID", type: "text" },
    { name: "Brand", type: "text" },
    { name: "Model", type: "text" },
    { name: "Year", type: "text" },
    { name: "Version", type: "text" },
    {
      name: "Category",
      type: "select",
      multiple: false,
      options: [
        { name: "基本参数" },
        { name: "车身" },
        { name: "电动机" },
        { name: "电池/充电" },
        { name: "变速箱" },
        { name: "底盘转向" },
        { name: "车轮制动" },
        { name: "主动安全" },
        { name: "被动安全" },
        { name: "辅助驾驶" },
        { name: "外部配置" },
        { name: "内部配置" },
        { name: "座椅配置" },
        { name: "多媒体/智能座舱" },
        { name: "灯光" },
        { name: "玻璃/后视镜" },
        { name: "空调/舒适" },
        { name: "智能硬件" },
        { name: "出口适配" },
        { name: "其他" },
      ],
    },
    { name: "Spec Name", type: "text" },
    { name: "Spec Value", type: "text" },
    { name: "Unit", type: "text" },
    { name: "Normalized Value", type: "text" },
    { name: "Visible Level", type: "select", multiple: false, options: [{ name: "Core" }, { name: "Standard" }, { name: "Full" }, { name: "Internal" }] },
    { name: "Sort Order", type: "number" },
    { name: "Source Name", type: "text" },
    { name: "Source URL", type: "text", style: { type: "url" } },
    { name: "Confidence", type: "select", multiple: false, options: [{ name: "High" }, { name: "Medium" }, { name: "Needs Review" }] },
    { name: "Last Synced At", type: "datetime", style: { format: "yyyy-MM-dd HH:mm" } },
    { name: "Notes", type: "text" },
  ],
  Vehicles: [
    { name: "Vehicle ID", type: "text" },
    { name: "Model ID", type: "text" },
    { name: "Brand", type: "text" },
    { name: "Model", type: "text" },
    { name: "Trim", type: "text" },
    { name: "Year", type: "text" },
    { name: "Color", type: "text" },
    { name: "Exterior Color", type: "text" },
    { name: "Interior Color", type: "text" },
    { name: "Supplier Exterior Color", type: "text" },
    { name: "Supplier Interior Color", type: "text" },
    { name: "Color Code", type: "text" },
    { name: "Color Notes", type: "text" },
    { name: "Color Confirmed", type: "checkbox" },
    { name: "Configuration", type: "text" },
    { name: "Supplier", type: "text" },
    { name: "Recorder", type: "text" },
    { name: "Location", type: "text" },
    { name: "Status", type: "select", multiple: false, options: [{ name: "In Stock" }, { name: "Preorder" }, { name: "Unavailable" }] },
    { name: "Stock Quantity", type: "number" },
    { name: "Lead Time", type: "text" },
    { name: "Partner Price", type: "number" },
    { name: "Customer Price", type: "number" },
    { name: "Cost", type: "number" },
    { name: "Price Valid Until", type: "text" },
    { name: "Public Notes", type: "text" },
    { name: "Image URL", type: "url" },
    { name: "Export Status", type: "select", multiple: false, options: [{ name: "Exportable Now" }, { name: "Later in 2026" }, { name: "Check Permit" }] },
    { name: "Is Listed", type: "checkbox" },
  ],
  Inquiries: [
    { name: "Inquiry No", type: "text" },
    { name: "Customer ID", type: "text" },
    { name: "Vehicle ID", type: "text" },
    { name: "Vehicle Model", type: "text" },
    { name: "Quantity", type: "number" },
    { name: "Destination Port", type: "text" },
    { name: "Trade Term", type: "select", multiple: false, options: [{ name: "FOB" }, { name: "CIF" }, { name: "CFR" }, { name: "EXW" }] },
    { name: "Target Price", type: "number" },
    { name: "Notes", type: "text" },
    { name: "Status", type: "select", multiple: false, options: [{ name: "New Inquiry" }, { name: "Quoted" }, { name: "Negotiating" }, { name: "Accepted" }, { name: "Closed" }] },
    { name: "Source", type: "select", multiple: false, options: [{ name: "Customer Portal" }, { name: "Feishu" }, { name: "WhatsApp" }, { name: "Email" }] },
    { name: "Created At", type: "text" },
    { name: "Updated At", type: "text" },
  ],
  Quotes: [
    { name: "Quote No", type: "text" },
    { name: "Inquiry No", type: "text" },
    { name: "Version", type: "number" },
    { name: "Vehicle ID", type: "text" },
    { name: "Quantity", type: "number" },
    { name: "Unit Price", type: "number" },
    { name: "Currency", type: "select", multiple: false, options: [{ name: "USD" }, { name: "CNY" }] },
    { name: "Trade Term", type: "select", multiple: false, options: [{ name: "FOB" }, { name: "CIF" }, { name: "CFR" }, { name: "EXW" }] },
    { name: "Payment Terms", type: "select", multiple: false, options: [{ name: "LC" }, { name: "CAD" }, { name: "TT advance" }, { name: "franco valuta" }] },
    { name: "Valid Until", type: "text" },
    { name: "Status", type: "select", multiple: false, options: [{ name: "Sent" }, { name: "Counteroffer Received" }, { name: "Accepted" }, { name: "Expired" }, { name: "Replaced" }] },
    { name: "Change Reason", type: "text" },
    { name: "Created At", type: "text" },
  ],
  Negotiations: [
    { name: "Log No", type: "text" },
    { name: "Inquiry No", type: "text" },
    { name: "Quote No", type: "text" },
    { name: "Actor", type: "select", multiple: false, options: [{ name: "Customer" }, { name: "Youguard" }, { name: "System" }] },
    { name: "Action", type: "select", multiple: false, options: [{ name: "Inquiry Created" }, { name: "Quote Sent" }, { name: "Counteroffer" }, { name: "Quote Accepted" }, { name: "Order Created" }] },
    { name: "Offered Price", type: "number" },
    { name: "Quantity", type: "number" },
    { name: "Message", type: "text" },
    { name: "Created At", type: "text" },
  ],
  Orders: [
    { name: "Order No", type: "text" },
    { name: "Inquiry No", type: "text" },
    { name: "Quote No", type: "text" },
    { name: "Customer ID", type: "text" },
    { name: "Vehicle ID", type: "text" },
    { name: "Quantity", type: "number" },
    { name: "Final Unit Price", type: "number" },
    { name: "Total", type: "number" },
    { name: "Currency", type: "select", multiple: false, options: [{ name: "USD" }, { name: "CNY" }] },
    { name: "Payment Terms", type: "select", multiple: false, options: [{ name: "LC" }, { name: "CAD" }, { name: "TT advance" }, { name: "franco valuta" }] },
    { name: "Status", type: "select", multiple: false, options: [{ name: "Draft Order" }, { name: "Confirmed" }, { name: "Deposit Pending" }, { name: "Shipping" }, { name: "Completed" }, { name: "Closed" }] },
    { name: "Created At", type: "text" },
  ],
};

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
  if (start === -1 || end === -1) {
    throw new Error(`lark-cli returned non-JSON output:\n${output}`);
  }
  return JSON.parse(output.slice(start, end + 1));
}

function jsonFileArg(name, value) {
  const file = join(tempDir, `${name}-${Math.random().toString(36).slice(2)}.json`);
  writeFileSync(file, JSON.stringify(value), "utf8");
  return `@./${file.replaceAll("\\", "/")}`;
}

function findString(value, predicate) {
  if (typeof value === "string" && predicate(value)) return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findString(item, predicate);
      if (found) return found;
    }
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      const found = findString(item, predicate);
      if (found) return found;
    }
  }
  return "";
}

function getBaseToken(value) {
  return (
    value.base_token ||
    value.created_base_token ||
    value.app_token ||
    value.data?.base?.base_token ||
    findString(value, (item) => /^base[a-zA-Z0-9_]+/.test(item))
  );
}

function tableList(baseToken) {
  const data = run(["base", "+table-list", "--as", "user", "--base-token", baseToken, "--limit", "100"]);
  const tables = data.items || data.tables || data.data?.items || data.data?.tables || [];
  const result = {};
  for (const table of tables) {
    const id = table.table_id || table.id;
    const name = table.name || table.table_name;
    if (id && name) result[name] = id;
  }
  return result;
}

function createTable(baseToken, name, fields) {
  run([
    "base",
    "+table-create",
    "--as",
    "user",
    "--base-token",
    baseToken,
    "--name",
    name,
    "--fields",
    jsonFileArg(`${name}-fields`, fields),
  ]);
}

function createRows(baseToken, tableId, fields, rows) {
  run([
    "base",
    "+record-batch-create",
    "--as",
    "user",
    "--base-token",
    baseToken,
    "--table-id",
    tableId,
    "--json",
    jsonFileArg(`${tableId}-rows`, { fields, rows }),
  ]);
}

let baseToken = existingBaseToken;
if (!baseToken) {
  console.log(`Creating Feishu Base: ${baseName}`);
  const baseResult = run([
    "base",
    "+base-create",
    "--as",
    "user",
    "--name",
    baseName,
    "--table-name",
    "Internal Users",
    "--fields",
    jsonFileArg("Internal-Users-fields", schemas["Internal Users"]),
  ]);
  baseToken = getBaseToken(baseResult);
  if (!baseToken) throw new Error(`Could not find base token in lark-cli output:\n${JSON.stringify(baseResult, null, 2)}`);
} else {
  console.log(`Using existing Feishu Base: ${baseToken}`);
}

let tables = tableList(baseToken);
for (const [name, fields] of Object.entries(schemas)) {
  if (name === "Internal Users") continue;
  if (!tables[name]) createTable(baseToken, name, fields);
}
tables = tableList(baseToken);

createRows(
  baseToken,
  tables["Internal Users"],
  ["User ID", "Name", "Email", "Access Code", "Role", "Status", "Department", "Can Edit Vehicles", "Can See Cost", "Can See Supplier", "Sourcing Commission Rate", "Sales Commission Rate"],
  [
    ["USR-ADMIN", "Admin User", "admin@local.test", "admin-demo-2026", "admin", "Active", "Management", true, true, true, 0, 0],
    ["USR-SALES", "Sales User", "sales@local.test", "sales-demo-2026", "sales", "Active", "Sales", true, true, true, 0, 0.03],
    ["USR-SOURCING", "Sourcing User", "sourcing@local.test", "sourcing-demo-2026", "sourcing", "Active", "Sourcing", true, true, true, 0.02, 0],
  ],
);

createRows(
  baseToken,
  tables["External Accounts"],
  ["Account ID", "Company", "Contact", "Email", "Access Code", "Role", "Price Tier", "Status", "Country", "Owner"],
  [
    ["CUS-001", "Addis Fleet Trading", "Demo Partner", "partner@example.com", "partner-demo-2026", "partner", "partner", "Active", "Ethiopia", "Sales"],
    ["CUS-002", "Green Ride Addis", "Demo Customer", "customer@example.com", "customer-demo-2026", "customer", "hidden", "Active", "Ethiopia", "Sales"],
  ],
);

createRows(
  baseToken,
  tables["Vehicle Models"],
  ["Model ID", "Brand", "Model", "Year", "Version", "China Guide Price CNY", "Review Notes", "Image URL", "Brochure URL", "Status"],
  [
    ["MDL-001", "BYD", "Yuan Plus", "2026", "430KM Premium", "", "Confirm destination compliance before PI.", "/pic/revenue-king/Yplus/0.webp", "", "Active"],
    ["MDL-002", "BYD", "Seagull", "2026", "405KM", "", "Permit timing should be confirmed by shipment window.", "/pic/revenue-king/seagull/0.webp", "", "Active"],
    ["MDL-003", "Geely", "Galaxy E5", "2026", "530KM", "", "Specs should match local homologation.", "/pic/revenue-king/Galaxye5/1.webp", "", "Active"],
  ],
);

createRows(
  baseToken,
  tables.Vehicles,
  ["Vehicle ID", "Model ID", "Brand", "Model", "Trim", "Year", "Color", "Exterior Color", "Interior Color", "Supplier Exterior Color", "Supplier Interior Color", "Color Code", "Color Notes", "Color Confirmed", "Configuration", "Supplier", "Recorder", "Location", "Status", "Stock Quantity", "Lead Time", "Partner Price", "Customer Price", "Cost", "Price Valid Until", "Public Notes", "Image URL", "Export Status", "Is Listed"],
  [
    ["EV-001", "MDL-001", "BYD", "Yuan Plus", "430KM Premium", "2026", "White", "White", "Black", "珍珠白", "黑内", "", "以实拍图为准", true, "Standard export configuration", "Primary Shanghai supplier", "Sales Admin", "Shanghai Port", "In Stock", 12, "Ready stock", 18500, 19800, 17100, "2026-07-31", "White ready stock for East Africa batch orders.", "/pic/revenue-king/Yplus/0.webp", "Exportable Now", true],
    ["EV-002", "MDL-002", "BYD", "Seagull", "405KM", "2026", "Color optional", "Optional", "Optional", "颜色待确认", "内饰待确认", "", "订车颜色按下单窗口确认", false, "Color and trim to confirm before order", "Ningbo preorder supplier", "Sales Admin", "Ningbo Port", "Preorder", 0, "30-45 days after deposit", 11200, 12100, 10300, "2026-07-15", "High ROI city EV; permit timing should be confirmed.", "/pic/revenue-king/seagull/0.webp", "Check Permit", true],
    ["EV-003", "MDL-003", "Geely", "Galaxy E5", "530KM", "2026", "Silver", "Silver", "Black", "银色", "黑内", "", "供应商颜色名称待标准化", true, "Standard export configuration", "Primary Shanghai supplier", "Sales Admin", "Shanghai Port", "In Stock", 6, "Ready stock", 16900, 18100, 15700, "2026-07-31", "Silver ready stock for dealer batch orders.", "/pic/revenue-king/Galaxye5/1.webp", "Exportable Now", true],
  ],
);

const envPath = resolve(process.cwd(), ".dev.vars.feishu.example");
const envText = [
  "# Copy these values into .dev.vars for local development and into Cloudflare secrets/vars for deployment.",
  "FEISHU_APP_ID=",
  "FEISHU_APP_SECRET=",
  `FEISHU_BASE_APP_TOKEN=${baseToken}`,
  `FEISHU_TABLE_INTERNAL_USERS=${tables["Internal Users"] || ""}`,
  `FEISHU_TABLE_EXTERNAL_ACCOUNTS=${tables["External Accounts"] || ""}`,
  `FEISHU_TABLE_CUSTOMERS=${tables.Customers || ""}`,
  `FEISHU_TABLE_VEHICLE_MODELS=${tables["Vehicle Models"] || ""}`,
  `FEISHU_TABLE_VEHICLE_MODEL_SPECS=${tables["Vehicle Model Specs"] || ""}`,
  `FEISHU_TABLE_VEHICLES=${tables.Vehicles || ""}`,
  `FEISHU_TABLE_INQUIRIES=${tables.Inquiries || ""}`,
  `FEISHU_TABLE_QUOTES=${tables.Quotes || ""}`,
  `FEISHU_TABLE_NEGOTIATIONS=${tables.Negotiations || ""}`,
  `FEISHU_TABLE_ORDERS=${tables.Orders || ""}`,
  `PORTAL_SESSION_SECRET=${crypto.randomUUID()}-${crypto.randomUUID()}`,
  "PORTAL_COOKIE_NAME=youguard_portal",
  "",
].join("\n");
writeFileSync(envPath, envText, "utf8");

console.log("");
console.log("Feishu Base created.");
console.log(`Base token: ${baseToken}`);
console.log("Tables:");
for (const [name, id] of Object.entries(tables)) console.log(`  ${name}: ${id}`);
console.log("");
console.log(`Environment template written to ${envPath}`);
console.log("");
console.log("Demo portal accounts:");
console.log("  partner@example.com / partner-demo-2026");
console.log("  customer@example.com / customer-demo-2026");
