const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const baseToken = "Is6Xb3btbazhFhsDXgFcqFG1nRc";
const modelTableId = "tblxVNjP9dnJ7b3o";
const variantTableId = "tbl8YzkZkMxvHRoT";
const outDir = path.join(process.cwd(), "tmp", "feishu-model-fill", "row56-106-corrective");
fs.mkdirSync(outDir, { recursive: true });

const models = JSON.parse(fs.readFileSync("tmp/feishu-model-fill/models-records-after-write.json", "utf8"));
const variants = JSON.parse(fs.readFileSync("tmp/feishu-trim-fill/raw-records-final.json", "utf8"));
const modelById = new Map(models.map((record) => [record.fields.model_id, record]));
const variantById = new Map(variants.map((record) => [record.record_id, record]));

const modelPatches = [
  ["MDL-065", { vehicle_class: "Compact SUV", model_year: 2024, length_mm: 4270, width_mm: 1822, height_mm: 1636, wheelbase_mm: 2750, seats_min: 5, seats_max: 5, powertrain_type: "BEV", segment: "Compact SUV" }],
  ["MDL-066", { vehicle_class: "Compact crossover SUV", model_year: 2024, length_mm: 4400, width_mm: 1844, height_mm: 1556, wheelbase_mm: 2785, seats_min: 5, seats_max: 5, powertrain_type: "BEV", segment: "Compact SUV" }],
  ["MDL-067", { vehicle_class: "Mid-size SUV", model_year: 2024, width_mm: 1920, wheelbase_mm: 2900, seats_min: 5, seats_max: 5, powertrain_type: "BEV", segment: "Mid-size SUV" }],
  ["MDL-068", { vehicle_class: "Mid-size sedan", model_year: 2025, length_mm: 4855, width_mm: 1960, height_mm: 1450, wheelbase_mm: 2940, seats_min: 5, seats_max: 5, segment: "Mid-size sedan" }],
  ["MDL-073", { vehicle_class: "Compact hatchback", model_year: 2025, seats_min: 5, seats_max: 5, powertrain_type: "BEV", segment: "Compact hatchback" }],
  ["MDL-074", { vehicle_class: "Compact SUV", model_year: 2025, length_mm: 4600, width_mm: 1850, height_mm: 1645, wheelbase_mm: 2765, seats_min: 5, seats_max: 5, powertrain_type: "BEV", segment: "Compact SUV" }],
  ["MDL-088", { vehicle_class: "Micro car", model_year: 2025, length_mm: 3268, width_mm: 1520, height_mm: 1575, wheelbase_mm: 2190, seats_min: 4, seats_max: 4, powertrain_type: "BEV", segment: "Micro EV" }],
  ["MDL-093", { vehicle_class: "Mid-size sedan", model_year: 2026, length_mm: 4885, width_mm: 1916, height_mm: 1496, wheelbase_mm: 2922, seats_min: 5, seats_max: 5, powertrain_type: "BEV", segment: "Mid-size sedan" }],
  ["MDL-105", { vehicle_class: "Mid-size sedan", model_year: 2025, length_mm: 4835, width_mm: 1860, height_mm: 1515, seats_min: 5, seats_max: 5, powertrain_type: "BEV", segment: "Mid-size sedan" }],
  ["MDL-107", { vehicle_class: "Mid-size sedan", model_year: 2026, length_mm: 4997, width_mm: 1963, height_mm: 1455, wheelbase_mm: 3000, seats_min: 5, seats_max: 5, powertrain_type: "BEV", segment: "Mid-size sedan" }],
];

