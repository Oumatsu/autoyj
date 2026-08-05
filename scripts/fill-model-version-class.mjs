import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const BASE_TOKEN = "Is6Xb3btbazhFhsDXgFcqFG1nRc";
const MODELS_TABLE = "tblxVNjP9dnJ7b3o";

const CLASS_TRANSLATIONS = new Map([
  ["紧凑型SUV", "Compact SUV"],
  ["中型SUV", "Mid-size SUV"],
  ["中大型SUV", "Mid-to-large SUV"],
  ["大型SUV", "Large SUV"],
  ["小型SUV", "Small SUV"],
  ["紧凑型车", "Compact Car"],
  ["中型车", "Mid-size Sedan"],
  ["中大型车", "Mid-to-large Sedan"],
  ["小型车", "Small Car"],
  ["微型车", "Micro Car"],
  ["微面", "Microvan"],
  ["轻客", "Light Commercial Van"],
]);

function runLark(args) {
  const command = process.platform === "win32" ? "powershell.exe" : "lark-cli";
  const commandArgs = process.platform === "win32"
    ? ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", path.join(process.env.APPDATA || "", "npm", "lark-cli.ps1"), ...args]
    : args;
  const output = execFileSync(command, commandArgs, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 30 * 1024 * 1024,
  });
  const start = output.indexOf("{");
  const end = output.lastIndexOf("}");
  const parsed = JSON.parse(output.slice(start, end + 1));
  if (parsed.ok === false) throw new Error(JSON.stringify(parsed.error));
  return parsed.data || parsed;
}

function jsonFileArg(prefix, data) {
  fs.mkdirSync(".lark-tmp", { recursive: true });
  const file = `.lark-tmp/${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}.json`;
  fs.writeFileSync(file, JSON.stringify(data), "utf8");
  return `@./${file}`;
}

function readModels() {
  const fields = ["model_id", "brand", "model", "version", "vehicle_class", "model_year"];
  const rows = [];
  for (let offset = 0; ; offset += 200) {
    const data = runLark([
      "base", "+record-list",
      "--base-token", BASE_TOKEN,
      "--table-id", MODELS_TABLE,
      "--limit", "200",
      "--offset", String(offset),
      "--format", "json",
      "--as", "user",
      ...fields.flatMap((field) => ["--field-id", field]),
    ]);
    (data.data || []).forEach((row, index) => {
      rows.push({
        recordId: data.record_id_list[index],
        fields: Object.fromEntries(fields.map((field, fieldIndex) => [field, row[fieldIndex]])),
      });
    });
    if ((data.data || []).length < 200) break;
  }
  return rows;
}

const write = process.argv.includes("--write");
const updates = [];
for (const row of readModels()) {
  const patch = {};
  const currentVersion = String(row.fields.version || "").trim();
  const modelYear = Number(row.fields.model_year);
  if (!currentVersion && Number.isFinite(modelYear) && modelYear > 1900) {
    patch.version = `${modelYear} Model`;
  }
  const translatedClass = CLASS_TRANSLATIONS.get(String(row.fields.vehicle_class || "").trim());
  if (translatedClass) patch.vehicle_class = translatedClass;
  if (Object.keys(patch).length) {
    updates.push({
      recordId: row.recordId,
      modelId: row.fields.model_id,
      model: `${row.fields.brand || ""} ${row.fields.model || ""}`.trim(),
      patch,
    });
  }
}

fs.mkdirSync(".lark-tmp", { recursive: true });
fs.writeFileSync(".lark-tmp/model-version-class-updates.json", JSON.stringify(updates, null, 2), "utf8");
console.log(JSON.stringify({
  mode: write ? "write" : "report",
  updates: updates.length,
  versionUpdates: updates.filter((item) => item.patch.version).length,
  classUpdates: updates.filter((item) => item.patch.vehicle_class).length,
  report: ".lark-tmp/model-version-class-updates.json",
}, null, 2));

if (write) {
  for (const update of updates) {
    runLark([
      "base", "+record-upsert",
      "--base-token", BASE_TOKEN,
      "--table-id", MODELS_TABLE,
      "--record-id", update.recordId,
      "--format", "json",
      "--as", "user",
      "--json", jsonFileArg("model-version-class", update.patch),
    ]);
  }
  console.log("write complete");
}
