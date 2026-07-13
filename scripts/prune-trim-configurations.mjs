import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const SOURCE_TRIM_TABLE = "tblj7HRxFw7VLUXx";
const VEHICLE_MODELS_TABLE = "tblJq4Un2LQQaFPU";
const TARGET_TABLE_NAME = "Vehicle Trim Configurations Pruned";
const MAX_TRIMS_PER_MODEL = 6;

function readDotEnv(file) {
  if (!fs.existsSync(file)) return {};
  const values = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || match[1].startsWith("#")) continue;
    values[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
  return values;
}

const env = { ...readDotEnv(".dev.vars"), ...process.env };
const baseToken = env.FEISHU_BASE_APP_TOKEN || env.FEISHU_BASE_TOKEN;
if (!baseToken) throw new Error("Missing FEISHU_BASE_APP_TOKEN in environment or .dev.vars");

function runLark(args) {
  const command = process.platform === "win32" ? "powershell.exe" : (process.env.LARK_CLI_BIN || "lark-cli");
  const commandArgs = process.platform === "win32"
    ? ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", process.env.LARK_CLI_BIN || path.join(process.env.APPDATA || "", "npm", "lark-cli.ps1"), ...args]
    : args;
  const output = execFileSync(command, commandArgs, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 20 * 1024 * 1024,
  });
  const start = output.indexOf("{");
  const end = output.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error(output);
  const parsed = JSON.parse(output.slice(start, end + 1));
  if (parsed.ok === false) throw new Error(JSON.stringify(parsed.error, null, 2));
  return parsed.data || parsed;
}

function jsonFileArg(name, value) {
  const tempDir = ".lark-tmp";
  fs.mkdirSync(tempDir, { recursive: true });
  const file = path.join(tempDir, `${name}-${Math.random().toString(36).slice(2)}.json`);
  fs.writeFileSync(file, JSON.stringify(value), "utf8");
  return `@./${file.replaceAll("\\", "/")}`;
}

const FIELD_NAMES = [
  "Trim Config ID",
  "Model ID",
  "Vehicle Model",
  "Trim Name",
  "Trim Order",
  "Trim Price Display",
  "Range Display",
  "Battery Capacity kWh",
  "Battery Chemistry",
  "Drivetrain Display",
  "Motor Power kW",
  "Motor Torque N-m",
  "DC Fast Charge Supported",
  "DC Fast Charge Time Hours",
  "DC Fast Charge Min Percent",
  "DC Fast Charge Max Percent",
  "Base Spec Summary JSON",
  "Added Features JSON",
  "Upgraded Features JSON",
  "Recommended",
  "Source URL",
  "Source Status",
  "Last Verified At",
  "Notes",
];

