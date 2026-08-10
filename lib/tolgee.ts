import { TolgeeCore } from "@tolgee/core";
import { Tolgee, DevTools } from "@tolgee/web";
import { FormatIcu } from "@tolgee/format-icu";
import { defaultLocale, fallbackLocale, locales } from "@/i18n/config";
import { TOLGEE_PROJECT_ID_FALLBACK, TOLGEE_API_URL_DEFAULT } from "@/lib/constants";
import { tolgeeStaticData } from "@/i18n/messages";

// Re-export from config so callers that imported from here still work
const defaultLanguage = defaultLocale;
const availableLanguages = locales;

type TolgeeOptions = {
  remote?: boolean;
  extraData?: Record<string, any> | null;
};

function getEnvVar(key: string): string | undefined {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }
  try {
    return (import.meta as any).env?.[key];
  } catch {
    return undefined;
  }
}

function getTolgeeConfig() {
  const apiKey = getEnvVar("NEXT_PUBLIC_TOLGEE_API_KEY");
  const apiUrl = getEnvVar("NEXT_PUBLIC_TOLGEE_API_URL") || TOLGEE_API_URL_DEFAULT;
  const projectIdRaw = getEnvVar("NEXT_PUBLIC_TOLGEE_PROJECT_ID");
  const parsedProjectId = projectIdRaw ? Number(projectIdRaw) : TOLGEE_PROJECT_ID_FALLBACK;

  return {
    apiKey,
    apiUrl,
    projectId: Number.isNaN(parsedProjectId) ? TOLGEE_PROJECT_ID_FALLBACK : parsedProjectId,
  };
}

let tolgeeReachability: Promise<boolean> | null = null;

/**
 * Keep the static bundle usable when the optional local Tolgee editor is stopped.
 * no-cors avoids a second preflight just to check whether the local server exists.
 */
export function probeTolgee(): Promise<boolean> {
  if (tolgeeReachability) return tolgeeReachability;

  const { apiKey, apiUrl } = getTolgeeConfig();
  if (!apiKey || typeof window === "undefined") return Promise.resolve(false);

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 800);
  tolgeeReachability = fetch(apiUrl, {
    cache: "no-store",
    mode: "no-cors",
    signal: controller.signal,
  })
    .then(() => true)
    .catch(() => false)
    .finally(() => window.clearTimeout(timeoutId));

  return tolgeeReachability;
}

const instanceLanguageMap = new WeakMap<object, string>();
let lastCreatedLanguage: string = defaultLanguage;

export function getLastCreatedTolgeeLanguage(): string {
  return lastCreatedLanguage;
}

export function getTolgeeTargetLanguage(tolgee: object | null | undefined): string | undefined {
  if (!tolgee) return undefined;
  return instanceLanguageMap.get(tolgee);
}

export function createTolgee(initialLocale: string = defaultLanguage, options: TolgeeOptions = {}) {
  const language = (availableLanguages as readonly string[]).includes(initialLocale)
    ? initialLocale
    : defaultLanguage;

  lastCreatedLanguage = language;

  const { apiKey, apiUrl, projectId } = getTolgeeConfig();
  const remoteEnabled = options.remote !== false && Boolean(apiKey);

  const isBrowser = typeof window !== "undefined";
  const instance = (isBrowser ? Tolgee({ defaultLanguage: language }) : TolgeeCore({ defaultLanguage: language })).use(FormatIcu());
  if (isBrowser && remoteEnabled) {
    instance.use(DevTools());
  }

  instanceLanguageMap.set(instance, language);
  const res = instance.init({
    language,
    defaultLanguage,
    fallbackLanguage: fallbackLocale,
    observerType: "invisible",
    ...(remoteEnabled ? { apiUrl, apiKey, projectId } : {}),
    staticData: JSON.parse(JSON.stringify(options.extraData || tolgeeStaticData)),
  });
  instanceLanguageMap.set(res, language);
  void res.run();
  return res;
}
