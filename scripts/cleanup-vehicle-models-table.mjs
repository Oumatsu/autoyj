import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE_TOKEN = "Xvdfbpk7cadLrnsVCFFcHbhOnCb";
const TABLE_ID = "tblJq4Un2LQQaFPU";
const VIEW_ID = "vewyvZ3wcl";
const TEMP_DIR = ".lark-tmp";
const utf8NoBom = { encoding: "utf8" };

mkdirSync(TEMP_DIR, { recursive: true });

function writeJson(name, value) {
  const path = join(TEMP_DIR, name);
  writeFileSync(path, JSON.stringify(value, null, 2), utf8NoBom);
  return `@${path}`;
}

function runLark(args) {
  const result = spawnSync("lark-cli", args, {
    cwd: process.cwd(),
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  const output = `${result.stdout || ""}\n${result.stderr || ""}`.trim();
  const start = output.indexOf("{");
  const end = output.lastIndexOf("}");
  const parsed = start !== -1 && end > start ? JSON.parse(output.slice(start, end + 1)) : {};
  if (result.status !== 0 || parsed.ok === false) {
    throw new Error(`lark-cli ${args.join(" ")} failed:\n${output}`);
  }
  return parsed;
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function fieldList() {
  return runLark([
    "base", "+field-list",
    "--as", "user",
    "--base-token", BASE_TOKEN,
    "--table-id", TABLE_ID,
    "--format", "json",
  ]).data.fields;
}

function recordList() {
  return runLark([
    "base", "+record-list",
    "--as", "user",
    "--base-token", BASE_TOKEN,
    "--table-id", TABLE_ID,
    "--view-id", VIEW_ID,
    "--page-size", "200",
    "--format", "json",
  ]).data;
}

function updateField(fieldId, payload) {
  const jsonArg = writeJson(`field-update-${fieldId}.json`, payload);
  runLark([
    "base", "+field-update",
    "--as", "user",
    "--base-token", BASE_TOKEN,
    "--table-id", TABLE_ID,
    "--field-id", fieldId,
    "--json", jsonArg,
    "--yes",
    "--format", "json",
  ]);
}

function createField(payload) {
  const safeName = payload.name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  const jsonArg = writeJson(`field-create-${safeName}.json`, payload);
  runLark([
    "base", "+field-create",
    "--as", "user",
    "--base-token", BASE_TOKEN,
    "--table-id", TABLE_ID,
    "--json", jsonArg,
    "--format", "json",
  ]);
}

function updateRecord(recordId, patch) {
  const jsonArg = writeJson(`record-update-${recordId}.json`, { record_id_list: [recordId], patch });
  const args = [
    "base", "+record-batch-update",
    "--as", "user",
    "--base-token", BASE_TOKEN,
    "--table-id", TABLE_ID,
    "--json", jsonArg,
    "--format", "json",
  ];
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      runLark(args);
      return;
    } catch (error) {
      const message = String(error?.message || error);
      const limited = message.includes("800004135") || message.includes("limited") || message.includes("1254291");
      if (!limited || attempt === 5) throw error;
      const delayMs = 2500 * attempt;
      console.log(`Rate limited on ${recordId}; retrying in ${delayMs}ms`);
      sleep(delayMs);
    }
  }
}

function asText(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(asText).filter(Boolean).join(", ");
  if (typeof value === "object") return String(value.text ?? value.name ?? value.value ?? value.id ?? "");
  return String(value);
}

function normalizeProductPath(value) {
  const text = asText(value).trim();
  const md = text.match(/\[.*?\]\((.*?)\)/);
  const raw = (md ? md[1] : text).split("?")[0].split("#")[0].trim();
  if (!raw) return "";
  if (raw.startsWith("/")) return raw;
  try {
    return new URL(raw).pathname;
  } catch {
    const index = raw.indexOf("/products/");
    return index === -1 ? raw : raw.slice(index);
  }
}

function parseUsdRange(value) {
  const text = asText(value);
  const values = [...text.matchAll(/\$?\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)/g)]
    .map((match) => Number(match[1].replace(/,/g, "")))
    .filter(Number.isFinite);
  if (!values.length) return { min: null, max: null };
  return { min: values[0], max: values[1] ?? values[0] };
}