const TARGET_FIELDS = [
  { name: "Trim Config ID", type: "text", description: "Stable row key from the source trim table." },
  { name: "Model ID", type: "text", description: "Vehicle Models Model ID. Public API uses this field to match trim rows." },
  { name: "Trim Name", type: "text", description: "Public trim or version name." },
  { name: "Trim Order", type: "number", description: "Pruned display order from entry trim to highest trim.", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
  { name: "Trim Price Display", type: "number", description: "China MSRP as a numeric RMB amount. Frontend formats currency.", style: { type: "currency", precision: 0, currency_code: "CNY" } },
  { name: "Range Display", type: "number", description: "CLTC electric range as a pure numeric kilometer value. Frontend appends km CLTC.", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
  { name: "Battery Capacity kWh", type: "number", description: "Battery capacity as a pure numeric kWh value. Frontend appends kWh.", style: { type: "plain", precision: 3, percentage: false, thousands_separator: false } },
  { name: "Battery Chemistry", type: "select", multiple: false, description: "Battery chemistry without the word battery.", options: [{ name: "LFP" }, { name: "NCM" }, { name: "NMC" }, { name: "NCM+LFP" }, { name: "Semi-solid-state" }] },
  { name: "Drivetrain Display", type: "select", multiple: false, description: "Normalized drivetrain option.", options: [{ name: "Dual-motor AWD" }, { name: "Front motor FWD" }, { name: "Front motor RWD" }, { name: "Front-engine AWD" }, { name: "Rear motor RWD" }, { name: "Tri-motor AWD" }] },
  { name: "Motor Power kW", type: "number", description: "Motor power as a pure numeric kW value.", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
  { name: "Motor Torque N-m", type: "number", description: "Motor torque as a pure numeric N-m value.", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
  { name: "DC Fast Charge Supported", type: "checkbox", description: "Whether this trim supports DC fast charging." },
  { name: "DC Fast Charge Time Hours", type: "number", description: "DC fast charge time as a pure numeric hour value.", style: { type: "plain", precision: 2, percentage: false, thousands_separator: false } },
  { name: "DC Fast Charge Min Percent", type: "number", description: "Lower bound of the DC fast charge percentage window.", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
  { name: "DC Fast Charge Max Percent", type: "number", description: "Upper bound of the DC fast charge percentage window.", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
  { name: "Base Spec Summary JSON", type: "text", description: "JSON array of core/base equipment for this trim." },
  { name: "Added Features JSON", type: "text", description: "JSON array of features added over the previous retained trim." },
  { name: "Upgraded Features JSON", type: "text", description: "JSON array of features upgraded over the previous retained trim." },
  { name: "Recommended", type: "checkbox", description: "Checked when this trim should be highlighted." },
  { name: "Source URL", type: "text", description: "Official or source-backed URL for this trim row." },
  { name: "Source Status", type: "select", multiple: false, description: "Verification status for this trim row.", options: [{ name: "Verified" }, { name: "Needs Source" }, { name: "TBC" }] },
  { name: "Last Verified At", type: "datetime", description: "When this trim row was last source-verified.", style: { format: "yyyy-MM-dd" } },
  { name: "Notes", type: "text", description: "Internal pruning and sourcing notes." },
];

function tableList() {
  const data = runLark(["base", "+table-list", "--base-token", baseToken, "--as", "user", "--format", "json", "--limit", "100"]);
  return data.tables || data.items || data.data?.tables || [];
}

function createTargetTable() {
  const existing = tableList().find((table) => table.name === TARGET_TABLE_NAME);
  if (existing?.id) return { tableId: existing.id, created: false };
  const data = runLark([
    "base", "+table-create",
    "--base-token", baseToken,
    "--as", "user",
    "--name", TARGET_TABLE_NAME,
    "--fields", jsonFileArg("pruned-table-fields", TARGET_FIELDS),
  ]);
  const table = data.table || data;
  return { tableId: table.table_id || table.id, created: true };
}

function readAllRecords(tableId, fieldNames) {
  const records = [];
  for (let offset = 0; ; offset += 200) {
    const args = [
      "base", "+record-list",
      "--base-token", baseToken,
      "--table-id", tableId,
      "--as", "user",
      "--format", "json",
      "--limit", "200",
      "--offset", String(offset),
    ];
    for (const name of fieldNames) args.push("--field-id", name);
    const data = runLark(args);
    const rows = data.data || [];
    rows.forEach((row, index) => {
      records.push({
        recordId: data.record_id_list[index],
        fields: Object.fromEntries(fieldNames.map((name, fieldIndex) => [name, row[fieldIndex]])),
      });
    });
    if (rows.length < 200) break;
  }
  return records;
}

function listFromJson(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (!value) return [];
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return String(value).trim() ? [String(value).trim()] : [];
  }
}

function unique(values) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function valueNumber(row, name) {
  const value = row.fields[name];
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return Number.isFinite(parsed) ? parsed : null;
}

function valueText(row, name) {
  const value = row.fields[name];
  if (Array.isArray(value)) return value.map(String).filter(Boolean).join(", ");
  return value === null || value === undefined ? "" : String(value);
}

function improvementScore(row, previous) {
  if (!previous) return 1000;
  let score = 0;
  const range = valueNumber(row, "Range Display");
  const previousRange = valueNumber(previous, "Range Display");
  if (range !== null && previousRange !== null && range > previousRange) score += Math.min(20, (range - previousRange) / 20);

  const battery = valueNumber(row, "Battery Capacity kWh");
  const previousBattery = valueNumber(previous, "Battery Capacity kWh");
  if (battery !== null && previousBattery !== null && battery > previousBattery) score += Math.min(16, (battery - previousBattery) * 1.2);

  const power = valueNumber(row, "Motor Power kW");
  const previousPower = valueNumber(previous, "Motor Power kW");
  if (power !== null && previousPower !== null && power > previousPower) score += Math.min(16, (power - previousPower) / 20);

  const torque = valueNumber(row, "Motor Torque N-m");
  const previousTorque = valueNumber(previous, "Motor Torque N-m");
  if (torque !== null && previousTorque !== null && torque > previousTorque) score += Math.min(12, (torque - previousTorque) / 50);

  if (valueText(row, "Drivetrain Display") !== valueText(previous, "Drivetrain Display")) score += 10;
  const added = listFromJson(row.fields["Added Features JSON"]).length;
  const upgraded = listFromJson(row.fields["Upgraded Features JSON"]).length;
  score += Math.min(30, added * 3 + upgraded * 2);

  const price = valueNumber(row, "Trim Price Display");
  const previousPrice = valueNumber(previous, "Trim Price Display");
  if (price !== null && previousPrice !== null && price > previousPrice) score += Math.min(4, (price - previousPrice) / 50000);
  return score;
}

function chooseRows(rows) {
  if (rows.length <= MAX_TRIMS_PER_MODEL) {
    return { kept: rows.map((row) => ({ row, score: 100, carried: [] })), pruned: [] };
  }
  const scored = rows.map((row, index) => ({ row, index, score: improvementScore(row, rows[index - 1]) }));
  const keepIndexes = new Set([0, rows.length - 1]);
  scored
    .slice(1, -1)
    .filter((item) => item.score >= 4)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, MAX_TRIMS_PER_MODEL - keepIndexes.size)
    .forEach((item) => keepIndexes.add(item.index));

  if (keepIndexes.size < MAX_TRIMS_PER_MODEL) {
    scored
      .slice(1, -1)
      .filter((item) => !keepIndexes.has(item.index))
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .slice(0, MAX_TRIMS_PER_MODEL - keepIndexes.size)
      .forEach((item) => keepIndexes.add(item.index));
  }

  const kept = [];
  const pruned = [];
  let carry = [];
  rows.forEach((row, index) => {
    if (keepIndexes.has(index)) {
      kept.push({ row, score: scored[index].score, carried: carry });
      carry = [];
    } else {
      pruned.push(row);
      const trimName = valueText(row, "Trim Name") || `Trim ${index + 1}`;
      const carriedItems = [
        ...listFromJson(row.fields["Added Features JSON"]),
        ...listFromJson(row.fields["Upgraded Features JSON"]),
      ].map((item) => `Carried from ${trimName}: ${item}`);
      carry.push(...carriedItems);
    }
  });
  if (carry.length && kept.length) kept[kept.length - 1].carried.push(...carry);
  return { kept, pruned };
}

function rowValues(item, prunedCountByModel) {
  const row = item.row;
  const fields = row.fields;
  const added = unique([...item.carried, ...listFromJson(fields["Added Features JSON"])]);
  const upgraded = listFromJson(fields["Upgraded Features JSON"]);
  const sourceNotes = valueText(row, "Notes");
  const notes = unique([
    sourceNotes,
    item.carried.length ? `Pruned carry-over: ${item.carried.length} feature change(s) attached from skipped trims.` : "",
    prunedCountByModel ? `Pruned table source retained ${MAX_TRIMS_PER_MODEL} or fewer trims for this model.` : "",
  ]).join(" ");
  return [
    valueText(row, "Trim Config ID"),
    valueText(row, "Model ID"),
    valueText(row, "Trim Name"),
    Number(fields["Trim Order"]) || 0,
    fields["Trim Price Display"] ?? null,
    fields["Range Display"] ?? null,
    fields["Battery Capacity kWh"] ?? null,
    valueText(row, "Battery Chemistry") || null,
    valueText(row, "Drivetrain Display") || null,
    fields["Motor Power kW"] ?? null,
    fields["Motor Torque N-m"] ?? null,
    Boolean(fields["DC Fast Charge Supported"]),
    fields["DC Fast Charge Time Hours"] ?? null,
    fields["DC Fast Charge Min Percent"] ?? null,
    fields["DC Fast Charge Max Percent"] ?? null,
    valueText(row, "Base Spec Summary JSON"),
    JSON.stringify(added),
    JSON.stringify(upgraded),
    Boolean(fields.Recommended),
    valueText(row, "Source URL"),
    valueText(row, "Source Status") || "Verified",
    valueText(row, "Last Verified At"),
    notes,
  ];
}

function batchCreate(tableId, rows) {
  for (let i = 0; i < rows.length; i += 200) {
    runLark([
      "base", "+record-batch-create",
      "--base-token", baseToken,
      "--table-id", tableId,
      "--as", "user",
      "--json", jsonFileArg("pruned-trim-records", { fields: TARGET_FIELDS.map((field) => field.name), rows: rows.slice(i, i + 200) }),
    ]);
  }
}

function main() {
  const { tableId, created } = createTargetTable();
  const existing = readAllRecords(tableId, ["Trim Config ID"]);
  if (existing.length) {
    throw new Error(`${TARGET_TABLE_NAME} already has ${existing.length} records. Refusing to append duplicates.`);
  }

  const records = readAllRecords(SOURCE_TRIM_TABLE, FIELD_NAMES);
  const byModel = new Map();
  for (const record of records) {
    const modelId = valueText(record, "Model ID");
    if (!modelId) continue;
    if (!byModel.has(modelId)) byModel.set(modelId, []);
    byModel.get(modelId).push(record);
  }

  const outputRows = [];
  const report = [];
  for (const [modelId, rows] of byModel.entries()) {
    rows.sort((a, b) => (Number(a.fields["Trim Order"]) || 0) - (Number(b.fields["Trim Order"]) || 0));
    const { kept, pruned } = chooseRows(rows);
    kept.forEach((item, index) => {
      item.row.fields["Trim Order"] = index + 1;
      outputRows.push(rowValues(item, pruned.length));
    });
    report.push({
      modelId,
      sourceCount: rows.length,
      keptCount: kept.length,
      prunedCount: pruned.length,
      kept: kept.map((item) => ({
        trim: valueText(item.row, "Trim Name"),
        score: Number(item.score.toFixed(2)),
        carriedCount: item.carried.length,
      })),
      pruned: pruned.map((row) => valueText(row, "Trim Name")),
    });
  }

  batchCreate(tableId, outputRows);
  report.sort((a, b) => b.sourceCount - a.sourceCount || a.modelId.localeCompare(b.modelId));
  fs.writeFileSync(".lark-tmp/pruned-trim-report.json", JSON.stringify({ tableId, created, sourceRows: records.length, outputRows: outputRows.length, models: report }, null, 2), "utf8");
  console.log(`target_table=${tableId}`);
  console.log(`created=${created}`);
  console.log(`source_rows=${records.length}`);
  console.log(`output_rows=${outputRows.length}`);
  console.log("report=.lark-tmp/pruned-trim-report.json");
}

main();
