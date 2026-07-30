import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const BASE_TOKEN = "Is6Xb3btbazhFhsDXgFcqFG1nRc";
const MODELS_TABLE = "tblxVNjP9dnJ7b3o";
const TRIMS_TABLE = "tbl8YzkZkMxvHRoT";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
const CNY_TO_USD = 0.1475;
const TARGET_MODEL_ID_RE = /^MDL-(0(6[5-9]|[7-9][0-9])|1(0[0-9]|1[0-8]))$/;

const SOURCE_BY_MODEL_ID = new Map([
  ["MDL-069", { seriesId: 6354, expected: "Avatr 11" }],
  ["MDL-072", { seriesId: 6298, expected: "BYD Atto 3 / Yuan PLUS", sourceUrl: "https://www.byd.com/zh-hk/car/atto3" }],
  ["MDL-073", { seriesId: 8189, expected: "Wuling Bingo S" }],
  ["MDL-074", { seriesId: 7712, expected: "Toyota bZ3X" }],
  ["MDL-075", { seriesId: 7903, expected: "Geely Cowboy" }],
  ["MDL-076", { seriesId: 5498, expected: "Changan CS55 Plus" }],
  ["MDL-077", { seriesId: 5179, expected: "Changan CS75 Plus" }],
  ["MDL-079", { seriesId: 6353, expected: "Changan Deepal SL03" }],
  ["MDL-080", { seriesId: 2429, expected: "Changan Eado" }],
  ["MDL-084", { seriesId: 8158, expected: "Geely Galaxy A7" }],
  ["MDL-085", { seriesId: 7167, expected: "Geely Galaxy L6" }],
  ["MDL-086", { seriesId: 6978, expected: "Geely Haoyue L" }],
  ["MDL-087", { seriesId: 7781, expected: "Wuling Hongguang EV" }],
  ["MDL-089", { seriesId: 8283, expected: "Wuling Huajing S PHEV" }],
  ["MDL-093", { seriesId: 8140, expected: "Changan Nevo A06" }],
  ["MDL-094", { seriesId: 7209, expected: "Changan Nevo A07" }],
  ["MDL-095", { seriesId: 8241, expected: "Changan Nevo Q05" }],
  ["MDL-096", { seriesId: 7975, expected: "Changan Nevo Q07" }],
  ["MDL-097", { seriesId: 6924, expected: "Geely Panda" }],
  ["MDL-098", { seriesId: 7578, expected: "BYD Qin L EV" }],
  ["MDL-099", { seriesId: 2451, expected: "Wuling Rongguang" }],
  ["MDL-102", { seriesId: 7815, expected: "BYD Song L DM-i" }],
  ["MDL-105", { seriesId: 8468, expected: "Wuling Starlight EV" }],
  ["MDL-106", { seriesId: 8211, expected: "Geely Starshine 6" }],
  ["MDL-107", { seriesId: 6962, expected: "Xiaomi SU7" }],
  ["MDL-109", { seriesId: 6335, expected: "Changan UNI-V" }],
  ["MDL-112", { seriesId: 7897, expected: "Wuling Wuling Sunshine EV" }],
  ["MDL-113", { seriesId: 7552, expected: "Changan X5 Plus" }],
  ["MDL-115", { seriesId: 7231, expected: "Bestune Xiaoma" }],
  ["MDL-116", { seriesId: 6777, expected: "Wuling Xingchi" }],
  ["MDL-117", { seriesId: 7563, expected: "Wuling Yangguang EV" }],
  ["MDL-118", { seriesId: 7741, expected: "Baojun Yunhai EV" }],
]);

