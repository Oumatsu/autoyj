const fs = require("fs");
const { spawnSync } = require("child_process");

const beforePath = "tmp/feishu-trim-fill/raw-records-before-write.json";
const patchesPath = "tmp/feishu-trim-fill/prepared-patches.json";
const payloadDir = "tmp/feishu-trim-fill/restore-payloads";
const resultPath = "tmp/feishu-trim-fill/restore-nonmissing-results.json";
const baseToken = "Is6Xb3btbazhFhsDXgFcqFG1nRc";
const tableId = "tbl8YzkZkMxvHRoT";

const before = JSON.parse(fs.readFileSync(beforePath, "utf8"));
const ids = JSON.parse(fs.readFileSync(patchesPath, "utf8")).map((item) => item.record_id);
const beforeById = new Map(before.map((record) => [record.record_id, record.fields || {}]));
const results = [];
fs.mkdirSync(payloadDir, { recursive: true });

for (const recordId of ids) {
  const fields = beforeById.get(recordId);
  if (!fields) throw new Error(`Missing before record: ${recordId}`);
  const patch = {
    source_status: fields.source_status,
    notes: fields.notes,
  };
  const payloadPath = `${payloadDir}/${recordId}.json`;
  fs.writeFileSync(payloadPath, JSON.stringify(patch, null, 2));
  const command = [
    "lark-cli",
    "base",
    "+record-upsert",
    "--base-token",
    baseToken,
    "--table-id",
    tableId,
    "--record-id",
    recordId,
    "--json",
    `@${payloadPath}`,
    "--as",
    "user",
    "--format",
    "json",
  ].join(" ");
  const res = spawnSync(command, {
    encoding: "utf8",
    shell: true,
    windowsHide: true,
  });
  results.push({
    record_id: recordId,
    status: res.status,
    stdout: res.stdout ? JSON.parse(res.stdout) : null,
    stderr: res.stderr,
    error: res.error ? String(res.error) : undefined,
  });
  if (res.status !== 0) {
    fs.writeFileSync(resultPath, JSON.stringify(results, null, 2));
    console.error(`Failed restoring ${recordId}: ${res.stderr || res.stdout || res.error}`);
    process.exit(res.status || 1);
  }
}

fs.writeFileSync(resultPath, JSON.stringify(results, null, 2));
console.log(`Restored ${results.length} records. Results: ${resultPath}`);
