import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import zhStatic from "../i18n/translations/zh.ts";
import enStatic from "../i18n/translations/en.ts";
import amStatic from "../i18n/translations/am.ts";
import { detailValueKey } from "../views/products/detailTranslations.ts";
import {
  sharedDetailTranslations,
  translateAutomotivePhrase,
  translateTrimName,
} from "./product-detail-i18n-data.mjs";

const BASE_TOKEN = "Xvdfbpk7cadLrnsVCFFcHbhOnCb";
const MODEL_TABLE = "tblJq4Un2LQQaFPU";
const VARIANT_TABLE = "tblOFdkS6FixMeXA";
const I18N_TABLE = "tblATd4EWHge1l1k";
const PREVIEW = process.env.PRODUCT_DETAIL_BASE_URL || "https://autoyj-preview.haipee.workers.dev";
const WRITE = process.argv.includes("--write");
const PRUNE = process.argv.includes("--prune");
const cli = path.join(process.env.APPDATA || "", "npm", "node_modules", "@larksuite", "cli", "scripts", "run.js");

function runLark(args) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, LARKSUITE_CLI_NO_UPDATE_NOTIFIER: "1", LARKSUITE_CLI_NO_SKILLS_NOTIFIER: "1" },
  });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || `lark-cli exited ${result.status}`);
  const parsed = JSON.parse(result.stdout);
  if (!parsed.ok) throw new Error(JSON.stringify(parsed.error || parsed));
  return parsed.data;
}

function listTable(tableId, fields, filter) {
  const rows = [];
  let offset = 0;
  let hasMore = true;
  while (hasMore) {
    const args = ["base", "+record-list", "--base-token", BASE_TOKEN, "--table-id", tableId];
    if (filter) args.push("--filter-json", JSON.stringify(filter));
    fields.forEach((field) => args.push("--field-id", field));
    args.push("--offset", String(offset), "--limit", "200", "--as", "user", "--format", "json");
    const payload = runLark(args);
    const ids = payload.record_id_list || [];
    ids.forEach((recordId, index) => rows.push({
      recordId,
      fields: Object.fromEntries(fields.map((field, fieldIndex) => [field, payload.data[index][fieldIndex]])),
    }));
    offset += ids.length;
    hasMore = payload.has_more === true;
    if (hasMore && ids.length === 0) throw new Error(`${tableId} pagination made no progress`);
  }
  return rows;
}

function curlJson(url) {
  return new Promise((resolve, reject) => {
    const child = spawn("curl.exe", ["-fsS", "--retry", "4", "--retry-all-errors", "--max-time", "45", url], { windowsHide: true });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) return reject(new Error(`${url}: ${stderr || `curl exited ${code}`}`));
      try { resolve(JSON.parse(stdout)); } catch (error) { reject(new Error(`${url}: invalid JSON: ${error.message}`)); }
    });
  });
}

async function mapLimit(values, limit, mapper) {
  const output = new Array(values.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, async () => {
    while (cursor < values.length) {
      const index = cursor++;
      output[index] = await mapper(values[index], index);
    }
  }));
  return output;
}

function text(value) {
  if (Array.isArray(value)) return value.map(text).join("");
  if (value && typeof value === "object") return text(value.text ?? value.name ?? value.value ?? "");
  return value == null ? "" : String(value);
}

function linkIds(value) {
  return Array.isArray(value) ? value.map((item) => item?.id || item).filter(Boolean) : [];
}

