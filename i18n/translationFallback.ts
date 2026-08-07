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

export function resolveTranslationValue(
  key: string,
  sources: Array<Record<string, unknown> | null | undefined>,
  fallback?: unknown,
): unknown {
  for (const source of sources) {
    if (!source) continue;
    const value = nestedValue(source, key);
    if (value !== undefined && value !== "") return value;
  }
  return fallback ?? "";
}

export function asStringArray(value: unknown, fallback: string[]): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : fallback;
}