const variantUpdates = [
  ["recvqDuNsKilFV", { trim_order: 1, trim_price_display: 27273, range_display: 415, battery_capacity_kwh: 49, battery_chemistry: "LFP", drivetrain_display: "Rear motor RWD", motor_power_kw: 200, motor_torque_n_m: 343, dc_fast_charge_supported: true, dc_fast_charge_time_hours: 0.5, dc_fast_charge_min_percent: 10, dc_fast_charge_max_percent: 80, base_spec_summary_json: "[]", added_features_json: "[]", upgraded_features_json: "[]", recommended: false, source_url: "https://car.autohome.com.cn/config/spec/67703.html", last_verified_at: "2026-07-30 00:00:00", source_status: "Verified" }],
  ["recvqDuNsKTMAG", { trim_order: 1, trim_price_display: 35385, range_display: 570, battery_capacity_kwh: 76, battery_chemistry: "NCM", drivetrain_display: "Rear motor RWD", motor_power_kw: 250, motor_torque_n_m: 373, dc_fast_charge_supported: true, dc_fast_charge_time_hours: 0.5, dc_fast_charge_min_percent: 10, dc_fast_charge_max_percent: 80, base_spec_summary_json: "[]", added_features_json: "[]", upgraded_features_json: "[]", recommended: false, source_url: "https://car.autohome.com.cn/config/spec/68743.html", last_verified_at: "2026-07-30 00:00:00", source_status: "Verified" }],
  ["recvqDuNsKbast", { trim_order: 1, trim_price_display: 35385, range_display: 230, battery_capacity_kwh: 31.7, battery_chemistry: "LFP", drivetrain_display: "Rear motor RWD", motor_power_kw: 231, dc_fast_charge_supported: true, dc_fast_charge_time_hours: 0.17, dc_fast_charge_min_percent: 30, dc_fast_charge_max_percent: 80, base_spec_summary_json: "[]", added_features_json: "[]", upgraded_features_json: "[]", recommended: false, source_url: "https://www.avatr.com/configuration?car=06", last_verified_at: "2026-07-30 00:00:00", source_status: "Verified" }],
  ["recvqDuNsK1mPu", { trim_order: 1, trim_price_display: 10738, range_display: 430, battery_capacity_kwh: 41.9, battery_chemistry: "LFP", drivetrain_display: "Front motor FWD", motor_power_kw: 75, motor_torque_n_m: 180, dc_fast_charge_supported: true, base_spec_summary_json: "[]", added_features_json: "[]", upgraded_features_json: "[]", recommended: false, source_url: "https://www.wuling.com/carDetail?id=306", last_verified_at: "2026-07-30 00:00:00", source_status: "Verified" }],
  ["recvqDuNsK0K0F", { trim_order: 1, trim_price_display: 22160, range_display: 630, battery_capacity_kwh: 63.2, battery_chemistry: "LFP", drivetrain_display: "Rear motor RWD", motor_torque_n_m: 290, dc_fast_charge_supported: true, base_spec_summary_json: "[]", added_features_json: "[]", upgraded_features_json: "[]", recommended: false, source_url: "https://data.carnewschina.com/database/changan-nevo/changan-nevo-a06", last_verified_at: "2026-07-30 00:00:00", source_status: "Verified" }],
];

const defaultVariants = [
  ["MDL-065", "Default Pro Spec", { trim_order: 1, trim_price_display: 25000, range_display: 400, battery_capacity_kwh: 49, battery_chemistry: "LFP", drivetrain_display: "Rear motor RWD", motor_power_kw: 200, motor_torque_n_m: 343, dc_fast_charge_supported: true, dc_fast_charge_time_hours: 0.5, dc_fast_charge_min_percent: 10, dc_fast_charge_max_percent: 80, source_url: "https://car.autohome.com.cn/config/spec/66341.html" }],
  ["MDL-074", "Default 520 Pro+ Spec", { trim_order: 1, trim_price_display: 15100, range_display: 520, battery_capacity_kwh: 58.3, battery_chemistry: "LFP", drivetrain_display: "Front motor FWD", motor_power_kw: 150, motor_torque_n_m: 200, dc_fast_charge_supported: true, source_url: "https://carnewschina.com/2025/03/07/all-electric-toyota-bz3x-suv-launched-for-15100-usd-its-65-chinese/" }],
  ["MDL-088", "Default 301km Spec", { trim_order: 1, trim_price_display: 8083, range_display: 301, battery_chemistry: "LFP", drivetrain_display: "Rear motor RWD", dc_fast_charge_supported: true, dc_fast_charge_time_hours: 0.58, dc_fast_charge_min_percent: 30, dc_fast_charge_max_percent: 80, source_url: "https://wuling.com/carDetail?id=321" }],
  ["MDL-105", "Default 610km Flagship Spec", { trim_order: 1, trim_price_display: 18556, range_display: 610, battery_capacity_kwh: 69.2, battery_chemistry: "LFP", drivetrain_display: "Front motor FWD", dc_fast_charge_supported: true, source_url: "https://www.wuling.com/carDetail?id=305" }],
  ["MDL-107", "Default 2026 Max Spec", { trim_order: 1, trim_price_display: 44825, range_display: 835, battery_capacity_kwh: 101.7, battery_chemistry: "NCM", drivetrain_display: "Dual-motor AWD", dc_fast_charge_supported: true, source_url: "https://www.xiaomiev.com/car-config" }],
];

