const fs = require("fs");
const { spawnSync } = require("child_process");

const patchesPath = "tmp/feishu-trim-fill/prepared-patches.json";
const resultPath = "tmp/feishu-trim-fill/write-results.json";
const payloadDir = "tmp/feishu-trim-fill/payloads";
const baseToken = "Is6Xb3btbazhFhsDXgFcqFG1nRc";
const tableId = "tbl8YzkZkMxvHRoT";

const patches = JSON.parse(fs.readFileSync(patchesPath, "utf8"));
const results = [];
fs.mkdirSync(payloadDir, { recursive: true });

for (const item of patches) {
  const payloadPath = `${payloadDir}/${item.record_id}.json`;
  fs.writeFileSync(payloadPath, JSON.stringify(item.patch, null, 2));
  const command = [
    "lark-cli",
    "base",
    "+record-upsert",
    "--base-token",
    baseToken,
    "--table-id",
    tableId,
    "--record-id",
    item.record_id,
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
    record_id: item.record_id,
    variant: item.variant,
    status: res.status,
    stdout: res.stdout ? JSON.parse(res.stdout) : null,
    stderr: res.stderr,
    error: res.error ? String(res.error) : undefined,
  });
  if (res.status !== 0) {
    fs.writeFileSync(resultPath, JSON.stringify(results, null, 2));
    console.error(`Failed writing ${item.record_id}: ${res.stderr || res.stdout}`);
    process.exit(res.status || 1);
  }
}

fs.writeFileSync(resultPath, JSON.stringify(results, null, 2));
console.log(`Wrote ${results.length} records. Results: ${resultPath}`);
