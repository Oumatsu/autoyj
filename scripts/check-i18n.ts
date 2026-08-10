import fs from "node:fs";
import path from "node:path";
import enMessages from "../i18n/translations/en.json";
import zhMessages from "../i18n/translations/zh.json";
import amMessages from "../i18n/translations/am.json";

function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  let keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys = keys.concat(flattenKeys(v as Record<string, unknown>, newKey));
    } else {
      keys.push(newKey);
    }
  }
  return keys;
}

function getFiles(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(filePath));
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      results.push(filePath);
    }
  }
  return results;
}

import { listPublicInsights, listPublicAcademy } from "../server/db/public-content.ts";

export async function auditTranslations() {
  const allDefinedKeys = flattenKeys(enMessages as Record<string, unknown>);
  const definedKeySet = new Set(allDefinedKeys);
  const zhKeySet = new Set(flattenKeys(zhMessages as Record<string, unknown>));
  const amKeySet = new Set(flattenKeys(amMessages as Record<string, unknown>));

  const searchDirs = ["./views", "./components", "./app", "./lib"];
  const files = searchDirs.flatMap((d) => getFiles(d));

  let allCodeText = "";
  for (const f of files) {
    allCodeText += `${fs.readFileSync(f, "utf-8")}\n`;
  }

  // 1. Find direct key string usages
  const directKeyRegex = /(?:t|tArray|tObject|keyName|tFn)\s*\(\s*["']([^"']+)["']|keyName=["']([^"']+)["']/g;
  const usedKeys = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = directKeyRegex.exec(allCodeText)) !== null) {
    const key = match[1] || match[2];
    if (key) usedKeys.add(key);
  }

  // 1b. Expand dynamic content keys (articles, academy lessons, vault items)
  try {
    const articles = await listPublicInsights(null);
    for (const article of articles) {
      if (article.slug) {
        usedKeys.add(`insights.articles.${article.slug}.title`);
        usedKeys.add(`insights.articles.${article.slug}.overview`);
        usedKeys.add(`insights.articles.${article.slug}.date`);
        usedKeys.add(`insights.articles.${article.slug}.content`);
      }
    }
    // Also include all defined articles from translation dictionaries
    if (enMessages.insights && typeof enMessages.insights === "object" && "articles" in enMessages.insights) {
      const definedArticles = Object.keys((enMessages.insights as any).articles || {});
      for (const slug of definedArticles) {
        usedKeys.add(`insights.articles.${slug}.title`);
        usedKeys.add(`insights.articles.${slug}.overview`);
        usedKeys.add(`insights.articles.${slug}.date`);
        usedKeys.add(`insights.articles.${slug}.content`);
      }
    }
    const academy = await listPublicAcademy(null);
    const allLessons = [
      ...(academy.lessons?.fundamentals || []),
      ...(academy.lessons?.playbook || []),
      ...(academy.lessons?.workshop || []),
    ];
    for (const lesson of allLessons) {
      if (lesson.slug) {
        usedKeys.add(`academy.lessons.${lesson.slug}.title`);
        usedKeys.add(`academy.lessons.${lesson.slug}.tag`);
        usedKeys.add(`academy.lessons.${lesson.slug}.description`);
      }
    }
    for (const item of academy.vault || []) {
      if (item.translationId) {
        usedKeys.add(`academy.vault.${item.translationId}.title`);
        usedKeys.add(`academy.vault.${item.translationId}.description`);
      }
    }
  } catch (err) {
    console.warn("Could not expand dynamic database keys:", err);
  }

  // 2. Missing keys: used in code or dynamic content, missing in en.ts, zh.ts, or am.ts
  const missingKeys: string[] = [];
  const missingZhKeys: string[] = [];
  const missingAmKeys: string[] = [];

  for (const key of usedKeys) {
    // Ignore dynamic template strings, single words without dot, or baseline variables
    if (!key.includes(".")) continue;
    if (key === "vehicle.brand" || key === "vehicle.name") continue;
    if (!definedKeySet.has(key)) {
      // Check if it's a sub-path of an object or array key
      let isSubKey = false;
      for (const defKey of allDefinedKeys) {
        if (defKey.startsWith(`${key}.`) || key.startsWith(`${defKey}.`)) {
          isSubKey = true;
          break;
        }
      }
      if (!isSubKey) {
        missingKeys.push(key);
      }
    }
    if (!zhKeySet.has(key)) {
      let isSubKey = false;
      for (const defKey of zhKeySet) {
        if (defKey.startsWith(`${key}.`) || key.startsWith(`${defKey}.`)) {
          isSubKey = true;
          break;
        }
      }
      if (!isSubKey) {
        missingZhKeys.push(key);
      }
    }
    if (!amKeySet.has(key)) {
      let isSubKey = false;
      for (const defKey of amKeySet) {
        if (defKey.startsWith(`${key}.`) || key.startsWith(`${defKey}.`)) {
          isSubKey = true;
          break;
        }
      }
      if (!isSubKey) {
        missingAmKeys.push(key);
      }
    }
  }

  // 3. Unused keys: defined in en.ts but not referenced in code
  const unusedKeys: string[] = [];
  for (const defKey of allDefinedKeys) {
    const isDirectlyUsed = allCodeText.includes(`'${defKey}'`) || allCodeText.includes(`"${defKey}"`);
    if (isDirectlyUsed) continue;

    let isPrefixUsed = false;
    for (const usedKey of usedKeys) {
      if (defKey.startsWith(`${usedKey}.`) || defKey === usedKey) {
        isPrefixUsed = true;
        break;
      }
    }

    if (!isPrefixUsed) {
      unusedKeys.push(defKey);
    }
  }

  console.log("=========================================");
  console.log("🌐 i18n Translation Health Audit Report");
  console.log("=========================================");
  console.log(`📊 Total Defined Keys in en.ts: ${allDefinedKeys.length}`);
  console.log(`🔍 Total Key References (AST + Dynamic): ${usedKeys.size}`);
  console.log("-----------------------------------------");

  if (missingKeys.length > 0) {
    console.log(`❌ Missing Keys in en.ts: [${missingKeys.length}]`);
    missingKeys.forEach((k) => console.log(`   - ${k}`));
  } else {
    console.log("✅ Missing Keys in en.ts: None! (All code & dynamic keys exist)");
  }

  if (missingZhKeys.length > 0) {
    console.log(`❌ Missing Keys in zh.ts: [${missingZhKeys.length}]`);
    missingZhKeys.forEach((k) => console.log(`   - ${k}`));
  } else {
    console.log("✅ Missing Keys in zh.ts: None!");
  }

  if (missingAmKeys.length > 0) {
    console.log(`❌ Missing Keys in am.ts: [${missingAmKeys.length}]`);
    missingAmKeys.forEach((k) => console.log(`   - ${k}`));
  } else {
    console.log("✅ Missing Keys in am.ts: None!");
  }

  console.log("-----------------------------------------");
  if (unusedKeys.length > 0) {
    console.log(`⚠️ Unused Keys (Defined in en.ts, unreferenced in code): [${unusedKeys.length}]`);
    unusedKeys.slice(0, 30).forEach((k) => console.log(`   - ${k}`));
    if (unusedKeys.length > 30) {
      console.log(`   ... and ${unusedKeys.length - 30} more.`);
    }
  } else {
    console.log("🎉 Unused Keys: None! (No dead translation keys)");
  }
  console.log("=========================================\n");

  if (missingKeys.length > 0 || missingZhKeys.length > 0 || missingAmKeys.length > 0) {
    console.error("💥 STRICT AUDIT FAILURE: Missing translation keys detected! CI build aborted.");
    process.exit(1);
  }

  return { missingKeys, unusedKeys };
}

if (process.argv[1]?.endsWith("check-i18n.ts")) {
  await auditTranslations();
}
