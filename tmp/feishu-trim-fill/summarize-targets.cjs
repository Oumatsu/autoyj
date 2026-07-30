const fs = require("fs");
const path = require("path");

const records = JSON.parse(fs.readFileSync(path.join(__dirname, "raw-records-backup.json"), "utf8"));
const present = (value) => !(value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0) || (typeof value === "string" && value.trim() === ""));
const critical = ["trim_price_display", "range_display", "battery_capacity_kwh", "battery_chemistry", "motor_power_kw", "drivetrain_display", "source_url"];

const targets = records
  .filter((record) => critical.some((field) => !present(record.fields[field])))
  .map((record) => ({
    record_id: record.record_id,
    trim_config_id: record.fields.trim_config_id,
    model_id: record.fields.model_id,
    variant: record.fields.variant,
    missing: critical.filter((field) => !present(record.fields[field])),
    fields: record.fields,
  }));

const byModel = new Map();
for (const item of targets) {
  if (!byModel.has(item.model_id)) byModel.set(item.model_id, []);
  byModel.get(item.model_id).push(item);
}

const summary = [...byModel.entries()].map(([model_id, items]) => ({
  model_id,
  count: items.length,
  variants: items.slice(0, 12).map((item) => item.variant),
  missingKinds: [...new Set(items.flatMap((item) => item.missing))],
}));

fs.writeFileSync(path.join(__dirname, "critical-missing-records.json"), JSON.stringify(targets, null, 2));
fs.writeFileSync(path.join(__dirname, "critical-missing-by-model.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ targetRows: targets.length, modelGroups: summary.length, summary: summary.slice(0, 40) }, null, 2));
