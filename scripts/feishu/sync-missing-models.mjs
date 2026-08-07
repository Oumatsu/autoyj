import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';

const BASE_TOKEN = 'Is6Xb3btbazhFhsDXgFcqFG1nRc';
const AUDIT_TABLE = 'tblte61W3fKoXmSw';  // 车源审核页
const MODELS_TABLE = 'tblxVNjP9dnJ7b3o'; // vehicle_models

function runLarkCli(args) {
  const platform = process.platform;
  const command = platform === 'win32' ? 'powershell.exe' : (process.env.LARK_CLI_BIN || 'lark-cli');
  const commandArgs = platform === 'win32'
    ? ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File',
       process.env.LARK_CLI_BIN || resolve(process.env.APPDATA || '', 'npm', 'lark-cli.ps1'),
       ...args]
    : args;
  const output = execFileSync(command, commandArgs, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 50 * 1024 * 1024,
  });
  const start = output.indexOf('{');
  const end = output.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error(`Non-JSON output:\n${output}`);
  return JSON.parse(output.slice(start, end + 1));
}

async function getAllRecords(tableId) {
  let allRecords = [];
  let offset = 0;
  let hasMore = true;
  while (hasMore) {
    const res = runLarkCli([
      'base', '+record-list', '--as', 'user',
      '--base-token', BASE_TOKEN,
      '--table-id', tableId,
      '--limit', '100',
      '--offset', String(offset),
      '--format', 'json',
    ]);
    const data = res.data || {};
    const fields = data.fields || [];
    const rows = data.data || [];
    const recordIds = data.record_id_list || [];

    for (let i = 0; i < rows.length; i++) {
      const record = { record_id: recordIds[i] };
      for (let j = 0; j < fields.length; j++) {
        record[fields[j]] = rows[i][j];
      }
      allRecords.push(record);
    }
    hasMore = data.has_more || false;
    offset += 100;
    console.log(`  已读取 ${allRecords.length} 条记录...`);
  }
  return allRecords;
}

async function createRecord(tableId, fields) {
  const tmpDir = '.lark-tmp';
  if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });
  const fileName = `upsert-${Date.now()}-${Math.random().toString(36).slice(2)}.json`;
  const tmpFile = `${tmpDir}/${fileName}`;
  writeFileSync(tmpFile, JSON.stringify(fields), 'utf8');
  const result = runLarkCli([
    'base', '+record-upsert', '--as', 'user',
    '--base-token', BASE_TOKEN,
    '--table-id', tableId,
    '--json', `@./${tmpFile.replace(/\\/g, '/')}`,
  ]);
  return result;
}

async function main() {
  console.log('=== 步骤1: 读取车源审核页 ===');
  const auditRecords = await getAllRecords(AUDIT_TABLE);
  console.log(`车源审核页共 ${auditRecords.length} 条记录\n`);

  // Extract unique (model_id, 品牌, 型号) combinations from audit table
  // 车源审核页: model_id = "model_id", 品牌 = "品牌", 型号 = "型号"
  const auditModels = new Map();
  for (const rec of auditRecords) {
    const modelId = (rec['model_id'] || '').toString().trim();
    const brand = (rec['品牌'] || '').toString().trim();
    const modelName = (rec['型号'] || '').toString().trim();
    if (!modelId || modelId === '未识别') continue;
    const key = modelId;
    if (!auditModels.has(key)) {
      auditModels.set(key, { modelId, brand, modelName });
    }
  }
  console.log(`车源审核页去重后共 ${auditModels.size} 个唯一 model_id\n`);

  console.log('=== 步骤2: 读取 vehicle_models ===');
  const modelRecords = await getAllRecords(MODELS_TABLE);
  console.log(`vehicle_models 共 ${modelRecords.length} 条记录\n`);

  // Extract existing MODEL identifiers from vehicle_models
  // vehicle_models: MODEL = "MODEL"
  const existingModelIds = new Set();
  for (const rec of modelRecords) {
    const modelId = (rec['MODEL'] || '').toString().trim();
    if (modelId) existingModelIds.add(modelId);
  }
  console.log(`vehicle_models 去重后共 ${existingModelIds.size} 个 MODEL\n`);

  // Find difference
  console.log('=== 步骤3: 对比差集 ===');
  const missing = [];
  for (const [modelId, info] of auditModels) {
    if (!existingModelIds.has(modelId)) {
      missing.push(info);
    }
  }
  console.log(`需要新增 ${missing.length} 个车型:\n`);
  missing.forEach((m, i) => {
    console.log(`  ${i + 1}. ${m.modelId} - ${m.brand} ${m.modelName}`);
  });

  if (missing.length === 0) {
    console.log('\n无需新增任何车型。');
    return;
  }

  console.log('\n=== 步骤4: 添加占位记录到 vehicle_models ===');
  let success = 0;
  let failed = 0;

  for (const m of missing) {
    try {
      const fields = {
        MODEL: m.modelId,
        brand: m.brand || '',
        model: m.modelName || '',
        status: 'Inactive',
      };
      await createRecord(MODELS_TABLE, fields);
      success++;
      console.log(`  OK  ${m.modelId} (${m.brand} ${m.modelName})`);
    } catch (err) {
      failed++;
      console.error(`  FAIL ${m.modelId}: ${err.message}`);
    }
  }

  console.log(`\n完成: 成功 ${success}, 失败 ${failed}`);
}

main().catch(err => {
  console.error('脚本错误:', err);
  process.exit(1);
});
