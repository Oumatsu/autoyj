import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const DEFAULT_TRIM_TABLE = "tblj7HRxFw7VLUXx";

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
const trimTable = env.FEISHU_TABLE_VEHICLE_TRIM_CONFIGURATIONS || DEFAULT_TRIM_TABLE;
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

function fieldList() {
  return runLark([
    "base", "+field-list",
    "--base-token", baseToken,
    "--table-id", trimTable,
    "--as", "user",
    "--format", "json",
    "--limit", "100",
  ]).fields;
}

function fieldByName(fields, name) {
  return fields.find((field) => field.name === name);
}

function renameField(fields, from, to) {
  const current = fieldByName(fields, from);
  if (!current || fieldByName(fields, to)) return false;
  const payload = {
    name: to,
    type: current.type,
    description: current.description || `Legacy text value kept for rollback from ${from}.`,
    ...(current.style ? { style: current.style } : {}),
    ...(current.multiple !== undefined ? { multiple: current.multiple } : {}),
    ...(current.options ? { options: current.options.map((option) => ({ name: option.name, hue: option.hue, lightness: option.lightness })) } : {}),
  };
  runLark([
    "base", "+field-update",
    "--base-token", baseToken,
    "--table-id", trimTable,
    "--field-id", current.id,
    "--as", "user",
    "--json", jsonFileArg("rename-field", payload),
    "--yes",
  ]);
  return true;
}

function createField(fields, schema) {
  if (fieldByName(fields, schema.name)) return false;
  runLark([
    "base", "+field-create",
    "--base-token", baseToken,
    "--table-id", trimTable,
    "--as", "user",
    "--json", jsonFileArg("create-field", schema),
  ]);
  return true;
}