function parseNumbers(value) {
  const text = asText(value).replace(/,/g, "");
  return [...text.matchAll(/\d+(?:\.\d+)?/g)]
    .map((match) => Number(match[0]))
    .filter(Number.isFinite);
}

function parseRange(value) {
  const values = parseNumbers(value);
  if (!values.length) return { min: null, max: null };
  if (values.length === 1) return { min: values[0], max: values[0] };
  return { min: Math.min(...values), max: Math.max(...values) };
}

function parsePowerRange(value) {
  const text = asText(value).replace(/\([^)]*(?:hp|ps|horsepower)[^)]*\)/gi, "");
  return parseRange(text);
}

function parseYear(value) {
  const match = asText(value).match(/(?:19|20)\d{2}/);
  if (!match) return null;
  const year = Number(match[0]);
  return Number.isFinite(year) ? year : null;
}

function parseWarranty(value) {
  const text = asText(value).replace(/,/g, "");
  const yearsMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:y|yr|yrs|year|years)\b/i);
  const distanceMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:km|kilometer|kilometers)\b/i);
  const values = parseNumbers(text);
  return {
    years: yearsMatch ? Number(yearsMatch[1]) : values[0] ?? null,
    distanceKm: distanceMatch ? Number(distanceMatch[1]) : values.find((value) => value >= 1000) ?? null,
  };
}

function parseDimensions(value) {
  const values = parseNumbers(value);
  return {
    length: values[0] ?? null,
    width: values[1] ?? null,
    height: values[2] ?? null,
  };
}

function firstExisting(row, names) {
  for (const name of names) {
    const value = row[name];
    if (asText(value).trim()) return value;
  }
  return "";
}

function rowObjects(fields, records) {
  const idToName = new Map(fields.map((field) => [field.id, field.name]));
  return records.data.map((row, rowIndex) => {
    const item = { recordId: records.record_id_list[rowIndex] };
    records.field_id_list.forEach((fieldId, fieldIndex) => {
      item[idToName.get(fieldId) || fieldId] = row[fieldIndex];
    });
    return item;
  });
}

const initialFields = fieldList();
const initialRecords = recordList();
const byName = new Map(initialFields.map((field) => [field.name, field]));

const renames = [
  ["China Guide Price CNY", "Guide Price Display", "Human-readable guide price for the product page. Use Guide Price Min USD and Guide Price Max USD for sorting."],
  ["China Guide Price", "Legacy Guide Price Text", "Historical imported guide-price text. Prefer Guide Price Display plus Guide Price Min USD and Guide Price Max USD."],
  ["Year", "Model Year Text", "Original model-year text. Use Model Year for sorting and filtering."],
  ["Battery Capacity", "Battery Capacity Text", "Original battery capacity text. Use Battery Capacity Min kWh and Battery Capacity Max kWh for sorting."],
  ["CLTC Range", "CLTC Range Text", "Original CLTC range text. Use CLTC Range Min KM and CLTC Range Max KM for sorting."],
  ["Motor Power", "Motor Power Text", "Original motor power text. Use Motor Power Min KW and Motor Power Max KW for sorting."],
  ["Top Speed", "Top Speed Text", "Original top-speed text. Use Top Speed Min KMH and Top Speed Max KMH for sorting."],
  ["Wheelbase", "Wheelbase Text", "Original wheelbase text. Use Wheelbase MM for sorting."],
  ["Dimensions", "Dimensions Text", "Original dimensions text. Use Length MM, Width MM, and Height MM for sorting."],
  ["Dimensions (LxWxH)", "Dimensions LxWxH Text", "Original LxWxH dimensions text. Use Length MM, Width MM, and Height MM for sorting."],
  ["Battery Warranty", "Battery Warranty Text", "Original warranty text. Use Battery Warranty Years and Battery Warranty Distance KM for sorting."],
  ["Seating", "Seating Text", "Original seating text. Use Seats Min and Seats Max for sorting."],
  ["Seating Capacity", "Seating Capacity Text", "Original seating-capacity text. Use Seats Min and Seats Max for sorting."],
  ["Source URL", "Product Path", "Relative product route, for example /products/revenue-king/byd-seagull. Do not store localhost URLs."],
  ["title", "Page Title", "Product detail page title."],
  ["subtitle", "Page Subtitle", "Product detail page subtitle."],
  ["heroDesc", "Hero Description", "Product detail hero description."],
  ["whyDesc", "Why Section Description", "Product detail why-section description."],
  ["galleryImages", "Gallery Images JSON", "JSON array for product gallery images."],
  ["trimData", "Trim Data JSON", "JSON array for product trim comparison rows."],

];

