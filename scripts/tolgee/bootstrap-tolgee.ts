#!/usr/bin/env bun
/**
 * bootstrap-tolgee.ts
 *
 * One-time script: push all keys from local JSON files into a fresh Tolgee server.
 * Run ONCE after Tolgee is first deployed. After this, Tolgee is the sole source of truth.
 *
 * Usage:
 *   TOLGEE_API_URL=http://152.32.175.18:8080 \
 *   TOLGEE_API_KEY=<pat-or-project-key> \
 *   TOLGEE_PROJECT_ID=<id> \
 *   bun scripts/tolgee/bootstrap-tolgee.ts
 */

import zh from "../../i18n/translations/zh.json";
import en from "../../i18n/translations/en.json";
import am from "../../i18n/translations/am.json";

const API_URL = process.env.TOLGEE_API_URL?.replace(/\/$/, "") ?? "";
const API_KEY = process.env.TOLGEE_API_KEY ?? "";
const PROJECT_ID = Number(process.env.TOLGEE_PROJECT_ID ?? "0");

if (!API_URL || !API_KEY || !PROJECT_ID) {
  console.error(
    "Missing env vars: TOLGEE_API_URL, TOLGEE_API_KEY, TOLGEE_PROJECT_ID"
  );
  process.exit(1);
}

// ──────────────────────────────────────────────
// Flatten nested JSON → "dot.notation": "value"
// ──────────────────────────────────────────────
type Obj = Record<string, unknown>;

function flatten(obj: Obj, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(out, flatten(v as Obj, full));
    } else if (Array.isArray(v)) {
      v.forEach((item, idx) => {
        const idxKey = `${full}.${idx}`;
        if (item !== null && typeof item === "object") {
          Object.assign(out, flatten(item as Obj, idxKey));
        } else {
          out[idxKey] = String(item ?? "");
        }
      });
    } else {
      out[full] = String(v ?? "");
    }
  }
  return out;
}

// ──────────────────────────────────────────────
// Tolgee REST helpers
// ──────────────────────────────────────────────
async function tolgeePost(path: string, body: unknown) {
  const res = await fetch(`${API_URL}/v2${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

async function tolgeePut(path: string, body: unknown) {
  const res = await fetch(`${API_URL}/v2${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PUT ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────
const localeMap: Record<string, Record<string, string>> = {
  zh: flatten(zh as Obj),
  en: flatten(en as Obj),
  am: flatten(am as Obj),
};

const allKeys = Object.keys(localeMap.zh);
console.log(`Found ${allKeys.length} keys. Starting import…\n`);

const BATCH = 50; // Tolgee import-keys endpoint accepts up to ~200 at a time
let created = 0;
let failed = 0;

for (let i = 0; i < allKeys.length; i += BATCH) {
  const batch = allKeys.slice(i, i + BATCH);

  // Build the import payload: create keys + translations in one call
  const keys = batch.map((keyName) => ({
    name: keyName,
    translations: {
      zh: localeMap.zh[keyName] ?? "",
      en: localeMap.en[keyName] ?? "",
      am: localeMap.am[keyName] ?? "",
    },
  }));

  try {
    await tolgeePost(`/projects/${PROJECT_ID}/keys/import`, { keys });
    created += batch.length;
    process.stdout.write(`\r  Imported ${created}/${allKeys.length} keys…`);
  } catch (err) {
    console.error(`\n  Batch ${i}–${i + BATCH} failed:`, err);
    failed += batch.length;
  }
}

console.log(`\n\nDone. ${created} keys imported, ${failed} failed.`);
if (failed > 0) process.exit(1);