function readAllRecords(fieldNames) {
  const records = [];
  for (let offset = 0; ; offset += 200) {
    const args = [
      "base", "+record-list",
      "--base-token", baseToken,
      "--table-id", trimTable,
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

function numberFromText(value) {
  const match = String(value || "").match(/-?\d+(?:,\d{3})*(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0].replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function parsePrice(value) {
  const text = String(value || "");
  if (!text || /TBC/i.test(text)) return null;
  return numberFromText(text);
}

function parseRange(value) {
  return numberFromText(value);
}

function parseBattery(value) {
  const text = String(value || "");
  const capacity = text.includes("kWh") ? numberFromText(text) : null;
  let chemistry = "";
  if (/semi-solid/i.test(text)) chemistry = "Semi-solid-state";
  else if (/NCM\s*\+\s*LFP/i.test(text)) chemistry = "NCM+LFP";
  else if (/NMC/i.test(text)) chemistry = "NMC";
  else if (/NCM/i.test(text)) chemistry = "NCM";
  else if (/LFP/i.test(text)) chemistry = "LFP";
  return { capacity, chemistry };
}

function parseMotor(value) {
  const text = String(value || "");
  const power = text.match(/(\d+(?:\.\d+)?)\s*kW/i);
  const torque = text.match(/(\d+(?:\.\d+)?)\s*N-m/i);
  return {
    power: power ? Number(power[1]) : null,
    torque: torque ? Number(torque[1]) : null,
  };
}

function parseCharging(value) {
  const text = String(value || "");
  const supported = /supported|optional/i.test(text);
  const time = text.match(/(\d+(?:\.\d+)?)\s*h/i);
  const range = text.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)%/);
  const upperOnly = !range ? text.match(/(?:^|\/|\s)(\d+(?:\.\d+)?)%/) : null;
  return {
    supported,
    timeHours: time ? Number(time[1]) : null,
    minPercent: range ? Number(range[1]) : null,
    maxPercent: range ? Number(range[2]) : upperOnly ? Number(upperOnly[1]) : null,
  };
}

function structuredPatch(fields) {
  const battery = parseBattery(fields["Legacy Battery Display"]);
  const motor = parseMotor(fields["Legacy Motor Display"]);
  const charging = parseCharging(fields["Legacy Charging Display"]);
  return {
    "Trim Price Display": parsePrice(fields["Legacy Trim Price Display"]),
    "Range Display": parseRange(fields["Legacy Range Display"]),
    "Battery Capacity kWh": battery.capacity,
    "Battery Chemistry": battery.chemistry || null,
    "Drivetrain Display": fields["Legacy Drivetrain Display"] || null,
    "Motor Power kW": motor.power,
    "Motor Torque N-m": motor.torque,
    "DC Fast Charge Supported": charging.supported,
    "DC Fast Charge Time Hours": charging.timeHours,
    "DC Fast Charge Min Percent": charging.minPercent,
    "DC Fast Charge Max Percent": charging.maxPercent,
  };
}

function valuesEqual(actual, expected) {
  if (expected === null || expected === undefined || expected === "") {
    return actual === null || actual === undefined || actual === "";
  }
  if (typeof expected === "number") return Number(actual) === expected;
  if (typeof expected === "boolean") return Boolean(actual) === expected;
  if (Array.isArray(actual)) return actual.includes(expected);
  return String(actual || "") === String(expected);
}

function needsPatch(fields, patch) {
  return Object.entries(patch).some(([name, expected]) => !valuesEqual(fields[name], expected));
}

function updateRecord(recordId, patch) {
  runLark([
    "base", "+record-upsert",
    "--base-token", baseToken,
    "--table-id", trimTable,
    "--record-id", recordId,
    "--as", "user",
    "--json", jsonFileArg("trim-structured-patch", patch),
  ]);
}

function main() {
  let fields = fieldList();
  const renames = [
    ["Trim Price Display", "Legacy Trim Price Display"],
    ["Range Display", "Legacy Range Display"],
    ["Battery Display", "Legacy Battery Display"],
    ["Drivetrain Display", "Legacy Drivetrain Display"],
    ["Motor Display", "Legacy Motor Display"],
    ["Charging Display", "Legacy Charging Display"],
  ];
  const renamed = renames.filter(([from, to]) => renameField(fields, from, to)).length;
  if (renamed) fields = fieldList();

  const records = readAllRecords([
    "Legacy Trim Price Display",
    "Trim Price Display",
    "Legacy Range Display",
    "Range Display",
    "Legacy Battery Display",
    "Battery Capacity kWh",
    "Battery Chemistry",
    "Legacy Drivetrain Display",
    "Drivetrain Display",
    "Legacy Motor Display",
    "Motor Power kW",
    "Motor Torque N-m",
    "Legacy Charging Display",
    "DC Fast Charge Supported",
    "DC Fast Charge Time Hours",
    "DC Fast Charge Min Percent",
    "DC Fast Charge Max Percent",
  ]);
  const drivetrainOptions = [...new Set(records.map((record) => record.fields["Legacy Drivetrain Display"]).filter(Boolean))].sort();
  const schemas = [
    { name: "Trim Price Display", type: "number", description: "China MSRP as a numeric RMB amount. Frontend formats currency.", style: { type: "currency", precision: 0, currency_code: "CNY" } },
    { name: "Range Display", type: "number", description: "CLTC electric range as a pure numeric kilometer value. Frontend appends km CLTC.", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
    { name: "Battery Capacity kWh", type: "number", description: "Battery capacity as a pure numeric kWh value. Frontend appends kWh.", style: { type: "plain", precision: 3, percentage: false, thousands_separator: false } },
    { name: "Battery Chemistry", type: "select", multiple: false, description: "Battery chemistry without the word battery; frontend adds battery label where needed.", options: ["LFP", "NCM", "NMC", "NCM+LFP", "Semi-solid-state"].map((name) => ({ name })) },
    { name: "Drivetrain Display", type: "select", multiple: false, description: "Normalized drivetrain option.", options: drivetrainOptions.map((name) => ({ name })) },
    { name: "Motor Power kW", type: "number", description: "Motor power as a pure numeric kW value. Frontend appends kW.", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
    { name: "Motor Torque N-m", type: "number", description: "Motor torque as a pure numeric N-m value. Frontend appends N-m.", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
    { name: "DC Fast Charge Supported", type: "checkbox", description: "Whether this trim supports DC fast charging." },
    { name: "DC Fast Charge Time Hours", type: "number", description: "DC fast charge time as a pure numeric hour value. Frontend appends h.", style: { type: "plain", precision: 2, percentage: false, thousands_separator: false } },
    { name: "DC Fast Charge Min Percent", type: "number", description: "Lower bound of the DC fast charge percentage window.", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
    { name: "DC Fast Charge Max Percent", type: "number", description: "Upper bound of the DC fast charge percentage window.", style: { type: "plain", precision: 0, percentage: false, thousands_separator: false } },
  ];
  const created = schemas.filter((schema) => createField(fields, schema)).length;
  if (created) fields = fieldList();

  let updated = 0;
  for (const record of records) {
    const patch = structuredPatch(record.fields);
    if (!needsPatch(record.fields, patch)) continue;
    updateRecord(record.recordId, patch);
    updated += 1;
  }

  fs.mkdirSync(".lark-tmp", { recursive: true });
  fs.writeFileSync(".lark-tmp/trim-structured-migration-report.json", JSON.stringify({
    renamed,
    created,
    updated,
    drivetrainOptions,
  }, null, 2), "utf8");
  console.log(`renamed=${renamed}`);
  console.log(`created=${created}`);
  console.log(`updated=${updated}`);
  console.log(`drivetrain_options=${drivetrainOptions.length}`);
}

main();