function run(command) {
  const res = spawnSync(command, { encoding: "utf8", shell: true, windowsHide: true });
  if (res.status !== 0) throw new Error(`${command}\n${res.stderr || res.stdout || res.error}`);
  return res.stdout ? JSON.parse(res.stdout) : null;
}

function writePayload(kind, id, payload) {
  const rel = path.relative(process.cwd(), path.join(outDir, `${kind}-${id}.json`)).replace(/\\/g, "/");
  fs.writeFileSync(path.join(process.cwd(), rel), JSON.stringify(payload, null, 2));
  return rel;
}

const results = [];

for (const [modelId, patch] of modelPatches) {
  const record = modelById.get(modelId);
  const rel = writePayload("model", modelId, patch);
  const data = run(`lark-cli base +record-upsert --base-token ${baseToken} --table-id ${modelTableId} --record-id ${record.record_id} --json @${rel} --as user --format json`);
  results.push({ type: "model", model_id: modelId, record_id: record.record_id, patch, data });
}

for (const [recordId, patch] of variantUpdates) {
  const rel = writePayload("variant", recordId, patch);
  const data = run(`lark-cli base +record-upsert --base-token ${baseToken} --table-id ${variantTableId} --record-id ${recordId} --json @${rel} --as user --format json`);
  results.push({ type: "variant-update", record_id: recordId, model_id: variantById.get(recordId)?.fields?.model_id, patch, data });
}

for (const [modelId, variant, spec] of defaultVariants) {
  const model = modelById.get(modelId);
  const payload = {
    trim_config_id: `${modelId}-DEFAULT`,
    model_id: modelId,
    variant,
    ...spec,
    base_spec_summary_json: "[]",
    added_features_json: "[]",
    upgraded_features_json: "[]",
    recommended: false,
    source_status: "Verified",
    last_verified_at: "2026-07-30 00:00:00",
    notes: "Default detailed version created to support model formula fields.",
    vehicle_model_pruned: [{ id: model.record_id }],
  };
  const rel = writePayload("variant-create", modelId, payload);
  const created = run(`lark-cli base +record-upsert --base-token ${baseToken} --table-id ${variantTableId} --json @${rel} --as user --format json`);
  const createdRecordId = created?.data?.record?.record_id || created?.record?.record_id;
  if (createdRecordId) {
    const recordIdPayload = { record_id: createdRecordId };
    const updateRel = writePayload("variant-created-record-id", modelId, recordIdPayload);
    run(`lark-cli base +record-upsert --base-token ${baseToken} --table-id ${variantTableId} --record-id ${createdRecordId} --json @${updateRel} --as user --format json`);
  }
  results.push({ type: "variant-create", model_id: modelId, created_record_id: createdRecordId, payload, created });
}

fs.writeFileSync(path.join(outDir, "results.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify({ writes: results.length, result: path.join(outDir, "results.json") }, null, 2));
