import { Tolgee } from "@tolgee/web";
import { InContextTools as DevTools } from "@tolgee/web/tools";
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

/**
 * 读取 Tolgee 配置。
 * Vite 在构建时会将 import.meta.env.NEXT_PUBLIC_* 静态替换为字符串字面量，
 * 因此必须直接引用完整的变量名，不能用动态属性访问。
 */
export function getTolgeeConfig() {
  const apiKey = process.env.NEXT_PUBLIC_TOLGEE_API_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_TOLGEE_API_URL || TOLGEE_API_URL_DEFAULT;
  const projectIdRaw = process.env.NEXT_PUBLIC_TOLGEE_PROJECT_ID;
  const parsedProjectId = projectIdRaw ? Number(projectIdRaw) : TOLGEE_PROJECT_ID_FALLBACK;

  return {
    apiKey: apiKey || undefined,
    apiUrl,
    projectId: Number.isNaN(parsedProjectId) ? TOLGEE_PROJECT_ID_FALLBACK : parsedProjectId,
  };
}

export { DevTools };

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
  const timeoutId = window.setTimeout(() => controller.abort(), 3000);
  tolgeeReachability = fetch(apiUrl, {
    cache: "no-store",
    mode: "no-cors",
    signal: controller.signal,
  })
    .then(() => true)
    .catch(() => true)
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

const tolgeeFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  const response = await fetch(input, init);
  // Self-hosted Community edition of Tolgee does not enable multibranching (/branches/find).
  // Intercept HTTP 400 feature_not_enabled to return an empty branch list and prevent console errors.
  if (response.status === 400 && url.includes("/branches/find")) {
    return new Response(
      JSON.stringify({
        _embedded: { branches: [] },
        page: { totalElements: 0, totalPages: 0, number: 0, size: 20 },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  return response;
};

export function createTolgee(initialLocale: string = defaultLanguage, options: TolgeeOptions = {}) {
  const language = (availableLanguages as readonly string[]).includes(initialLocale)
    ? initialLocale
    : defaultLanguage;

  lastCreatedLanguage = language;

  const { apiKey, apiUrl, projectId } = getTolgeeConfig();
  const remoteEnabled = options.remote !== false && Boolean(apiKey);

  if (typeof window !== "undefined") {
    const instance = Tolgee({ defaultLanguage: language }).use(FormatIcu());
    if (remoteEnabled) {
      instance.use(DevTools());
    }
    instanceLanguageMap.set(instance, language);
    const res = instance.init({
      language,
      defaultLanguage,
      fallbackLanguage: fallbackLocale,
      observerType: "invisible",
      staticData: tolgeeStaticData as any,
      ...(remoteEnabled ? { apiUrl, apiKey, projectId, fetch: tolgeeFetch } : {}),
    });
    instanceLanguageMap.set(res, language);
    void res.run();
    return res;
  }

  const instance = Tolgee({ defaultLanguage: language }).use(FormatIcu());
  instanceLanguageMap.set(instance, language);
  const res = instance.init({
    language,
    defaultLanguage,
    fallbackLanguage: fallbackLocale,
    observerType: "invisible",
    staticData: tolgeeStaticData as any,
  });
  instanceLanguageMap.set(res, language);
  void res.run();
  return res;
}
