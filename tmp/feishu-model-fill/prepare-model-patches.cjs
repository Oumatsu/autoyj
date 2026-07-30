const fs = require("fs");
const path = require("path");

const outDir = path.join(process.cwd(), "tmp", "feishu-model-fill");
const models = JSON.parse(fs.readFileSync(path.join(outDir, "models-records.json"), "utf8"));
const variants = JSON.parse(fs.readFileSync(path.join(outDir, "variants-records.json"), "utf8"));

function present(value) {
  return !(
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "string" && value.trim() === "")
  );
}

function scalar(value) {
  return Array.isArray(value) ? value[0] : value;
}

function linkedVariantRows(modelFields) {
  const ids = (modelFields.trim_configurations_pruned || []).flatMap((cell) => cell.record_ids || []);
  const idSet = new Set(ids);
  return variants.filter((record) => idSet.has(record.record_id));
}

function inferPowertrain(modelFields, variantRows) {
  const name = `${modelFields.brand || ""} ${modelFields.model || ""}`.toLowerCase();
  const trimText = variantRows.map((record) => String(record.fields.variant || "")).join(" ").toLowerCase();
  const text = `${name} ${trimText}`;
  const hasBev = /\bbev\b|\bev\b|electric|纯电/.test(text) || /ev$/.test(name);
  const hasErev = /\berev\b|增程/.test(text);
  const hasPhev = /\bphev\b|dm-i|\bdm\b|hi4|plug-in|插混|混动/.test(text);

  if (hasErev && !hasBev && !hasPhev) return "EREV";
  if (hasPhev && !hasBev && !hasErev) return "PHEV";
  if (hasBev && !hasPhev && !hasErev) return "BEV";

  if (hasBev || hasPhev || hasErev) return null;

  const modelOnly = name;
  if (/ev$|seagull|galaxy e5|sealion 7|xiaomi yu7|xpeng g9|yuan up|t03|lumin|dolphin|geometry c|radar rd6|rich 6 ev|xingxiang v|mg4 ev/.test(modelOnly)) {
    return "BEV";
  }
  if (/leopard 5|leopard 8|tank 500 hi4-t|zeekr 9x|byd shark/.test(modelOnly)) return "PHEV";
  if (/li auto|voyah taishan/.test(modelOnly)) return "EREV";
  return null;
}

const manual = new Map([
  [
    "MDL-045",
    {
      vehicle_class: "Full-size luxury SUV",
      length_mm: 5239,
      width_mm: 2029,
      height_mm: 1819,
      wheelbase_mm: 3169,
      seats_min: 6,
      seats_max: 6,
      top_speed_min_kmh: 240,
      top_speed_max_kmh: 240,
      "0_100_km_h_sec": 3.1,
      v2l_availability: "Standard",
      v2l_output_power_kw: 6,
      voltage_platform_v: 900,
      powertrain_type: "PHEV",
      source_note: "Zeekr 9X specs cross-checked from public 2025-2026 reports.",
    },
  ],
  [
    "MDL-048",
    {
      vehicle_class: "Light commercial vehicle",
      width_mm: 1730,
      height_mm: 1895,
      wheelbase_mm: 3380,
      top_speed_min_kmh: 90,
      top_speed_max_kmh: 90,
      powertrain_type: "BEV",
      source_note: "Farizon Xingxiang V public specifications.",
    },
  ],
  [
    "MDL-047",
    {
      vehicle_class: "Electric pickup truck",
      seats_min: 5,
      seats_max: 5,
      powertrain_type: "BEV",
      source_note: "Dongfeng Rich 6 EV public specifications.",
    },
  ],
]);

const skipPowertrainModelIds = new Set([
  "MDL-009",
  "MDL-030",
]);

const patches = [];

for (const record of models) {
  const fields = record.fields || {};
  if (scalar(fields.status) !== "Active") continue;
  const patch = {};

  if (!present(fields.display_price_low) && present(fields.guide_price_min_usd_auto)) {
    patch.display_price_low = Number(scalar(fields.guide_price_min_usd_auto));
  }
  if (!present(fields.display_price_high) && present(fields.guide_price_max_usd_auto)) {
    patch.display_price_high = Number(scalar(fields.guide_price_max_usd_auto));
  }

  const inferredPowertrain = inferPowertrain(fields, linkedVariantRows(fields));
  if (!skipPowertrainModelIds.has(fields.model_id) && !present(fields.powertrain_type) && inferredPowertrain) {
    patch.powertrain_type = inferredPowertrain;
  }

  const manualPatch = manual.get(fields.model_id);
  if (manualPatch) {
    for (const [field, value] of Object.entries(manualPatch)) {
      if (field === "source_note") continue;
      if (!present(fields[field])) patch[field] = value;
    }
  }

  if (Object.keys(patch).length > 0) {
    patches.push({
      record_id: record.record_id,
      model_id: fields.model_id,
      brand: fields.brand,
      model: fields.model,
      source_note: manualPatch?.source_note || "Derived from linked verified trim records and model naming.",
      patch,
    });
  }
}

fs.writeFileSync(path.join(outDir, "prepared-model-patches.json"), JSON.stringify(patches, null, 2));
console.log(JSON.stringify({ patches: patches.length, fields: patches.reduce((sum, item) => sum + Object.keys(item.patch).length, 0) }, null, 2));
