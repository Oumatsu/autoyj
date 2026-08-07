function nestedValue(source: Record<string, unknown>, key: string): unknown {
  return key.split(".").reduce<unknown>((value, segment) => {
    if (!value || typeof value !== "object") return undefined;
    if (Array.isArray(value)) {
      const index = Number(segment);
      return Number.isInteger(index) ? value[index] : undefined;
    }
    return (value as Record<string, unknown>)[segment];
  }, source);
}

/**
 * Checks whether a key is explicitly defined in a source (even as empty string).
 * Returns true when the key exists in the source (undefined means missing).
 */
function keyExistsIn(source: Record<string, unknown>, key: string): boolean {
  return nestedValue(source, key) !== undefined;
}

/**
 * Standard resolver: iterates sources in order, returning the first non-undefined
 * value found. Empty strings ("") are treated as valid values and returned
 * immediately — callers that need to skip "" and look further should not use this.
 *
 * Used by tArray and general non-heading lookups.
 */
export function resolveTranslationValue(
  key: string,
  sources: Array<Record<string, unknown> | null | undefined>,
  fallback?: unknown,
): unknown {
  for (const source of sources) {
    if (!source) continue;
    const value = nestedValue(source, key);
    if (value !== undefined) return value;
  }
  return fallback ?? "";
}

/**
 * EN-fallback-aware resolver used specifically by the t() hook when the source
 * list is [primaryLocale, ...specsData, en].
 *
 * Behaviour:
 * - If the primary locale source already has the key — even as "" — the EN
 *   fallback (last source) is NOT consulted. This prevents English heading
 *   fragments like "The" / "Matrix" from bleeding into ZH pages where the
 *   corresponding key is intentionally blank ("").
 * - Middle sources (specsData) are always consulted normally; "" in them does
 *   NOT block the next middle source.
 *
 * @param key         Dot-separated translation key
 * @param sources     [primaryLocale, ...middle?, enFallback]
 * @param fallback    Value of last resort
 */
export function resolveTranslationValueBlockEnFallback(
  key: string,
  sources: Array<Record<string, unknown> | null | undefined>,
  fallback?: unknown,
): unknown {
  if (sources.length < 2) return resolveTranslationValue(key, sources, fallback);

  const primary = sources[0];
  const middle = sources.slice(1, -1);
  const enFallback = sources[sources.length - 1];

  // If the primary locale explicitly defines this key (even as ""),
  // honour it and skip the EN fallback to prevent EN word leakage.
  if (primary && keyExistsIn(primary, key)) {
    const primaryVal = nestedValue(primary, key);

    // Primary has a real non-empty value — use it directly.
    if (primaryVal !== undefined && primaryVal !== "") return primaryVal;

    // Primary has key but value is "": still check middle sources (specsData)
    // for a richer value before giving up.
    for (const src of middle) {
      if (!src) continue;
      const val = nestedValue(src, key);
      if (val !== undefined && val !== "") return val;
    }

    // Primary had the key as "" and no middle source had better — return "".
    // Critically: do NOT fall through to EN fallback.
    return primaryVal ?? "";
  }

  // Key is absent from primary locale — search middle sources then EN normally.
  for (const src of middle) {
    if (!src) continue;
    const val = nestedValue(src, key);
    if (val !== undefined) return val;
  }

  if (enFallback) {
    const val = nestedValue(enFallback, key);
    if (val !== undefined) return val;
  }

  return fallback ?? "";
}

export function asStringArray(value: unknown, fallback: string[]): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : fallback;
}
