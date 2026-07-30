const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const outDir = path.join(process.cwd(), "tmp", "feishu-model-fill");
const payloadDir = path.join(outDir, "model-payloads");
const patches = JSON.parse(fs.readFileSync(path.join(outDir, "prepared-model-patches.json"), "utf8"));
const resultPath = path.join(outDir, "write-model-results.json");
const baseToken = "Is6Xb3btbazhFhsDXgFcqFG1nRc";
const tableId = "tblxVNjP9dnJ7b3o";
const results = [];

fs.mkdirSync(payloadDir, { recursive: true });

for (const item of patches) {
  const payloadPath = path.join(payloadDir, `${item.record_id}.json`);
  const relativePayloadPath = path.relative(process.cwd(), payloadPath).replace(/\\/g, "/");
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
    `@${relativePayloadPath}`,
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
    model_id: item.model_id,
    brand: item.brand,
    model: item.model,
    patch: item.patch,
    status: res.status,
    stdout: res.stdout ? JSON.parse(res.stdout) : null,
    stderr: res.stderr,
    error: res.error ? String(res.error) : undefined,
  });
  if (res.status !== 0) {
    fs.writeFileSync(resultPath, JSON.stringify(results, null, 2));
    console.error(`Failed writing ${item.record_id}: ${res.stderr || res.stdout || res.error}`);
    process.exit(res.status || 1);
  }
}

fs.writeFileSync(resultPath, JSON.stringify(results, null, 2));
console.log(`Wrote ${results.length} model records. Results: ${resultPath}`);
