import fs from "node:fs";
import path from "node:path";
import zh from "../i18n/translations/zh";
import en from "../i18n/translations/en";
import am from "../i18n/translations/am";

// Load .dev.vars if process.env values are missing
if (!process.env.TOLGEE_API_KEY && fs.existsSync(".dev.vars")) {
  const devVars = fs.readFileSync(".dev.vars", "utf-8");
  for (const line of devVars.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        if (!process.env[k]) process.env[k] = v;
      }
    }
  }
}

const apiUrl = process.env.TOLGEE_API_URL || process.env.NEXT_PUBLIC_TOLGEE_API_URL || "http://localhost:8085";
const apiKey = process.env.TOLGEE_API_KEY || process.env.NEXT_PUBLIC_TOLGEE_API_KEY;

/**
 * Flatten a nested object to dot-notation key-value pairs.
 * Arrays are treated as objects with numeric string keys (0, 1, 2…),
 * which matches the resolveTranslationValue() logic in translationFallback.ts.
 *
 * This guarantees Tolgee stores keys as "home.process.steps.0.title"
 * not "home.process.steps[0].title", avoiding the bracket-notation mismatch.
 */
function flattenToDot(
  obj: Record<string, unknown>,
  prefix = ""
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) {
      result[fullKey] = "";
    } else if (typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenToDot(value as Record<string, unknown>, fullKey));
    } else if (Array.isArray(value)) {
      // Treat arrays as numeric-keyed objects for dot-notation compatibility
      (value as unknown[]).forEach((item, idx) => {
        const idxKey = `${fullKey}.${idx}`;
        if (item === null || item === undefined) {
          result[idxKey] = "";
        } else if (typeof item === "object") {
          Object.assign(result, flattenToDot(item as Record<string, unknown>, idxKey));
        } else {
          result[idxKey] = String(item);
        }
      });
    } else {
      result[fullKey] = String(value);
    }
  }

  return result;
}

