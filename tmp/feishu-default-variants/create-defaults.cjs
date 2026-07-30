const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const baseToken = "Is6Xb3btbazhFhsDXgFcqFG1nRc";
const modelTableId = "tblxVNjP9dnJ7b3o";
const variantTableId = "tbl8YzkZkMxvHRoT";
const outDir = path.resolve("tmp/feishu-default-variants");
fs.mkdirSync(outDir, { recursive: true });

// Only one model-level reference row per explicitly supplied source URL.
// These are not a full trim catalogue.
const targets = [
  ["MDL-075", "7903"], // Geely Cowboy
  ["MDL-069", "6354"], // Avatr 11
  ["MDL-072", "BYD Atto 3"],
  ["MDL-073", "8189"], // Wuling Bingo S
  ["MDL-076", "5498"], // Changan CS55 Plus
  ["MDL-077", "5179"], // Changan CS75 Plus
  ["MDL-079", "6353"], // Deepal SL03
  ["MDL-080", "2429"], // Changan Eado
  ["MDL-084", "8158"], // Geely Galaxy A7
  ["MDL-085", "7167"], // Geely Galaxy L6
  ["MDL-086", "6978"], // Geely Haoyue L
  ["MDL-087", "7781"], // Wuling Hongguang EV
  ["MDL-089", "8283"], // Wuling Huajing S PHEV
  ["MDL-093", "8140"], // Changan Nevo A06
  ["MDL-094", "7209"], // Changan Nevo A07
  ["MDL-095", "8241"], // Changan Nevo Q05
  ["MDL-096", "7975"], // Changan Nevo Q07
  ["MDL-097", "6924"], // Geely Panda
  ["MDL-098", "7578"], // BYD Qin L EV
  ["MDL-099", "2451"], // Wuling Rongguang
  ["MDL-102", "7815"], // BYD Song L DM-i
  ["MDL-103", "8468"], // Wuling Starlight family placeholder
  ["MDL-106", "8211"], // Geely Starshine 6
  ["MDL-109", "6335"], // Changan UNI-V
  ["MDL-112", "7897"], // Wuling Sunshine EV
  ["MDL-113", "7552"], // Changan X5 Plus
  ["MDL-115", "7231"], // Bestune Xiaoma
  ["MDL-116", "6777"], // Wuling Xingchi
  ["MDL-117", "7563"], // Wuling Yangguang EV
  ["MDL-118", "7741"], // Baojun Yunhai EV
];

const models = JSON.parse(fs.readFileSync("tmp/feishu-model-fill/models-records.json", "utf8"));
const variants = JSON.parse(fs.readFileSync("tmp/feishu-model-fill/variants-records.json", "utf8"));
const modelById = new Map(models.map((record) => [record.fields.model_id, record]));
const existingTrimIds = new Set(variants.map((record) => record.fields.trim_config_id).filter(Boolean));
// MDL-075 was created before the first run hit a response-shape error.
existingTrimIds.add("MDL-075-DEFAULT");

function run(command) {
  const result = spawnSync(command, { encoding: "utf8", shell: true, windowsHide: true });
  if (result.status !== 0) throw new Error(`${command}\n${result.stderr || result.stdout || result.error}`);
  return JSON.parse(result.stdout);
}

function writePayload(name, payload) {
  const file = path.join(outDir, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(payload, null, 2));
  return path.relative(process.cwd(), file).replace(/\\/g, "/");
}

const results = [];
for (const [modelId, source] of targets) {
  const model = modelById.get(modelId);
  if (!model) {
    results.push({ model_id: modelId, skipped: "model_not_found" });
    continue;
  }

  const trimConfigId = `${modelId}-DEFAULT`;
  if (existingTrimIds.has(trimConfigId)) {
    results.push({ model_id: modelId, skipped: "default_already_exists", trim_config_id: trimConfigId });
    continue;
  }

  const sourceUrl = source.startsWith("http")
    ? source
    : source === "BYD Atto 3"
      ? "https://www.byd.com/zh-hk/car/atto3"
      : `https://www.autohome.com.cn/config/series/${source}.html#pvareaid=3454437`;
  const payload = {
    variant: "Default reference version",
    trim_config_id: trimConfigId,
    model_id: modelId,
    trim_order: 1,
    recommended: false,
    source_url: sourceUrl,
    source_status: "Needs Source",
    last_verified_at: "2026-07-30 00:00:00",
    notes: "Model-level reference placeholder only; not a full trim list.",
    vehicle_model_pruned: [{ id: model.record_id }],
  };

  const payloadFile = writePayload(`create-${modelId}`, payload);
  const create = run(`lark-cli base +record-upsert --base-token ${baseToken} --table-id ${variantTableId} --json @"${payloadFile}" --as user --format json`);
  const createdRecordId = create?.data?.record?.record_id || create?.data?.record?.record_id_list?.[0] || create?.record?.record_id;
  if (!createdRecordId) throw new Error(`create did not return record id for ${modelId}: ${JSON.stringify(create)}`);

  const recordIdFile = writePayload(`record-id-${modelId}`, { record_id: createdRecordId });
  const recordIdWrite = run(`lark-cli base +record-upsert --base-token ${baseToken} --table-id ${variantTableId} --record-id ${createdRecordId} --json @"${recordIdFile}" --as user --format json`);
  existingTrimIds.add(trimConfigId);
  results.push({ model_id: modelId, model_record_id: model.record_id, created_record_id: createdRecordId, payload, create, recordIdWrite });
}

fs.writeFileSync(path.join(outDir, "results.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify({ requested: targets.length, created: results.filter((r) => r.created_record_id).length, skipped: results.filter((r) => r.skipped).length, output: path.join(outDir, "results.json") }, null, 2));
