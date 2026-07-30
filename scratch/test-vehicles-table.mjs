import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.dev.vars');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    env[trimmed.slice(0, index)] = trimmed.slice(index + 1);
  }
  return env;
}

const env = { ...loadEnv(), ...process.env };
const FEISHU_BASE_TOKEN = env.FEISHU_BASE_APP_TOKEN;
const FEISHU_TABLE_VEHICLES = env.FEISHU_TABLE_VEHICLES;

console.log("Base token:", FEISHU_BASE_TOKEN);
console.log("Vehicles Table ID:", FEISHU_TABLE_VEHICLES);

const command = "lark-cli";
const commandArgs = [
  "base",
  "+record-list",
  "--as",
  "user",
  "--base-token",
  FEISHU_BASE_TOKEN,
  "--table-id",
  FEISHU_TABLE_VEHICLES,
  "--limit",
  "100"
];

try {
  const output = execFileSync(command, commandArgs, { encoding: "utf8" });
  console.log("Raw output:", output);
} catch (err) {
  console.error("Error searching records:", err);
}
