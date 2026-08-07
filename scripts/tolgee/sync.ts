import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { locales } from "../../i18n/routing";
import zh from "../../i18n/translations/zh";
import en from "../../i18n/translations/en";
import am from "../../i18n/translations/am";

export const translationLocales = locales;
export type TranslationLocale = (typeof translationLocales)[number];

export const translationFiles: Record<TranslationLocale, string> = {
  zh: "i18n/translations/zh.ts",
  en: "i18n/translations/en.ts",
  am: "i18n/translations/am.ts",
};

type TranslationObject = Record<string, unknown>;
type FetchLike = typeof fetch;

export interface ParsedArgs {
  action: "push" | "pull" | "verify";
  allowKeyRemoval: boolean;
  mergeMissingKeys: boolean;
}

export interface PullOptions {
  apiUrl?: string;
  apiKey?: string;
  projectId?: number;
  allowKeyRemoval?: boolean;
  cwd?: string;
  fetchImpl?: FetchLike;
  getDirtyFiles?: (cwd: string) => string[];
  currentKeys?: Set<string>;
  currentTranslations?: Record<TranslationLocale, TranslationObject>;
  mergeMissingKeys?: boolean;
  fileSystem?: PullFileSystem;
}

export interface PullFileSystem {
  writeFile(filePath: string, contents: string): Promise<void>;
  rename(oldPath: string, newPath: string): Promise<void>;
  unlink(filePath: string): Promise<void>;
}

export interface PullResult {
  changedFiles: string[];
  keyCount: number;
}

const defaultFileSystem: PullFileSystem = {
  async writeFile(filePath, contents) {
    await fs.promises.writeFile(filePath, contents, "utf8");
  },
  async rename(oldPath, newPath) {
    await fs.promises.rename(oldPath, newPath);
  },
  async unlink(filePath) {
    await fs.promises.unlink(filePath);
  },
};

function isRecord(value: unknown): value is TranslationObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Flatten a nested object to dot-notation key-value pairs.
 * Arrays are treated as objects with numeric string keys (0, 1, 2…),
 * which matches the dot-notation shape consumed by Tolgee's static bundles.
 */
export function flattenToDot(
  obj: TranslationObject,
  prefix = ""
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) {
      result[fullKey] = "";
    } else if (typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenToDot(value as TranslationObject, fullKey));
    } else if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        const idxKey = `${fullKey}.${idx}`;
        if (item === null || item === undefined) {
          result[idxKey] = "";
        } else if (typeof item === "object") {
          Object.assign(result, flattenToDot(item as TranslationObject, idxKey));
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

export function renderTranslationModule(
  locale: TranslationLocale,
  data: TranslationObject
): string {
  const serialized = JSON.stringify(data, null, 2);
  return `const ${locale} = ${serialized};\n\nexport default ${locale};\n`;
}

export function parseArgs(args: string[] = process.argv.slice(2)): ParsedArgs {
  const action = args[0] || "push";
  if (action !== "push" && action !== "pull" && action !== "verify") {
    throw new Error(`Unknown Tolgee sync action "${action}". Use push, pull, or verify.`);
  }

  const flags = args.slice(1);
  const unknownFlag = flags.find((flag) => flag !== "--allow-key-removal" && flag !== "--merge-missing-keys");
  if (unknownFlag) {
    throw new Error(`Unknown Tolgee sync option "${unknownFlag}".`);
  }

  return {
    action,
    allowKeyRemoval: flags.includes("--allow-key-removal"),
    mergeMissingKeys: flags.includes("--merge-missing-keys"),
  };
}

function setDotValue(target: TranslationObject, key: string, value: string): void {
  const parts = key.split(".");
  let cursor: Record<string, unknown> = target;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    const next = cursor[part];
    if (!isRecord(next) && !Array.isArray(next)) {
      cursor[part] = {};
    }
    cursor = cursor[part] as Record<string, unknown>;
  }
  cursor[parts.at(-1)!] = value;
}

function getDotValue(source: TranslationObject, key: string): unknown {
  return key.split(".").reduce<unknown>((value, part) => {
    if (value === null || value === undefined || typeof value !== "object") {
      return undefined;
    }
    return (value as Record<string, unknown>)[part];
  }, source);
}