async function main() {
  const action = process.argv[2] || "push";
  console.log(`[Tolgee Sync] Executing action: ${action}`);
  console.log(`Target Tolgee Server: ${apiUrl}`);

  if (!apiKey) {
    console.log("⚠️  TOLGEE_API_KEY environment variable is not set.");
    console.log("💡  Set TOLGEE_API_KEY in .env.local or .dev.vars.");
    process.exit(1);
  }

  // Authenticate and discover project
  const projectsRes = await fetch(`${apiUrl}/v2/projects`, {
    headers: { "X-API-Key": apiKey },
  });

  if (!projectsRes.ok) {
    console.error(`❌ Auth failed (${projectsRes.status}): ${await projectsRes.text()}`);
    process.exit(1);
  }

  const projectsData = (await projectsRes.json()) as any;
  const project = projectsData._embedded?.projects?.[0];
  if (!project) {
    console.error("❌ No Tolgee projects found for this API Key.");
    process.exit(1);
  }
  console.log(`✓ Connected to Tolgee Project: "${project.name}" (ID: ${project.id})`);

  if (action === "push") {
    // Flatten all translation dictionaries to pure dot-notation
    const zhFlat = flattenToDot(zh as Record<string, unknown>);
    const enFlat = flattenToDot(en as Record<string, unknown>);
    const amFlat = flattenToDot(am as Record<string, unknown>);

    const zhKeyCount = Object.keys(zhFlat).length;
    const enKeyCount = Object.keys(enFlat).length;
    const amKeyCount = Object.keys(amFlat).length;

    console.log(`\n📊 Key counts after flattening:`);
    console.log(`   zh: ${zhKeyCount} keys`);
    console.log(`   en: ${enKeyCount} keys`);
    console.log(`   am: ${amKeyCount} keys`);

    // Validate symmetry before pushing
    if (zhKeyCount !== enKeyCount || zhKeyCount !== amKeyCount) {
      console.warn(`⚠️  Key count mismatch — zh:${zhKeyCount} en:${enKeyCount} am:${amKeyCount}`);
    }

    // Clear any pending import
    await fetch(`${apiUrl}/v2/projects/${project.id}/import`, {
      method: "DELETE",
      headers: { "X-API-Key": apiKey },
    });

    // Fetch available project languages
    const langRes = await fetch(`${apiUrl}/v2/projects/${project.id}/languages`, {
      headers: { "X-API-Key": apiKey },
    });
    const langs = ((await langRes.json()) as any)._embedded?.languages || [];
    const langMap: Record<string, number> = {};
    langs.forEach((l: any) => (langMap[l.tag] = l.id));
    console.log(`\n🌐 Available project languages: ${Object.keys(langMap).join(", ")}`);

    // Upload flat JSON files (dot-notation keys are Tolgee's native format)
    console.log(`\n🚀 Uploading flat JSON translations…`);
    const formData = new FormData();
    formData.append(
      "files",
      new Blob([JSON.stringify(zhFlat, null, 2)], { type: "application/json" }),
      "zh.json"
    );
    formData.append(
      "files",
      new Blob([JSON.stringify(enFlat, null, 2)], { type: "application/json" }),
      "en.json"
    );
    formData.append(
      "files",
      new Blob([JSON.stringify(amFlat, null, 2)], { type: "application/json" }),
      "am.json"
    );

    const importRes = await fetch(`${apiUrl}/v2/projects/${project.id}/import`, {
      method: "POST",
      headers: { "X-API-Key": apiKey },
      body: formData,
    });

    if (!importRes.ok) {
      console.error(`❌ Upload failed (${importRes.status}): ${await importRes.text()}`);
      process.exit(1);
    }

    const importData = (await importRes.json()) as any;
    const impLangs = importData.result?._embedded?.languages || [];

    // Pair uploaded languages to existing project languages
    for (const impLang of impLangs) {
      const tag = impLang.importFileName.replace(".json", "");
      const existingId = langMap[tag];
      if (existingId) {
        const selectRes = await fetch(
          `${apiUrl}/v2/projects/${project.id}/import/result/languages/${impLang.id}/select-existing/${existingId}`,
          { method: "PUT", headers: { "X-API-Key": apiKey } }
        );
        if (selectRes.ok) {
          console.log(`   ✓ Paired import "${tag}" → project lang ID ${existingId}`);
        }
      } else {
        console.warn(`   ⚠️  No project language found for tag "${tag}"`);
      }
    }

    // Apply with OVERRIDE to overwrite all existing keys
    const applyRes = await fetch(
      `${apiUrl}/v2/projects/${project.id}/import/apply?forceMode=OVERRIDE`,
      { method: "PUT", headers: { "X-API-Key": apiKey } }
    );

    if (applyRes.ok) {
      console.log(`\n✅ ${zhKeyCount} translation keys applied to Tolgee (dot-notation, all locales).`);
    } else {
      console.error(`❌ Tolgee apply error (${applyRes.status}): ${await applyRes.text()}`);
      process.exit(1);
    }
  }

  if (action === "verify") {
    // Quick verification — compare local key count to Tolgee key count
    const zhFlat = flattenToDot(zh as Record<string, unknown>);
    const localCount = Object.keys(zhFlat).length;

    const keysRes = await fetch(
      `${apiUrl}/v2/projects/${project.id}/keys?size=1`,
      { headers: { "X-API-Key": apiKey } }
    );
    const keysData = (await keysRes.json()) as any;
    const remoteCount = keysData.page?.totalElements ?? 0;

    console.log(`\n📊 Verification:`);
    console.log(`   Local flat keys (zh): ${localCount}`);
    console.log(`   Tolgee remote keys:   ${remoteCount}`);

    if (remoteCount >= localCount) {
      console.log(`✅ Tolgee has at least as many keys as local dictionary — sync looks good.`);
    } else {
      console.warn(`⚠️  Tolgee has fewer keys than local (${remoteCount} < ${localCount}). Run "push" to sync.`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
