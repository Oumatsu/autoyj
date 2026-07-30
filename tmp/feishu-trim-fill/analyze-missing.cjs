const fs = require("fs");
const path = require("path");

const dir = __dirname;
const pages = fs.readdirSync(dir)
  .filter((file) => /^trim-records-offset-\d+\.json$/.test(file))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

const rows = [];
let fields = [];
for (const file of pages) {
  const envelope = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8").replace(/^\uFEFF/, ""));
  fields = envelope.data.fields;
  const ids = envelope.data.record_id_list;
  for (let i = 0; i < envelope.data.data.length; i += 1) {
    const obj = { _record_id: ids[i] };
    fields.forEach((field, index) => {
      obj[field] = envelope.data.data[i][index];
    });
    rows.push(obj);
  }
}

fs.writeFileSync(path.join(dir, "trim-records-backup-normalized.json"), JSON.stringify(rows, null, 2));

const valuePresent = (value) => !(value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0) || (typeof value === "string" && value.trim() === ""));
const missing = {};
for (const field of fields) {
  missing[field] = rows.filter((row) => !valuePresent(row[field])).length;
}

console.log("rows", rows.length);
console.table(Object.entries(missing)
  .sort((a, b) => b[1] - a[1])
  .map(([field, count]) => ({ field, count, pct: `${((count / rows.length) * 100).toFixed(1)}%` })));

const target = [
  "variant",
  "trim_price_display",
  "range_display",
  "battery_capacity_kwh",
  "battery_chemistry",
  "drivetrain_display",
  "motor_power_kw",
  "motor_torque_n_m",
  "dc_fast_charge_supported",
  "dc_fast_charge_time_hours",
  "dc_fast_charge_min_percent",
  "dc_fast_charge_max_percent",
  "source_url",
  "source_status",
  "last_verified_at",
];
const missingRows = rows.filter((row) => target.some((field) => !valuePresent(row[field])));
fs.writeFileSync(path.join(dir, "trim-missing-target-fields.json"), JSON.stringify(missingRows, null, 2));
console.log("target missing rows", missingRows.length);
console.log(JSON.stringify(missingRows.slice(0, 30).map((row) => ({
  id: row._record_id,
  trim_config_id: row.trim_config_id,
  model_id: row.model_id,
  variant: row.variant,
  source_url: row.source_url,
  missing: target.filter((field) => !valuePresent(row[field])),
})), null, 2));