for (const [oldName, newName, description] of renames) {
  if (byName.has(newName)) continue;
  const field = byName.get(oldName);
  if (!field) continue;
  updateField(field.id, {
    type: "text",
    name: newName,
    style: { type: "plain" },
    description,
  });
  console.log(`Renamed ${oldName} -> ${newName}`);
}

let currentFields = fieldList();
let currentNames = new Set(currentFields.map((field) => field.name));
for (const payload of [
  {
    type: "number",
    name: "Model Year",
    style: { type: "plain", precision: 0, percentage: false, thousands_separator: false },
    description: "Sortable model year. Use blank when unknown; do not fabricate a full date.",
  },
  {
    type: "number",
    name: "Battery Capacity Min kWh",
    style: { type: "plain", precision: 1, percentage: false, thousands_separator: false },
    description: "Sortable lower bound parsed from Battery Capacity Text. Keep blank when unknown.",
  },
  {
    type: "number",
    name: "Battery Capacity Max kWh",
    style: { type: "plain", precision: 1, percentage: false, thousands_separator: false },
    description: "Sortable upper bound parsed from Battery Capacity Text. Keep blank when unknown.",
  },
  {
    type: "number",
    name: "CLTC Range Min KM",
    style: { type: "plain", precision: 0, percentage: false, thousands_separator: false },
    description: "Sortable lower bound parsed from CLTC Range Text. Keep blank when unknown.",
  },
  {
    type: "number",
    name: "CLTC Range Max KM",
    style: { type: "plain", precision: 0, percentage: false, thousands_separator: false },
    description: "Sortable upper bound parsed from CLTC Range Text. Keep blank when unknown.",
  },
  {
    type: "number",
    name: "Motor Power Min KW",
    style: { type: "plain", precision: 0, percentage: false, thousands_separator: false },
    description: "Sortable lower bound parsed from Motor Power Text. Keep blank when unknown.",
  },
  {
    type: "number",
    name: "Motor Power Max KW",
    style: { type: "plain", precision: 0, percentage: false, thousands_separator: false },
    description: "Sortable upper bound parsed from Motor Power Text. Keep blank when unknown.",
  },
  {
    type: "number",
    name: "Top Speed Min KMH",
    style: { type: "plain", precision: 0, percentage: false, thousands_separator: false },
    description: "Sortable lower bound parsed from Top Speed Text. Keep blank when unknown.",
  },
  {
    type: "number",
    name: "Top Speed Max KMH",
    style: { type: "plain", precision: 0, percentage: false, thousands_separator: false },
    description: "Sortable upper bound parsed from Top Speed Text. Keep blank when unknown.",
  },
  {
    type: "number",
    name: "Battery Warranty Years",
    style: { type: "plain", precision: 0, percentage: false, thousands_separator: false },
    description: "Battery warranty duration in years, parsed from Battery Warranty Text. Keep blank when unknown.",
  },
  {
    type: "number",
    name: "Battery Warranty Distance KM",
    style: { type: "plain", precision: 0, percentage: false, thousands_separator: true },
    description: "Battery warranty distance in kilometers, parsed from Battery Warranty Text. Keep blank when unknown.",
  },
  {
    type: "number",
    name: "Wheelbase MM",
    style: { type: "plain", precision: 0, percentage: false, thousands_separator: true },
    description: "Wheelbase in millimeters, parsed from Wheelbase Text. Keep blank when unknown.",
  },
  {
    type: "number",
    name: "Length MM",
    style: { type: "plain", precision: 0, percentage: false, thousands_separator: true },
    description: "Vehicle length in millimeters, parsed from dimensions text. Keep blank when unknown.",
  },
  {
    type: "number",
    name: "Width MM",
    style: { type: "plain", precision: 0, percentage: false, thousands_separator: true },
    description: "Vehicle width in millimeters, parsed from dimensions text. Keep blank when unknown.",
  },
  {
    type: "number",
    name: "Height MM",
    style: { type: "plain", precision: 0, percentage: false, thousands_separator: true },
    description: "Vehicle height in millimeters, parsed from dimensions text. Keep blank when unknown.",
  },
  {
    type: "number",
    name: "Seats Min",
    style: { type: "plain", precision: 0, percentage: false, thousands_separator: false },
    description: "Minimum seating capacity parsed from seating text. Keep blank when unknown.",
  },
  {
    type: "number",
    name: "Seats Max",
    style: { type: "plain", precision: 0, percentage: false, thousands_separator: false },
    description: "Maximum seating capacity parsed from seating text. Keep blank when unknown.",
  },
  {
    type: "number",
    name: "Guide Price Min USD",
    style: { type: "currency", precision: 0, currency_code: "USD" },
    description: "Sortable lower bound parsed from Guide Price Display. Leave blank when unknown.",
  },
  {
    type: "number",
    name: "Guide Price Max USD",
    style: { type: "currency", precision: 0, currency_code: "USD" },
    description: "Sortable upper bound parsed from Guide Price Display. Leave blank when unknown.",
  },
]) {
  if (!currentNames.has(payload.name)) {
    createField(payload);
    console.log(`Created ${payload.name}`);
  }
}