function parsedArray(value) {
  if (typeof value !== "string" || !value.trim().startsWith("[")) return null;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function keyPart(value) {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function detailKey(slug, field) { return `productsDetail.models.${keyPart(slug)}.${field}`; }
function variantKey(id, field) { return `productsDetail.variants.${keyPart(id)}.${field}`; }

function catalogValue(locale, slug, field, fallback) {
  const root = locale === "zh" ? zhStatic : locale === "am" ? amStatic : enStatic;
  return root?.catalog?.models?.[slug]?.[field] || fallback;
}

const basic = {
  zh: {
    "Revenue Growth Model": "营收增长车型", "Executive Flagship Model": "行政旗舰车型", "Utility & Fleet Model": "多功能车队车型",
    "Why this model": "为什么选择这款车", "Powertrain Snapshot": "动力概览", "Export Data Coverage": "出口数据覆盖", "Supply Status": "供应状态",
    Exterior: "外观", Interior: "内饰", Detail: "细节", Range: "续航", Price: "价格", Battery: "电池",
    "Core model specs": "车型核心参数", "Shared equipment": "全系共有配置",
  },
  am: {
    "Revenue Growth Model": "ገቢ የሚያሳድግ ሞዴል", "Executive Flagship Model": "የአስፈጻሚ ፍላግሺፕ ሞዴል", "Utility & Fleet Model": "የንግድና የፍሊት ሞዴል",
    "Why this model": "ይህን ሞዴል ለምን ይምረጡ", "Powertrain Snapshot": "የኃይል ስርዓት ማጠቃለያ", "Export Data Coverage": "የውጭ ገበያ መረጃ", "Supply Status": "የአቅርቦት ሁኔታ",
    Exterior: "ውጫዊ ገጽታ", Interior: "ውስጣዊ ክፍል", Detail: "ዝርዝር", Range: "የመንዳት ርቀት", Price: "ዋጋ", Battery: "ባትሪ",
    "Core model specs": "ዋና የሞዴል መረጃ", "Shared equipment": "የጋራ መሳሪያ",
  },
};

function modelText(locale, slug, field, value, detail) {
  if (!value || locale === "en") return value;
  const direct = basic[locale][value];
  if (direct) return direct;
  if (field === "title" || field === "vehicle.name" || field === "vehicle.brand") {
    const display = catalogValue(locale, slug, "displayName", detail.title);
    if (field === "title") return display;
    if (field === "vehicle.name") return locale === "zh" ? display : detail.vehicle.name;
    return locale === "zh" ? "" : detail.vehicle.brand;
  }
  if (field === "whyDesc") return catalogValue(locale, slug, "cardHighlight", value);
  if (field === "heroDesc") return locale === "zh"
    ? `${catalogValue(locale, slug, "displayName", detail.title)}已加入动态车型目录，包含公开参数、出口价格参考及车型图片。`
    : `${catalogValue(locale, slug, "displayName", detail.title)} በተለዋዋጭ ካታሎግ ውስጥ ተካቷል፤ የሕዝብ መረጃ፣ የውጭ ገበያ ዋጋ መመሪያ እና የመኪና ምስሎች አሉት።`;
  if (/features\.1\.desc$/.test(field)) {
    const price = detail.vehicle.fob;
    return locale === "zh" ? `有来源支持的参考价为${price}，并提供经核实的公开参数。` : `በምንጭ የተደገፈ መመሪያ ዋጋ ${price} እና የተረጋገጠ የሕዝብ መረጃ።`;
  }
  if (/features\.0\.desc$/.test(field)) return value.replace(/闂\?/g, " / ");
  if (/sourceSummary|trimNote/.test(field)) {
    const url = value.match(/https?:\/\/\S+/)?.[0] || "";
    return locale === "zh" ? `版本数据已根据公开配置页面核实：${url}` : `የትሪም መረጃ ከሕዝብ የውቅር ገጽ ተረጋግጧል፦ ${url}`;
  }
  return translateAutomotivePhrase(value, locale);
}

function record(Key, EN, ZH, AM, linkedModelIds = [], linkedVariantIds = [], notes = "") {
  return { Key, Module: "产品", ZH, EN, AM, Notes: notes, linkedModelIds, linkedVariantIds };
}

function addContextRecord(records, Key, EN, ZH, AM, modelId, variantId = "", notes = "") {
  if (!EN || (EN === ZH && EN === AM)) return;
  records.push(record(Key, EN, ZH, AM, modelId ? [modelId] : [], variantId ? [variantId] : [], notes));
}

function collectSharedValue(values, EN, ZH, AM, modelId, variantId = "") {
  if (!EN || (EN === ZH && EN === AM)) return;
  const Key = detailValueKey(EN);
  const existing = values.get(Key);
  if (existing && (existing.EN !== EN || existing.ZH !== ZH || existing.AM !== AM)) {
    throw new Error(`Shared value hash or translation collision: ${Key}`);
  }
  const item = existing || record(Key, EN, ZH, AM, [], [], "Unique shared vehicle-detail value");
  if (modelId && !item.linkedModelIds.includes(modelId)) item.linkedModelIds.push(modelId);
  if (variantId && !item.linkedVariantIds.includes(variantId)) item.linkedVariantIds.push(variantId);
  values.set(Key, item);
}

function addModelRecords(records, values, detail, model) {
  const addModel = (field, value) => {
    if (typeof value !== "string" || !value) return;
    addContextRecord(records, detailKey(model.slug, field), value, modelText("zh", model.slug, field, value, detail), modelText("am", model.slug, field, value, detail), model.recordId, "", "Vehicle-specific detail content");
  };
  const addValue = (field, value) => {
    if (typeof value !== "string" || !value) return;
    collectSharedValue(values, value, modelText("zh", model.slug, field, value, detail), modelText("am", model.slug, field, value, detail), model.recordId);
  };
  const addValues = (field, source) => source?.forEach((value) => addValue(field, value));

  ["heroDesc", "whyDesc", "trimNote"].forEach((field) => addModel(field, detail[field]));
  ["brand", "name"].forEach((field) => addModel(`vehicle.${field}`, detail.vehicle?.[field]));
  addValue("subtitle", detail.subtitle);
  [detail.stat1Value, detail.stat2Value, detail.stat3Value].forEach((value) => addValue("statValue", value));
  addValue("vehicle.charging", detail.vehicle?.charging);
  addValue("vehicle.statusText", detail.vehicle?.statusText);
  addValues("tags", detail.tags);
  detail.features?.forEach((item, index) => { addValue(`features.${index}.title`, item.title); addValue(`features.${index}.desc`, item.desc); });
  detail.specsLeft?.forEach((item) => addValue("specValue", item.value));
  detail.specsRight?.forEach((item) => addValue("specValue", item.value));
  detail.fits?.forEach((item) => { addValue("fit.title", item.title); addValue("fit.desc", item.desc); addValue("fit.accent", item.accent); });
  addValue("trim.status", detail.trimComparison?.status);
  detail.trimComparison?.commonFeatures?.forEach((group) => { addValue("common.category", group.category); addValues("common.items", group.items); });
}

function addVariantRecords(records, values, detail, model, variantsByName) {
  for (const trim of detail.trimComparison?.trims || []) {
    const candidates = variantsByName.get(`${model.modelId}\0${trim.order}\0${trim.name}`) || [];
    if (candidates.length !== 1) throw new Error(`Expected one variant for ${model.modelId} / ${trim.name}, got ${candidates.length}`);
    const variant = candidates[0];
    addContextRecord(records, variantKey(variant.trimConfigId, "name"), trim.name, translateTrimName(trim.name, "zh"), translateTrimName(trim.name, "am"), model.recordId, variant.recordId, "Trim-specific display name");
    const addValue = (value) => {
      if (typeof value !== "string" || !value) return;
      collectSharedValue(values, value, translateAutomotivePhrase(value, "zh"), translateAutomotivePhrase(value, "am"), model.recordId, variant.recordId);
    };
    [trim.batteryDisplay, trim.drivetrain, trim.drivetrainDisplay, trim.chargingDisplay, trim.sourceStatus].forEach(addValue);
    [trim.baseFeatures, trim.addedFeatures, trim.upgradedFeatures].forEach((items) => items?.forEach(addValue));
    trim.keySpecs?.forEach((spec) => { addValue(spec.label); addValue(spec.value); });
  }
}

async function buildManifest() {
  const modelRows = listTable(MODEL_TABLE, ["Model ID", "Product Path", "Brand", "Model"]);
  const models = modelRows.map((row) => ({
    recordId: row.recordId, modelId: text(row.fields["Model ID"]), path: text(row.fields["Product Path"]),
    brand: text(row.fields.Brand), model: text(row.fields.Model),
    slug: text(row.fields["Product Path"]).split("?")[0].split("#")[0].split("/").filter(Boolean).pop(),
  }));
  const variantRows = listTable(VARIANT_TABLE, ["Trim Config ID", "Model ID", "Trim Name", "Trim Order", "Vehicle Model Pruned"]);
  const variants = variantRows.map((row) => ({ recordId: row.recordId, trimConfigId: text(row.fields["Trim Config ID"]), modelId: text(row.fields["Model ID"]), name: text(row.fields["Trim Name"]), order: Number(row.fields["Trim Order"]), modelLinks: linkIds(row.fields["Vehicle Model Pruned"]) }));
  if (models.length !== 47 || new Set(models.map((m) => m.slug)).size !== 47 || new Set(models.map((m) => m.modelId)).size !== 47) throw new Error(`Model validation failed: ${models.length}`);
  if (variants.length !== 251 || new Set(variants.map((v) => v.trimConfigId)).size !== 251) throw new Error(`Variant validation failed: ${variants.length}`);
  const modelById = new Map(models.map((model) => [model.modelId, model]));
  for (const variant of variants) {
    const model = modelById.get(variant.modelId);
    if (!model || variant.modelLinks.length !== 1 || variant.modelLinks[0] !== model.recordId) throw new Error(`Variant relation mismatch: ${variant.trimConfigId}`);
  }
  const variantsByName = new Map();
  for (const variant of variants) {
    const key = `${variant.modelId}\0${variant.order}\0${variant.name}`;
    variantsByName.set(key, [...(variantsByName.get(key) || []), variant]);
  }
  const details = await mapLimit(models, 6, (model) => curlJson(`${PREVIEW}/api/portal/public/products/${model.slug}`));
  const sharedValues = new Map();
  const records = sharedDetailTranslations.map((item) => record(item.Key, item.EN, item.ZH, item.AM, [], [], item.Notes));
  models.forEach((model, index) => {
    addModelRecords(records, sharedValues, details[index], model);
    addVariantRecords(records, sharedValues, details[index], model, variantsByName);
  });
  records.push(...sharedValues.values());
  const keys = records.map((item) => item.Key);
  if (new Set(keys).size !== keys.length) throw new Error(`Duplicate manifest keys: ${keys.length - new Set(keys).size}`);
  for (const item of records) {
    if (item.EN === "[]" || parsedArray(item.EN)) throw new Error(`Array records are not allowed: ${item.Key}`);
    if (item.EN === item.ZH && item.EN === item.AM) throw new Error(`Invariant record is not allowed: ${item.Key}`);
    if (item.Key.toLowerCase().includes("gallery")) throw new Error(`Gallery metadata is not translatable: ${item.Key}`);
    if (item.Key.startsWith("productsDetail.variants.") && (item.linkedModelIds.length !== 1 || item.linkedVariantIds.length !== 1)) throw new Error(`Missing variant relations: ${item.Key}`);
    if (item.Key.startsWith("productsDetail.models.") && (item.linkedModelIds.length !== 1 || item.linkedVariantIds.length !== 0)) throw new Error(`Invalid model relations: ${item.Key}`);
  }
  return { records, models, variants, sharedValues: sharedValues.size };
}

function existingRecords() {
  const rows = listTable(I18N_TABLE, ["Key", "Module", "ZH", "EN", "AM", "Notes", "Linked Vehicle Model", "Linked vehicle_variants"], { logic: "and", conditions: [["Module", "==", ["产品"]]] });
  const records = new Map();
  const ownedDuplicates = [];
  for (const row of rows) {
    const key = text(row.fields.Key);
    if (records.has(key) && isOwnedKey(key)) ownedDuplicates.push({ key, recordId: records.get(key).recordId });
    records.set(key, row);
  }
  records.ownedDuplicates = ownedDuplicates;
  records.allRecordIds = new Set(rows.map((row) => row.recordId));
  return records;
}

function isOwnedKey(key) {
  return key.startsWith("productsDetail.models.")
    || key.startsWith("productsDetail.variants.")
    || key.startsWith("productsDetail.values.")
    || key.startsWith("productsDetail.ui.");
}

function sameLinks(actual, expected) {
  return [...actual].sort().join("\0") === [...expected].sort().join("\0");
}

function markForManualDeletion(recordIds) {
  for (let index = 0; index < recordIds.length; index += 200) {
    runLark(["base", "+record-batch-update", "--base-token", BASE_TOKEN, "--table-id", I18N_TABLE, "--json", JSON.stringify({
      record_id_list: recordIds.slice(index, index + 200),
      patch: { Module: "待删除-车型详情" },
    }), "--as", "user", "--format", "json"]);
  }
}

function pruneStaleRecords(stale) {
  let deleted = 0;
  try {
    for (let index = 0; index < stale.length; index += 200) {
      const recordIds = stale.slice(index, index + 200).map((item) => item.recordId);
      runLark(["base", "+record-delete", "--base-token", BASE_TOKEN, "--table-id", I18N_TABLE, "--json", JSON.stringify({ record_id_list: recordIds }), "--yes", "--as", "user", "--format", "json"]);
      deleted += recordIds.length;
    }
    return { deleted, marked: 0 };
  } catch (error) {
    const remaining = existingRecords();
    const remainingIds = stale.filter((item) => remaining.allRecordIds.has(item.recordId)).map((item) => item.recordId);
    if (remainingIds.length) markForManualDeletion(remainingIds);
    console.error(`Direct deletion stopped after ${deleted} records; marked ${remainingIds.length} remaining records as 待删除-车型详情. Cause: ${error.message}`);
    return { deleted, marked: remainingIds.length };
  }
}

function writeManifest(records, existing) {
  const fields = ["Key", "Module", "ZH", "EN", "AM", "Notes", "Linked Vehicle Model", "Linked vehicle_variants"];
  for (const item of records) {
    const current = existing.get(item.Key);
    if (!current || !item.Key.startsWith("productsDetail.values.")) continue;
    item.linkedModelIds = [...new Set([...item.linkedModelIds, ...linkIds(current.fields["Linked Vehicle Model"])])];
    item.linkedVariantIds = [...new Set([...item.linkedVariantIds, ...linkIds(current.fields["Linked vehicle_variants"])])];
  }
  const values = (item) => [item.Key, item.Module, item.ZH, item.EN, item.AM, item.Notes, item.linkedModelIds.length ? item.linkedModelIds.map((id) => ({ id })) : null, item.linkedVariantIds.length ? item.linkedVariantIds.map((id) => ({ id })) : null];
  const creates = records.filter((item) => !existing.has(item.Key));
  const updates = records.filter((item) => {
    const current = existing.get(item.Key);
    if (!current) return false;
    return text(current.fields.Module) !== item.Module
      || text(current.fields.ZH) !== item.ZH
      || text(current.fields.EN) !== item.EN
      || text(current.fields.AM) !== item.AM
      || text(current.fields.Notes) !== item.Notes
      || !sameLinks(linkIds(current.fields["Linked Vehicle Model"]), item.linkedModelIds)
      || !sameLinks(linkIds(current.fields["Linked vehicle_variants"]), item.linkedVariantIds);
  });
  const desiredKeys = new Set(records.map((item) => item.Key));
  const stale = [...existing.entries()]
    .filter(([key]) => isOwnedKey(key) && !desiredKeys.has(key))
    .map(([key, row]) => ({ key, recordId: row.recordId }))
    .concat(existing.ownedDuplicates);
  let prune = { deleted: 0, marked: 0 };
  if (WRITE) {
    const batches = [];
    let batch = [];
    for (const item of creates) {
      const candidate = [...batch, values(item)];
      if (batch.length && (candidate.length > 100 || JSON.stringify({ fields, rows: candidate }).length > 24000)) {
        batches.push(batch);
        batch = [values(item)];
      } else {
        batch = candidate;
      }
    }
    if (batch.length) batches.push(batch);
    for (const rows of batches) {
      runLark(["base", "+record-batch-create", "--base-token", BASE_TOKEN, "--table-id", I18N_TABLE, "--json", JSON.stringify({ fields, rows }), "--as", "user", "--format", "json"]);
    }
    for (const item of updates) {
      const current = existing.get(item.Key);
      const desired = Object.fromEntries(fields.map((field, index) => [field, values(item)[index]]));
      runLark(["base", "+record-upsert", "--base-token", BASE_TOKEN, "--table-id", I18N_TABLE, "--record-id", current.recordId, "--json", JSON.stringify(desired), "--as", "user", "--format", "json"]);
    }
    if (PRUNE && stale.length) prune = pruneStaleRecords(stale);
  }
  return { creates: creates.length, updates: updates.length, stale: stale.length, ...prune };
}

async function main() {
  if (PRUNE && !WRITE) throw new Error("--prune requires --write");
  const { records, models, variants, sharedValues } = await buildManifest();
  const existing = existingRecords();
  const write = writeManifest(records, existing);
  console.log(JSON.stringify({ mode: WRITE ? "write" : "dry-run", prune: PRUNE, records: records.length, models: models.length, variants: variants.length, sharedUi: sharedDetailTranslations.length, sharedValues, ...write }));
}

main().catch((error) => { console.error(error instanceof Error ? error.stack || error.message : error); process.exitCode = 1; });
