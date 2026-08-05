const UNRECOGNIZED_TEXT = "未识别";

/** Removes database-only audit markers from API data before it reaches the UI. */
export function sanitizeDisplayData<T>(value: T): T {
  if (typeof value === "string") {
    return value.replaceAll(UNRECOGNIZED_TEXT, "-") as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeDisplayData(item)) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, sanitizeDisplayData(item)]),
    ) as T;
  }
  return value;
}