/**
 * Preserve prior Tolgee values for keys still present in the static catalog.
 * New static keys are retained as a baseline and removed remote keys are omitted.
 */
export function mergePulledTranslations(
  exported: Record<TranslationLocale, TranslationObject>,
  current: Record<TranslationLocale, TranslationObject>,
): Record<TranslationLocale, TranslationObject> {
  const merged = {} as Record<TranslationLocale, TranslationObject>;
  for (const locale of translationLocales) {
    const currentFlat = flattenToDot(current[locale]);
    const exportedFlat = flattenToDot(exported[locale]);
    const next = JSON.parse(JSON.stringify(current[locale])) as TranslationObject;
    for (const key of Object.keys(currentFlat)) {
      if (typeof getDotValue(current[locale], key) === "string" && Object.hasOwn(exportedFlat, key)) {
        setDotValue(next, key, exportedFlat[key]);
      }
    }
    merged[locale] = next;
  }
  return merged;
}

export function compareKeySets(
  localeKeys: Record<TranslationLocale, Record<string, string>>,
  currentKeys: Set<string>,
  allowKeyRemoval: boolean
): void {
  const referenceKeys = new Set(Object.keys(localeKeys.zh));
  const localeMismatches: string[] = [];

  for (const locale of translationLocales) {
    const keys = new Set(Object.keys(localeKeys[locale]));
    const missing = [...referenceKeys].filter((key) => !keys.has(key));
    const extra = [...keys].filter((key) => !referenceKeys.has(key));
    if (missing.length > 0 || extra.length > 0) {
      const details = [
        missing.length > 0 ? `missing: ${missing.join(", ")}` : "",
        extra.length > 0 ? `extra: ${extra.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("; ");
      localeMismatches.push(`${locale} (${details})`);
    }
  }

  if (localeMismatches.length > 0) {
    throw new Error(`Tolgee locale key mismatch: ${localeMismatches.join(" | ")}`);
  }

  const removedKeys = [...currentKeys].filter((key) => !referenceKeys.has(key));
  if (removedKeys.length > 0 && !allowKeyRemoval) {
    throw new Error(
      `Tolgee export would remove ${removedKeys.length} existing key(s): ${removedKeys.join(", ")}. ` +
        `Re-run with --allow-key-removal only when this deletion is intentional.`
    );
  }
}

function loadDevVars(): void {
  if (!fs.existsSync(".dev.vars")) {
    return;
  }

  const devVars = fs.readFileSync(".dev.vars", "utf8");
  for (const line of devVars.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const index = trimmed.indexOf("=");
    if (index <= 0) {
      continue;
    }

    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function parseProjectId(value: string | undefined): number | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const projectId = Number(value);
  if (!Number.isInteger(projectId) || projectId <= 0) {
    throw new Error(`TOLGEE_PROJECT_ID must be a positive integer, received "${value}".`);
  }
  return projectId;
}

function getConfig(options: PullOptions = {}): {
  apiUrl: string;
  apiKey: string | undefined;
  projectId: number | undefined;
} {
  loadDevVars();
  return {
    apiUrl:
      options.apiUrl ??
      (process.env.TOLGEE_API_URL ||
        process.env.NEXT_PUBLIC_TOLGEE_API_URL ||
        "http://localhost:8085"),
    apiKey:
      options.apiKey ??
      (process.env.TOLGEE_API_KEY || process.env.NEXT_PUBLIC_TOLGEE_API_KEY),
    projectId:
      options.projectId ??
      parseProjectId(process.env.TOLGEE_PROJECT_ID || process.env.NEXT_PUBLIC_TOLGEE_PROJECT_ID),
  };
}

function requireApiKey(apiKey: string | undefined): string {
  if (!apiKey) {
    throw new Error(
      "TOLGEE_API_KEY environment variable is not set. Add it to .dev.vars before syncing."
    );
  }
  return apiKey;
}

function requireProjectId(projectId: number | undefined): number {
  if (!projectId) {
    throw new Error(
      "TOLGEE_PROJECT_ID environment variable is not set. Pull requires an explicit project ID."
    );
  }
  return projectId;
}

export function getDirtyTranslationFiles(cwd = process.cwd()): string[] {
  const output = execFileSync(
    "git",
    ["status", "--porcelain=v1", "--untracked-files=all", "--", ...Object.values(translationFiles)],
    { cwd, encoding: "utf8" }
  );

  return output
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .filter(Boolean);
}

async function exportLocale(
  apiUrl: string,
  projectId: number,
  apiKey: string,
  locale: TranslationLocale,
  fetchImpl: FetchLike
): Promise<TranslationObject> {
  const url = new URL(`/v2/projects/${projectId}/export`, apiUrl);
  url.searchParams.set("format", "JSON");
  url.searchParams.set("structureDelimiter", ".");
  url.searchParams.set("zip", "false");
  url.searchParams.set("languages", locale);

  const response = await fetchImpl(url, {
    headers: { "X-API-Key": apiKey },
  });
  const body = await response.text();

  if (!response.ok) {
    throw new Error(`Tolgee export failed for ${locale} (${response.status}): ${body}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Tolgee export for ${locale} is not valid JSON: ${reason}`);
  }

  if (!isRecord(parsed) || Object.keys(parsed).length === 0) {
    throw new Error(`Tolgee export for ${locale} is not a non-empty JSON object.`);
  }

  return parsed;
}

function getCurrentTranslationKeys(): Set<string> {
  const currentLocales: TranslationObject[] = [zh, en, am];
  return new Set(
    currentLocales.flatMap((locale) => Object.keys(flattenToDot(locale)))
  );
}

function getCurrentTranslations(): Record<TranslationLocale, TranslationObject> {
  return { zh, en, am };
}

function makeTemporaryPath(filePath: string, suffix: string): string {
  return `${filePath}.tolgee-${process.pid}-${Date.now()}-${suffix}.tmp`;
}

function makeBackupPath(filePath: string, suffix: string): string {
  return `${filePath}.backup-${process.pid}-${Date.now()}-${suffix}.ts`;
}

async function tryUnlink(fileSystem: PullFileSystem, filePath: string): Promise<void> {
  try {
    await fileSystem.unlink(filePath);
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return;
    }
    console.error(`Failed to clean up temporary Tolgee file "${filePath}".`, error);
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

async function replaceFilesAtomically(
  files: Array<{ relativePath: string; contents: string }>,
  cwd: string,
  fileSystem: PullFileSystem
): Promise<void> {
  const targets = files.map(({ relativePath }) => path.resolve(cwd, relativePath));
  const temporaryFiles = files.map(({ relativePath }, index) =>
    makeTemporaryPath(path.resolve(cwd, relativePath), `${index}`)
  );
  const backupFiles = files.map(({ relativePath }, index) =>
    makeBackupPath(path.resolve(cwd, relativePath), `${index}`)
  );
  const backedUp: string[] = [];
  const installed: string[] = [];

  try {
    for (let index = 0; index < files.length; index += 1) {
      await fileSystem.writeFile(temporaryFiles[index], files[index].contents);
    }

    for (let index = 0; index < targets.length; index += 1) {
      await fileSystem.rename(targets[index], backupFiles[index]);
      backedUp.push(backupFiles[index]);
    }

    for (let index = 0; index < targets.length; index += 1) {
      await fileSystem.rename(temporaryFiles[index], targets[index]);
      installed.push(targets[index]);
    }

    for (const backupFile of backupFiles) {
      await tryUnlink(fileSystem, backupFile);
    }
  } catch (error) {
    for (let index = installed.length - 1; index >= 0; index -= 1) {
      await tryUnlink(fileSystem, installed[index]);
    }
    for (let index = backedUp.length - 1; index >= 0; index -= 1) {
      const backupFile = backedUp[index];
      try {
        await fileSystem.rename(backupFile, targets[index]);
      } catch (restoreError) {
        console.error(`Failed to restore "${backupFile}" after Tolgee pull failure.`, restoreError);
      }
    }
    for (const temporaryFile of temporaryFiles) {
      await tryUnlink(fileSystem, temporaryFile);
    }
    throw error;
  } finally {
    for (const temporaryFile of temporaryFiles) {
      await tryUnlink(fileSystem, temporaryFile);
    }
  }
}

export async function runPull(options: PullOptions = {}): Promise<PullResult> {
  const config = getConfig(options);
  const apiKey = requireApiKey(config.apiKey);
  const projectId = requireProjectId(config.projectId);
  const cwd = options.cwd || process.cwd();
  const dirtyFiles = (options.getDirtyFiles || getDirtyTranslationFiles)(cwd);

  if (dirtyFiles.length > 0) {
    throw new Error(
      `Translation files have uncommitted changes: ${dirtyFiles.join(", ")}. ` +
        "Commit or revert them before running tolgee:pull."
    );
  }

  const fetchImpl = options.fetchImpl || fetch;
  const exported: Record<TranslationLocale, TranslationObject> = {
    zh: await exportLocale(config.apiUrl, projectId, apiKey, "zh", fetchImpl),
    en: await exportLocale(config.apiUrl, projectId, apiKey, "en", fetchImpl),
    am: await exportLocale(config.apiUrl, projectId, apiKey, "am", fetchImpl),
  };
  const flattened: Record<TranslationLocale, Record<string, string>> = {
    zh: flattenToDot(exported.zh),
    en: flattenToDot(exported.en),
    am: flattenToDot(exported.am),
  };

  const currentTranslations = options.currentTranslations || getCurrentTranslations();
  const output = options.mergeMissingKeys
    ? mergePulledTranslations(exported, currentTranslations)
    : exported;

  if (!options.mergeMissingKeys) {
    compareKeySets(
      flattened,
      options.currentKeys || getCurrentTranslationKeys(),
      options.allowKeyRemoval === true
    );
  }

  const renderedFiles = translationLocales.map((locale) => ({
    relativePath: translationFiles[locale],
    contents: renderTranslationModule(locale, output[locale]),
  }));
  await replaceFilesAtomically(
    renderedFiles,
    cwd,
    options.fileSystem || defaultFileSystem
  );

  return {
    changedFiles: renderedFiles.map(({ relativePath }) => relativePath),
    keyCount: Object.keys(flattenToDot(output.zh)).length,
  };
}

async function discoverProject(apiUrl: string, apiKey: string): Promise<{ id: number; name: string }> {
  const projectsRes = await fetch(`${apiUrl}/v2/projects`, {
    headers: { "X-API-Key": apiKey },
  });

  if (!projectsRes.ok) {
    throw new Error(`Auth failed (${projectsRes.status}): ${await projectsRes.text()}`);
  }

  const projectsData = (await projectsRes.json()) as {
    _embedded?: { projects?: Array<{ id: number; name: string }> };
  };
  const project = projectsData._embedded?.projects?.[0];
  if (!project) {
    throw new Error("No Tolgee projects found for this API Key.");
  }
  return project;
}

async function runPush(apiUrl: string, apiKey: string): Promise<void> {
  const project = await discoverProject(apiUrl, apiKey);
  console.log(`✓ Connected to Tolgee Project: "${project.name}" (ID: ${project.id})`);

  const zhFlat = flattenToDot(zh);
  const enFlat = flattenToDot(en);
  const amFlat = flattenToDot(am);
  const keyCounts = {
    zh: Object.keys(zhFlat).length,
    en: Object.keys(enFlat).length,
    am: Object.keys(amFlat).length,
  };

  console.log("\n📊 Key counts after flattening:");
  console.log(`   zh: ${keyCounts.zh} keys`);
  console.log(`   en: ${keyCounts.en} keys`);
  console.log(`   am: ${keyCounts.am} keys`);

  if (keyCounts.zh !== keyCounts.en || keyCounts.zh !== keyCounts.am) {
    console.warn(
      `⚠️  Key count mismatch — zh:${keyCounts.zh} en:${keyCounts.en} am:${keyCounts.am}`
    );
  }

  await fetch(`${apiUrl}/v2/projects/${project.id}/import`, {
    method: "DELETE",
    headers: { "X-API-Key": apiKey },
  });

  const langRes = await fetch(`${apiUrl}/v2/projects/${project.id}/languages`, {
    headers: { "X-API-Key": apiKey },
  });
  if (!langRes.ok) {
    throw new Error(`Failed to fetch Tolgee languages (${langRes.status}): ${await langRes.text()}`);
  }
  const langs = ((await langRes.json()) as {
    _embedded?: { languages?: Array<{ id: number; tag: string }> };
  })._embedded?.languages || [];
  const langMap: Record<string, number> = {};
  langs.forEach((language) => (langMap[language.tag] = language.id));
  console.log(`\n🌐 Available project languages: ${Object.keys(langMap).join(", ")}`);

  console.log("\n🚀 Uploading flat JSON translations…");
  const formData = new FormData();
  formData.append("files", new Blob([JSON.stringify(zhFlat, null, 2)], { type: "application/json" }), "zh.json");
  formData.append("files", new Blob([JSON.stringify(enFlat, null, 2)], { type: "application/json" }), "en.json");
  formData.append("files", new Blob([JSON.stringify(amFlat, null, 2)], { type: "application/json" }), "am.json");

  const importRes = await fetch(`${apiUrl}/v2/projects/${project.id}/import`, {
    method: "POST",
    headers: { "X-API-Key": apiKey },
    body: formData,
  });
  if (!importRes.ok) {
    throw new Error(`Upload failed (${importRes.status}): ${await importRes.text()}`);
  }

  const importData = (await importRes.json()) as {
    result?: { _embedded?: { languages?: Array<{ id: number; importFileName: string }> } };
  };
  const impLangs = importData.result?._embedded?.languages || [];
  for (const impLang of impLangs) {
    const tag = impLang.importFileName.replace(".json", "");
    const existingId = langMap[tag];
    if (!existingId) {
      console.warn(`⚠️  No project language found for tag "${tag}"`);
      continue;
    }

    const selectRes = await fetch(
      `${apiUrl}/v2/projects/${project.id}/import/result/languages/${impLang.id}/select-existing/${existingId}`,
      { method: "PUT", headers: { "X-API-Key": apiKey } }
    );
    if (selectRes.ok) {
      console.log(`   ✓ Paired import "${tag}" → project lang ID ${existingId}`);
    }
  }

  const applyRes = await fetch(
    `${apiUrl}/v2/projects/${project.id}/import/apply?forceMode=OVERRIDE`,
    { method: "PUT", headers: { "X-API-Key": apiKey } }
  );
  if (!applyRes.ok) {
    throw new Error(`Tolgee apply error (${applyRes.status}): ${await applyRes.text()}`);
  }
  console.log(`\n✅ ${keyCounts.zh} translation keys applied to Tolgee (dot-notation, all locales).`);
}

async function runVerify(apiUrl: string, apiKey: string): Promise<void> {
  const project = await discoverProject(apiUrl, apiKey);
  const localCount = Object.keys(flattenToDot(zh)).length;
  const keysRes = await fetch(`${apiUrl}/v2/projects/${project.id}/keys?size=1`, {
    headers: { "X-API-Key": apiKey },
  });
  if (!keysRes.ok) {
    throw new Error(`Failed to fetch Tolgee keys (${keysRes.status}): ${await keysRes.text()}`);
  }

  const keysData = (await keysRes.json()) as { page?: { totalElements?: number } };
  const remoteCount = keysData.page?.totalElements ?? 0;
  console.log("\n📊 Verification:");
  console.log(`   Local flat keys (zh): ${localCount}`);
  console.log(`   Tolgee remote keys:   ${remoteCount}`);

  if (remoteCount >= localCount) {
    console.log("✅ Tolgee has at least as many keys as local dictionary — sync looks good.");
  } else {
    console.warn(
      `⚠️  Tolgee has fewer keys than local (${remoteCount} < ${localCount}). Run "push" to sync.`
    );
  }
}

export async function main(args: string[] = process.argv.slice(2)): Promise<void> {
  const { action, allowKeyRemoval, mergeMissingKeys } = parseArgs(args);
  const config = getConfig();
  const apiKey = requireApiKey(config.apiKey);

  console.log(`[Tolgee Sync] Executing action: ${action}`);
  console.log(`Target Tolgee Server: ${config.apiUrl}`);

  if (action === "pull") {
    const result = await runPull({
      ...config,
      apiKey,
      allowKeyRemoval,
      mergeMissingKeys,
    });
    console.log(
      `\n✅ Pulled ${result.keyCount} keys for ${translationLocales.length} locales into ${result.changedFiles.join(", ")}.`
    );
    console.log("Review the diff before committing and deploying.");
    return;
  }

  if (action === "push") {
    await runPush(config.apiUrl, apiKey);
    return;
  }

  await runVerify(config.apiUrl, apiKey);
}

const scriptPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
const modulePath = path.resolve(fileURLToPath(import.meta.url));
if (scriptPath === modulePath) {
  main().catch((error: unknown) => {
    console.error("Fatal:", error);
    process.exitCode = 1;
  });
}