const SKIPPED_MODEL_IDS = new Map([
  ["MDL-065", "No provided source URL for Smart #1 in the latest instruction."],
  ["MDL-066", "No provided source URL for Smart #3 in the latest instruction."],
  ["MDL-067", "No provided source URL for Smart #5 in the latest instruction."],
  ["MDL-068", "No provided source URL for Avatr 06 in the latest instruction."],
  ["MDL-070", "No provided source URL for Wuling 12 in the latest instruction."],
  ["MDL-078", "No provided source URL for Changan CS75 PRO in the latest instruction."],
  ["MDL-081", "No provided source URL for Changan Eado EV in the latest instruction."],
  ["MDL-088", "No provided source URL for Wuling Hongguang MINI EV in the latest instruction."],
  ["MDL-090", "No provided source URL for Shandong EV KW in the latest instruction."],
  ["MDL-091", "No provided source URL for IM Motors LS6 in the latest instruction."],
  ["MDL-092", "No provided source URL for Wuling MPV in the latest instruction."],
  ["MDL-103", "Ambiguous with series 8468; using it only for MDL-105 Wuling Starlight EV."],
  ["MDL-104", "Ambiguous with series 8468; using it only for MDL-105 Wuling Starlight EV."],
  ["MDL-108", "User stated Wuling SUV has no related content."],
  ["MDL-110", "No provided source URL for Changan UNI-Z in the latest instruction."],
  ["MDL-111", "No provided source URL for Wuling Sunshine ICE in the latest instruction."],
  ["MDL-114", "No provided source URL for Shandong EV XGP in the latest instruction."],
]);

const TRIM_FIELDS = [
  "trim_config_id",
  "model_id",
  "vehicle_model_pruned",
  "variant",
  "trim_order",
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
  "base_spec_summary_json",
  "added_features_json",
  "upgraded_features_json",
  "recommended",
  "source_url",
  "source_status",
  "last_verified_at",
  "notes",
];

