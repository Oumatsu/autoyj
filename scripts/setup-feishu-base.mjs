import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const baseName = process.argv.includes("--name")
  ? process.argv[process.argv.indexOf("--name") + 1]
  : "autoYJ EV Export Portal";
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
    { name: "Model Year Text", type: "text" },
    { name: "Model Year", type: "number", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
    { name: "Version", type: "text" },
    { name: "Guide Price Display", type: "text" },
    { name: "Guide Price Min USD", type: "number", style: { type: "currency", precision: 0, currency_code: "USD" } },
    { name: "Guide Price Max USD", type: "number", style: { type: "currency", precision: 0, currency_code: "USD" } },
    { name: "Battery Capacity Text", type: "text" },
    { name: "Battery Capacity Min kWh", type: "number", style: { type: "plain", precision: 1, percentage: false, thousands_separator: false } },
    { name: "Battery Capacity Max kWh", type: "number", style: { type: "plain", precision: 1, percentage: false, thousands_separator: false } },
    { name: "Battery Chemistry", type: "select", multiple: false, description: "Normalized battery chemistry for filtering, statistics, and Hero Metric 3. Use Battery Technology for Blade/Magazine branding.", options: [{ name: "LFP" }, { name: "NCM" }, { name: "NMC" }, { name: "NCM / LFP" }] },
    { name: "Battery Technology", type: "select", multiple: false, description: "Battery technology or structural battery family such as Blade, 2nd Gen Blade, Magazine, or Aegis Short Blade. Leave blank when the source only identifies a supplier product line or when not verified.", options: [{ name: "Blade" }, { name: "2nd Gen Blade" }, { name: "Magazine" }, { name: "Aegis Short Blade" }] },
    { name: "CLTC Range Text", type: "text" },
    { name: "CLTC Range Min KM", type: "number", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
    { name: "CLTC Range Max KM", type: "number", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
    { name: "AC Slow Charge Supported", type: "checkbox" },
    { name: "AC Slow Charge Full Time Hours", type: "number", style: { type: "plain", precision: 2, percentage: false, thousands_separator: false } },
    { name: "Motor Power Text", type: "text" },
    { name: "Motor Power Min KW", type: "number", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
    { name: "Motor Power Max KW", type: "number", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
    { name: "0 - 100 km/h (sec)", type: "number", style: { type: "plain", precision: 2, percentage: false, thousands_separator: false } },
    { name: "Top Speed Text", type: "text" },
    { name: "Top Speed Min KMH", type: "number", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
    { name: "Top Speed Max KMH", type: "number", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
    { name: "Battery Warranty Text", type: "text" },
    { name: "Battery Warranty Years", type: "number", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
    { name: "Battery Warranty Distance KM", type: "number", style: { type: "plain", precision: 0, percentage: false, thousands_separator: true } },
    { name: "Dimensions Text", type: "text" },
    { name: "Dimensions LxWxH Text", type: "text" },
    { name: "Length MM", type: "number", style: { type: "plain", precision: 0, percentage: false, thousands_separator: true } },
    { name: "Width MM", type: "number", style: { type: "plain", precision: 0, percentage: false, thousands_separator: true } },
    { name: "Height MM", type: "number", style: { type: "plain", precision: 0, percentage: false, thousands_separator: true } },
    { name: "Wheelbase Text", type: "text" },
    { name: "Wheelbase MM", type: "number", style: { type: "plain", precision: 0, percentage: false, thousands_separator: true } },
    { name: "Seating Text", type: "text" },
    { name: "Seating Capacity Text", type: "text" },
    { name: "Seats Min", type: "number", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
    { name: "Seats Max", type: "number", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
    { name: "Sunroof Availability", type: "select", multiple: false, description: "Normalized model-level sunroof availability. Use Standard when broadly standard, Optional when offered as an option, By Trim when availability varies by trim, Not Available when verified unavailable, and leave blank when not verified.", options: [{ name: "Standard" }, { name: "Optional" }, { name: "By Trim" }, { name: "Not Available" }] },
    { name: "Airbags", type: "number", description: "Verified airbag count for the catalog model or representative export trim. Store numeric count only; leave blank when exact count is not verified.", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
    { name: "V2L Availability", type: "select", multiple: false, description: "Normalized model-level V2L / vehicle-to-load availability. Use Standard when broadly standard, Optional when offered as an option, By Trim when availability varies by trim, Market Dependent when export/market equipment varies, Not Supported when verified unavailable, and leave blank when not verified.", options: [{ name: "Standard" }, { name: "Optional" }, { name: "By Trim" }, { name: "Market Dependent" }, { name: "Not Supported" }] },
    { name: "V2L Output Power (kW)", type: "number", description: "Verified V2L / vehicle-to-load output power in kilowatts. Store numeric kW only; leave blank when the exact output is not verified.", style: { type: "plain", precision: 1, percentage: false, thousands_separator: false } },
    { name: "Steering Setup", type: "select", multiple: false, description: "Normalized steering configuration for catalog filtering. Store option only; frontend displays the long label.", options: [{ name: "LHD" }, { name: "RHD" }, { name: "LHD / RHD" }] },
    { name: "Voltage Platform (V)", type: "number", description: "Nominal high-voltage platform in volts. Store numeric volts only, for example 400, 800, 900, or 1000.", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
    { name: "Powertrain Type", type: "select", multiple: false, description: "Normalized powertrain type for filtering and frontend tags.", options: [{ name: "BEV" }, { name: "PHEV" }, { name: "EREV" }, { name: "HEV" }] },
    { name: "Household Charging", type: "checkbox", description: "Whether household charging is supported. If checked, frontend displays Yes - export charger depends on market; unchecked is hidden." },
    { name: "Review Notes", type: "text" },
    { name: "Image URL", type: "text" },
    { name: "Product Path", type: "text" },
    { name: "Trim Section Status", type: "select", multiple: false, description: "Overall trim-section verification state.", options: [{ name: "Verified" }, { name: "Partial" }, { name: "TBC" }] },
    { name: "Common Features JSON", type: "text", description: "JSON array of common feature groups shared by every trim." },
    { name: "Trim Source Summary", type: "text", description: "Public source note for the trim section." },
    { name: "Trim Last Verified At", type: "datetime", description: "When the trim section was last source-verified.", style: { format: "yyyy-MM-dd" } },
    { name: "Last Synced At", type: "datetime", style: { format: "yyyy-MM-dd HH:mm" } },
    { name: "Status", type: "select", multiple: false, options: [{ name: "Active" }, { name: "Draft" }, { name: "Needs Review" }, { name: "Archived" }] },
  ],
  "Vehicle Trim Configurations": [
    { name: "Trim Config ID", type: "text", description: "Stable row key, for example geely-geome-001." },
    { name: "Model ID", type: "text", description: "Vehicle Models Model ID. Public API uses this field to match trim rows." },
    { name: "Vehicle Model", type: "link", link_table: "Vehicle Models", bidirectional: true, bidirectional_link_field_name: "Trim Configurations" },
    { name: "Trim Name", type: "text", description: "Public trim or version name." },
    { name: "Trim Order", type: "number", description: "Display order from entry trim to highest trim.", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
    { name: "Trim Price Display", type: "number", description: "China MSRP as a numeric RMB amount. Frontend formats currency.", style: { type: "currency", precision: 0, currency_code: "CNY" } },
    { name: "Range Display", type: "number", description: "CLTC electric range as a pure numeric kilometer value. Frontend appends km CLTC.", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
    { name: "Battery Capacity kWh", type: "number", description: "Battery capacity as a pure numeric kWh value. Frontend appends kWh.", style: { type: "plain", precision: 3, percentage: false, thousands_separator: false } },
    { name: "Battery Chemistry", type: "select", multiple: false, description: "Battery chemistry without the word battery; frontend adds battery label where needed.", options: [{ name: "LFP" }, { name: "NCM" }, { name: "NMC" }, { name: "NCM+LFP" }, { name: "Semi-solid-state" }] },
    { name: "Drivetrain Display", type: "select", multiple: false, description: "Normalized drivetrain option.", options: [{ name: "Dual-motor AWD" }, { name: "Front motor FWD" }, { name: "Front motor RWD" }, { name: "Front-engine AWD" }, { name: "Rear motor RWD" }, { name: "Tri-motor AWD" }] },
    { name: "Motor Power kW", type: "number", description: "Motor power as a pure numeric kW value. Frontend appends kW.", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
    { name: "Motor Torque N-m", type: "number", description: "Motor torque as a pure numeric N-m value. Frontend appends N-m.", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
    { name: "DC Fast Charge Supported", type: "checkbox", description: "Whether this trim supports DC fast charging." },
    { name: "DC Fast Charge Time Hours", type: "number", description: "DC fast charge time as a pure numeric hour value. Frontend appends h.", style: { type: "plain", precision: 2, percentage: false, thousands_separator: false } },
    { name: "DC Fast Charge Min Percent", type: "number", description: "Lower bound of the DC fast charge percentage window.", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
    { name: "DC Fast Charge Max Percent", type: "number", description: "Upper bound of the DC fast charge percentage window.", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
    { name: "Base Spec Summary JSON", type: "text", description: "JSON array of core/base equipment for this trim." },
    { name: "Added Features JSON", type: "text", description: "JSON array of features added over the previous trim." },
    { name: "Upgraded Features JSON", type: "text", description: "JSON array of features upgraded over the previous trim." },
    { name: "Recommended", type: "checkbox", description: "Checked when this trim should be highlighted." },
    { name: "Source URL", type: "text", description: "Official or source-backed URL for this trim row." },
    { name: "Source Status", type: "select", multiple: false, description: "Verification status for this trim row.", options: [{ name: "Verified" }, { name: "Needs Source" }, { name: "TBC" }] },
    { name: "Last Verified At", type: "datetime", description: "When this trim row was last source-verified.", style: { format: "yyyy-MM-dd" } },
    { name: "Notes", type: "text", description: "Internal sourcing notes. Do not use as confirmed public facts." },
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
    { name: "Actor", type: "select", multiple: false, options: [{ name: "Customer" }, { name: "autoYJ" }, { name: "System" }] },
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
  "Portal Audit Log": [
    { name: "Log ID", type: "text" },
    { name: "Time", type: "text" },
    { name: "Operator ID", type: "text" },
    { name: "Operator Name", type: "text" },
    { name: "Operator Email", type: "text" },
    { name: "Role", type: "select", multiple: false, options: [{ name: "admin" }, { name: "sales" }, { name: "sourcing" }, { name: "finance" }, { name: "partner" }, { name: "customer" }] },
    { name: "Action", type: "select", multiple: false, options: [{ name: "CREATE" }, { name: "UPDATE" }, { name: "DELETE" }, { name: "READ" }] },
    { name: "Target Type", type: "text" },
    { name: "Target ID", type: "text" },
    { name: "Target Summary", type: "text" },
    { name: "Changed Fields", type: "text" },
    { name: "Before", type: "text" },
    { name: "After", type: "text" },
    { name: "Result", type: "select", multiple: false, options: [{ name: "success" }, { name: "failed" }] },
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
  ["Model ID", "Brand", "Model", "Model Year Text", "Model Year", "Version", "Guide Price Display", "Guide Price Min USD", "Guide Price Max USD", "Review Notes", "Image URL", "Status"],
  [
    ["MDL-001", "BYD", "Yuan Plus", "2026", 2026, "430KM Premium", "", null, null, "Confirm destination compliance before PI.", "/pic/revenue-king/Yplus/0.webp", "Active"],
    ["MDL-002", "BYD", "Seagull", "2026", 2026, "405KM", "", null, null, "Permit timing should be confirmed by shipment window.", "/pic/revenue-king/seagull/0.webp", "Active"],
    ["MDL-003", "Geely", "Galaxy E5", "2026", 2026, "530KM", "", null, null, "Specs should match local homologation.", "/pic/revenue-king/Galaxye5/1.webp", "Active"],
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
  `FEISHU_TABLE_VEHICLE_TRIM_CONFIGURATIONS=${tables["Vehicle Trim Configurations"] || ""}`,
  `FEISHU_TABLE_VEHICLES=${tables.Vehicles || ""}`,
  `FEISHU_TABLE_INQUIRIES=${tables.Inquiries || ""}`,
  `FEISHU_TABLE_QUOTES=${tables.Quotes || ""}`,
  `FEISHU_TABLE_NEGOTIATIONS=${tables.Negotiations || ""}`,
  `FEISHU_TABLE_ORDERS=${tables.Orders || ""}`,
  `FEISHU_TABLE_PORTAL_AUDIT_LOG=${tables["Portal Audit Log"] || ""}`,
  `PORTAL_SESSION_SECRET=${crypto.randomUUID()}-${crypto.randomUUID()}`,
  "PORTAL_COOKIE_NAME=autoyj_portal",
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