currentFields = fieldList();
currentNames = new Set(currentFields.map((field) => field.name));

const rows = rowObjects(initialFields, initialRecords);
for (const row of rows) {
  const guideDisplay = asText(firstExisting(row, ["China Guide Price CNY", "Guide Price Display", "China Guide Price", "Legacy Guide Price Text"])).trim();
  const price = parseUsdRange(guideDisplay);
  const productPath = normalizeProductPath(firstExisting(row, ["Source URL", "Product Path"]));
  const modelYear = parseYear(firstExisting(row, ["Year", "Model Year Text", "Model Year"]));
  const batteryCapacity = parseRange(firstExisting(row, ["Battery Capacity", "Battery Capacity Text", "Battery"]));
  const cltcRange = parseRange(firstExisting(row, ["CLTC Range", "CLTC Range Text", "Range"]));
  const motorPower = parsePowerRange(firstExisting(row, ["Motor Power", "Motor Power Text"]));
  const topSpeed = parseRange(firstExisting(row, ["Top Speed", "Top Speed Text"]));
  const warranty = parseWarranty(firstExisting(row, ["Battery Warranty", "Battery Warranty Text", "Warranty"]));
  const wheelbase = parseNumbers(firstExisting(row, ["Wheelbase", "Wheelbase Text"]))[0] ?? null;
  const dimensions = parseDimensions(firstExisting(row, ["Dimensions (LxWxH)", "Dimensions LxWxH Text", "Dimensions", "Dimensions Text"]));
  const seats = parseRange(firstExisting(row, ["Seating", "Seating Text", "Seating Capacity", "Seating Capacity Text", "Seats"]));

  const patch = {
    "Guide Price Display": guideDisplay || null,
    "Product Path": productPath || null,
  };
  const setIfPresent = (name, value) => {
    if (currentNames.has(name)) patch[name] = value;
  };

  setIfPresent("Guide Price Min USD", price.min);
  setIfPresent("Guide Price Max USD", price.max);
  setIfPresent("Model Year", modelYear);
  setIfPresent("Battery Capacity Min kWh", batteryCapacity.min);
  setIfPresent("Battery Capacity Max kWh", batteryCapacity.max);
  setIfPresent("CLTC Range Min KM", cltcRange.min);
  setIfPresent("CLTC Range Max KM", cltcRange.max);
  setIfPresent("Motor Power Min KW", motorPower.min);
  setIfPresent("Motor Power Max KW", motorPower.max);
  setIfPresent("Top Speed Min KMH", topSpeed.min);
  setIfPresent("Top Speed Max KMH", topSpeed.max);
  setIfPresent("Battery Warranty Years", warranty.years);
  setIfPresent("Battery Warranty Distance KM", warranty.distanceKm);
  setIfPresent("Wheelbase MM", wheelbase);
  setIfPresent("Length MM", dimensions.length);
  setIfPresent("Width MM", dimensions.width);
  setIfPresent("Height MM", dimensions.height);
  setIfPresent("Seats Min", seats.min);
  setIfPresent("Seats Max", seats.max);

  updateRecord(row.recordId, patch);
  console.log(`Cleaned ${row.recordId}`);
  sleep(600);
}

console.log(`Vehicle Models cleanup complete: ${rows.length} records processed.`);