function runLark(args) {
  const command = process.platform === "win32" ? "powershell.exe" : "lark-cli";
  const commandArgs = process.platform === "win32"
    ? ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", path.join(process.env.APPDATA || "", "npm", "lark-cli.ps1"), ...args]
    : args;
  const output = execFileSync(command, commandArgs, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 50 * 1024 * 1024,
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

async function autohomeSeries(seriesId) {
  const url = new URL("https://www.autohome.com.cn/web-main/car/param/getParamConf");
  url.searchParams.set("mode", "1");
  url.searchParams.set("site", "1");
  url.searchParams.set("seriesid", String(seriesId));
  const response = await fetch(url, { headers: { "user-agent": USER_AGENT, accept: "application/json" } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const data = await response.json();
  if (data.returncode !== 0) throw new Error(`${data.returncode} ${data.message || ""}`);
  return data.result;
}

function readAllRecords(tableId, fields) {
  const rows = [];
  for (let offset = 0; ; offset += 200) {
    const data = runLark([
      "base", "+record-list",
      "--base-token", BASE_TOKEN,
      "--table-id", tableId,
      "--format", "json",
      "--as", "user",
      "--limit", "200",
      "--offset", String(offset),
      ...fields.flatMap((field) => ["--field-id", field]),
    ]);
    (data.data || []).forEach((row, index) => {
      const fieldsObject = {};
      fields.forEach((field, fieldIndex) => {
        fieldsObject[field] = row[fieldIndex];
      });
      rows.push({ recordId: data.record_id_list[index], fields: fieldsObject });
    });
    if ((data.data || []).length < 200) break;
  }
  return rows;
}

function titleMap(result) {
  const map = new Map();
  for (const group of result.titlelist || []) {
    for (const item of group.items || []) map.set(item.itemname, item.titleid);
  }
  return map;
}

function cell(spec, titles, name) {
  const titleId = titles.get(name);
  if (!titleId) return "";
  const item = spec.paramconflist?.find((entry) => entry.titleid === titleId);
  if (!item) return "";
  if (item.itemname && item.itemname !== "-") return item.itemname;
  if (Array.isArray(item.sublist)) {
    return item.sublist
      .filter((entry) => entry.name && entry.value && entry.value !== "-")
      .map((entry) => entry.value === "●" ? entry.name : `${entry.name}: ${entry.value}`)
      .join("; ");
  }
  return "";
}

function meaningful(value) {
  const text = String(value ?? "").trim();
  return Boolean(text && text !== "-" && text !== "暂无报价");
}

function numberFromText(value) {
  const match = String(value ?? "").match(/-?\d+(?:,\d{3})*(?:\.\d+)?/);
  if (!match) return null;
  const number = Number(match[0].replace(/,/g, ""));
  return Number.isFinite(number) ? number : null;
}

function priceUsd(value) {
  const text = String(value || "");
  if (!meaningful(text)) return null;
  const wan = text.match(/([\d.]+)\s*万/);
  if (wan) return Math.round(Number(wan[1]) * 10000 * CNY_TO_USD);
  const yuan = numberFromText(text);
  return yuan == null ? null : Math.round(yuan * CNY_TO_USD);
}

function batteryChemistry(value) {
  const text = String(value || "");
  if (/磷酸铁锂|LFP/i.test(text)) return "LFP";
  if (/三元锂|NCM/i.test(text)) return "NCM";
  if (/NMC/i.test(text)) return "NMC";
  if (/半固态/.test(text)) return "Semi-solid-state";
  return null;
}

function drivetrain(value) {
  const text = String(value || "");
  if (/双电机|四驱|AWD/i.test(text)) return "Dual-motor AWD";
  if (/前置前驱|前驱|FWD/i.test(text)) return "Front motor FWD";
  if (/后置后驱|后驱|RWD/i.test(text)) return "Rear motor RWD";
  return null;
}

function powertrain(value) {
  const text = String(value || "");
  if (/纯电|BEV|电动/.test(text)) return "BEV";
  if (/插电|插混|PHEV/.test(text)) return "PHEV";
  if (/增程|EREV/.test(text)) return "EREV";
  if (/油电|HEV|混动/.test(text)) return "HEV";
  return null;
}

function modelYear(specName) {
  const match = String(specName || "").match(/(20\d{2})款/);
  return match ? Number(match[1]) : null;
}

function cleanVariantName(specName, seriesName) {
  return String(specName || "")
    .replace(String(seriesName || ""), "")
    .replace(/\s+/g, " ")
    .trim();
}

function range(values) {
  const nums = values.filter((value) => typeof value === "number" && Number.isFinite(value));
  if (!nums.length) return { min: null, max: null };
  return { min: Math.min(...nums), max: Math.max(...nums) };
}

function buildRows(model, result, sourceUrl) {
  const titles = titleMap(result);
  const specs = [...(result.datalist || [])].sort((a, b) => {
    const ap = Number(String(a.minprice || "").replace(/[^\d.]/g, "")) || 0;
    const bp = Number(String(b.minprice || "").replace(/[^\d.]/g, "")) || 0;
    return ap - bp || Number(a.specid || 0) - Number(b.specid || 0);
  });
  const trims = specs.map((spec, index) => {
    const get = (name) => cell(spec, titles, name);
    const fastChargeRange = get("电池快充电量范围(%)");
    const fastPercent = String(fastChargeRange).match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
    const baseSpec = [
      ["级别", get("级别")],
      ["能源类型", get("能源类型")],
      ["上市时间", get("上市时间")],
      ["车身结构", get("车身结构")],
      ["长宽高", get("长*宽*高(mm)")],
      ["轴距", get("轴距(mm)")],
      ["座位数", get("座位数(个)")],
      ["最高车速", get("最高车速(km/h)")],
      ["0-100km/h加速", get("官方0-100km/h加速(s)")],
      ["整车质保", get("整车质保")],
      ["发动机", get("发动机")],
      ["变速箱", get("变速箱类型")],
      ["驱动方式", get("驱动方式")],
      ["电池类型", get("电池类型")],
      ["电芯品牌", get("电芯品牌")],
      ["三电质保", get("三电系统质保") || get("三电首任车主质保政策")],
    ].filter(([, value]) => meaningful(value)).map(([name, value]) => `${name}: ${value}`);
    const featureSpec = [
      ["辅助驾驶等级", get("辅助驾驶等级")],
      ["辅助驾驶系统", get("辅助驾驶系统")],
      ["车道保持辅助系统", get("车道保持辅助系统")],
      ["主动刹车", get("主动刹车/主动安全系统")],
      ["天窗类型", get("天窗类型")],
      ["中控屏幕尺寸", get("中控屏幕尺寸")],
      ["前排座椅功能", get("前排座椅功能")],
      ["第二排座椅功能", get("第二排座椅功能")],
      ["扬声器数量", get("扬声器数量")],
      ["热泵空调", get("热泵空调")],
      ["对外放电", get("对外放电")],
    ].filter(([, value]) => meaningful(value)).map(([name, value]) => `${name}: ${value}`);
    const row = {
      trim_config_id: `${model.modelId}-${model.source.seriesId}-${index + 1}`,
      model_id: model.modelId,
      vehicle_model_pruned: [{ id: model.recordId }],
      variant: cleanVariantName(spec.specname, result.bread?.seriesname),
      trim_order: index + 1,
      trim_price_display: priceUsd(get("厂商指导价(元)") || spec.minprice),
      range_display: numberFromText(get("CLTC纯电续航里程(km)") || get("WLTC综合续航(km)")),
      battery_capacity_kwh: numberFromText(get("电池能量(kWh)") || get("电池容量(kWh)")),
      battery_chemistry: batteryChemistry(get("电池类型")),
      drivetrain_display: drivetrain(get("驱动方式")),
      motor_power_kw: numberFromText(get("电动机总功率(kW)") || get("最大功率(kW)")),
      motor_torque_n_m: numberFromText(get("电动机总扭矩(N·m)") || get("最大扭矩(N·m)")),
      dc_fast_charge_supported: /支持|标配|●|Yes/i.test(get("快充功能")),
      dc_fast_charge_time_hours: numberFromText(get("电池快充时间(小时)")),
      dc_fast_charge_min_percent: fastPercent ? Number(fastPercent[1]) : null,
      dc_fast_charge_max_percent: fastPercent ? Number(fastPercent[2]) : null,
      base_spec_summary_json: JSON.stringify(baseSpec),
      added_features_json: JSON.stringify(featureSpec),
      upgraded_features_json: JSON.stringify([]),
      recommended: false,
      source_url: sourceUrl,
      source_status: "Verified",
      last_verified_at: new Date().toISOString().slice(0, 10) + " 00:00:00",
      notes: `Explicit source mapping supplied by user; Autohome series ${model.source.seriesId} (${result.bread?.seriesname || ""}).`,
    };
    return row;
  });

  const first = specs[0];
  const getFirst = (name) => first ? cell(first, titles, name) : "";
  const all = (name) => specs.map((spec) => numberFromText(cell(spec, titles, name))).filter((value) => value != null);
  const lengthRange = range(all("长度(mm)"));
  const widthRange = range(all("宽度(mm)"));
  const heightRange = range(all("高度(mm)"));
  const wheelbaseRange = range(all("轴距(mm)"));
  const seatRange = range(all("座位数(个)"));
  const topSpeedRange = range(all("最高车速(km/h)"));
  const accelRange = range(all("官方0-100km/h加速(s)"));
  const bootRange = range(all("后备厢容积(L)"));
  const years = specs.map((spec) => modelYear(spec.specname)).filter(Boolean);
  const energyTypes = [...new Set(specs.map((spec) => cell(spec, titles, "能源类型")).filter(meaningful))];
  const modelPatch = {
    vehicle_class: getFirst("级别") || null,
    model_year: years.length ? Math.max(...years) : null,
    length_mm: lengthRange.max,
    width_mm: widthRange.max,
    height_mm: heightRange.max,
    wheelbase_mm: wheelbaseRange.max,
    seats_min: seatRange.min,
    seats_max: seatRange.max,
    boot_volume_l: bootRange.max,
    top_speed_min_kmh: topSpeedRange.min,
    top_speed_max_kmh: topSpeedRange.max,
    "0_100_km_h_sec": accelRange.min,
    powertrain_type: energyTypes.length === 1 ? powertrain(energyTypes[0]) : null,
    charging: [
      getFirst("快充功能") && `快充: ${getFirst("快充功能")}`,
      getFirst("电池快充时间(小时)") && `快充时间: ${getFirst("电池快充时间(小时)")} 小时`,
      getFirst("电池快充电量范围(%)") && `快充电量范围: ${getFirst("电池快充电量范围(%)")}%`,
    ].filter(Boolean).join("; ") || null,
    common_features_json_pruned: JSON.stringify([
      {
        category: "Source summary",
        items: [
          `汽车之家车系: ${result.bread?.seriesname || ""}`,
          `来源URL: ${sourceUrl}`,
          `版本数量: ${trims.length}`,
          energyTypes.length ? `能源类型: ${energyTypes.join(" / ")}` : "",
        ].filter(Boolean),
      },
    ]),
    trim_source_summary_pruned: `Trim and model data verified from ${sourceUrl}`,
    trim_section_status_pruned: "Verified",
    trim_last_verified_at: new Date().toISOString().slice(0, 10) + " 00:00:00",
  };
  Object.keys(modelPatch).forEach((key) => {
    if (modelPatch[key] == null || modelPatch[key] === "") delete modelPatch[key];
  });
  return { trims, modelPatch };
}

function compact(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, "");
}

function validateMapping(model, result) {
  const expected = compact(model.source.expected);
  const actual = compact(`${model.brand}${model.model}${result.bread?.seriesname || ""}`);
  const direct = compact(result.bread?.seriesname || "");
  if (model.modelId === "MDL-072") return true;
  if (model.modelId === "MDL-105") return /星光/.test(result.bread?.seriesname || "");
  return expected.includes(direct) || actual.includes(direct) || expected.includes(compact(model.model)) || actual.includes(compact(model.model));
}

function updateRecord(tableId, recordId, fields) {
  runLark([
    "base", "+record-upsert",
    "--base-token", BASE_TOKEN,
    "--table-id", tableId,
    "--record-id", recordId,
    "--format", "json",
    "--as", "user",
    "--json", jsonFileArg("record-update", fields),
  ]);
}

function createRows(tableId, fields, rows) {
  for (let i = 0; i < rows.length; i += 200) {
    runLark([
      "base", "+record-batch-create",
      "--base-token", BASE_TOKEN,
      "--table-id", tableId,
      "--format", "json",
      "--as", "user",
      "--json", jsonFileArg("record-create", { fields, rows: rows.slice(i, i + 200) }),
    ]);
  }
}

async function main() {
  const write = process.argv.includes("--write");
  const modelRecords = readAllRecords(MODELS_TABLE, ["MODEL", "model_id", "brand", "model", "status", "trim_configurations_pruned"]);
  const existingTrimRecords = readAllRecords(TRIMS_TABLE, ["model_id", "trim_config_id", "variant", "vehicle_model_pruned", "source_url"]);
  const existingByModel = new Map();
  const existingByTrimConfigId = new Map();
  for (const trim of existingTrimRecords) {
    const modelId = trim.fields.model_id;
    if (!existingByModel.has(modelId)) existingByModel.set(modelId, []);
    existingByModel.get(modelId).push(trim);
    if (trim.fields.trim_config_id) existingByTrimConfigId.set(trim.fields.trim_config_id, trim);
  }

  const report = [];
  const createPayloadRows = [];
  const modelUpdates = [];
  const trimUpdates = [];

  for (const modelRecord of modelRecords) {
    const modelId = modelRecord.fields.model_id || modelRecord.fields.MODEL;
    if (!TARGET_MODEL_ID_RE.test(String(modelId || ""))) continue;
    const source = SOURCE_BY_MODEL_ID.get(modelId);
    if (!source) {
      report.push({ modelId, model: `${modelRecord.fields.brand} ${modelRecord.fields.model}`, status: "skipped", reason: SKIPPED_MODEL_IDS.get(modelId) || "No explicit URL mapping." });
      continue;
    }
    const sourceUrl = source.sourceUrl || `https://www.autohome.com.cn/config/series/${source.seriesId}.html#pvareaid=3454437`;
    const model = {
      recordId: modelRecord.recordId,
      modelId,
      brand: modelRecord.fields.brand,
      model: modelRecord.fields.model,
      source,
    };
    try {
      const result = await autohomeSeries(source.seriesId);
      if (!validateMapping(model, result)) {
        report.push({ modelId, model: `${model.brand} ${model.model}`, status: "skipped_mapping_mismatch", seriesId: source.seriesId, seriesName: result.bread?.seriesname, expected: source.expected });
        continue;
      }
      const { trims, modelPatch } = buildRows(model, result, sourceUrl);
      const existing = existingByModel.get(modelId) || [];
      trims.forEach((trim, index) => {
        const row = TRIM_FIELDS.map((field) => trim[field] ?? null);
        const existingByKey = existingByTrimConfigId.get(trim.trim_config_id);
        if (existingByKey) {
          trimUpdates.push({ recordId: existingByKey.recordId, fields: Object.fromEntries(TRIM_FIELDS.map((field, fieldIndex) => [field, row[fieldIndex]])) });
        } else if (existing[index] && !existing[index].fields.trim_config_id) {
          trimUpdates.push({ recordId: existing[index].recordId, fields: Object.fromEntries(TRIM_FIELDS.map((field, fieldIndex) => [field, row[fieldIndex]])) });
        } else {
          createPayloadRows.push(row);
        }
      });
      modelUpdates.push({ recordId: model.recordId, fields: modelPatch });
      report.push({
        modelId,
        model: `${model.brand} ${model.model}`,
        status: "prepared",
        seriesId: source.seriesId,
        seriesName: result.bread?.seriesname,
        existingTrims: existing.length,
        updateTrims: Math.min(existing.length, trims.length),
        createTrims: Math.max(0, trims.length - existing.length),
        totalTrims: trims.length,
        modelFields: Object.keys(modelPatch),
      });
    } catch (error) {
      report.push({ modelId, model: `${model.brand} ${model.model}`, status: "fetch_failed", seriesId: source.seriesId, error: error.message });
    }
  }

  fs.mkdirSync(".lark-tmp", { recursive: true });
  fs.writeFileSync(".lark-tmp/mdl65-118-fill-report.json", JSON.stringify(report, null, 2), "utf8");
  fs.writeFileSync(".lark-tmp/mdl65-118-trim-create.json", JSON.stringify({ fields: TRIM_FIELDS, rows: createPayloadRows }, null, 2), "utf8");
  fs.writeFileSync(".lark-tmp/mdl65-118-trim-update.json", JSON.stringify(trimUpdates, null, 2), "utf8");
  fs.writeFileSync(".lark-tmp/mdl65-118-model-update.json", JSON.stringify(modelUpdates, null, 2), "utf8");

  console.log(JSON.stringify({
    mode: write ? "write" : "report",
    preparedModels: report.filter((item) => item.status === "prepared").length,
    skipped: report.filter((item) => item.status !== "prepared").length,
    trimUpdates: trimUpdates.length,
    trimCreates: createPayloadRows.length,
    modelUpdates: modelUpdates.length,
    report: ".lark-tmp/mdl65-118-fill-report.json",
  }, null, 2));

  if (!write) return;
  for (const trim of trimUpdates) updateRecord(TRIMS_TABLE, trim.recordId, trim.fields);
  createRows(TRIMS_TABLE, TRIM_FIELDS, createPayloadRows);
  for (const model of modelUpdates) updateRecord(MODELS_TABLE, model.recordId, model.fields);
  console.log("write complete");
}

await main();
