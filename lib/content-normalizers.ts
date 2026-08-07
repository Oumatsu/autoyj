export type PublicProductCategory = "revenue-king" | "elite-flagship" | "utility-pro";

const CATEGORY_ALIASES: Record<string, PublicProductCategory> = {
  "revenue-king": "revenue-king",
  revenue: "revenue-king",
  "ride-hailing": "revenue-king",
  "网约车": "revenue-king",
  "elite-flagship": "elite-flagship",
  flagship: "elite-flagship",
  luxury: "elite-flagship",
  "旗舰": "elite-flagship",
  "utility-pro": "utility-pro",
  utility: "utility-pro",
  commercial: "utility-pro",
  "商用": "utility-pro",
};

const TRUSTED_UNSPLASH_PREFIXES = ["https://images.unsplash.com/"];

function normalizeAlias(value: string): string {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-");
}

function stripRouteAffixes(value: string): string {
  return value.trim().replace(/[?#].*$/, "").replace(/^\/+|\/+$/g, "");
}

function hasUnsafePathTraversal(pathname: string): boolean {
  for (const segment of pathname.split("/")) {
    if (!segment) {
      continue;
    }

    let decodedSegment: string;
    try {
      decodedSegment = decodeURIComponent(segment);
    } catch {
      return true;
    }

    if (decodedSegment === "." || decodedSegment === "..") {
      return true;
    }

    if (decodedSegment.includes("/") || decodedSegment.includes("\\")) {
      return true;
    }
  }

  return false;
}

function extractProductCategoryFromPath(value: string): PublicProductCategory | null {
  const normalizedPath = stripRouteAffixes(value);
  const match = normalizedPath.match(/^products\/(revenue-king|elite-flagship|utility-pro)(?:\/|$)/i);
  const category = match?.[1]?.toLowerCase();
  if (category === "revenue-king" || category === "elite-flagship" || category === "utility-pro") {
    return category;
  }
  return null;
}

export function normalizeProductSlug(value: string | null | undefined): string {
  const raw = stripRouteAffixes(value ?? "");
  if (!raw) {
    return "";
  }

  const lastSegment = raw.split("/").filter(Boolean).pop() ?? "";

  return lastSegment
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeProductCategory(
  segment: string | null | undefined,
  productPath?: string | null,
): PublicProductCategory | null {
  const pathCategory = productPath ? extractProductCategoryFromPath(productPath) : null;
  if (pathCategory) {
    return pathCategory;
  }

  const alias = segment ? CATEGORY_ALIASES[normalizeAlias(segment)] : undefined;
  return alias ?? null;
}

export function normalizeAssetUrl(value: string | null | undefined): string | null {
  const clean = value?.trim();
  if (!clean) {
    return null;
  }

  const pathOnly = clean.split(/[?#]/, 1)[0];
  if (pathOnly.startsWith("/pic/")) {
    const picPath = pathOnly.slice("/pic/".length);
    if (picPath && hasUnsafePathTraversal(picPath)) {
      return null;
    }
    return clean;
  }

  const lowered = clean.toLowerCase();
  if (TRUSTED_UNSPLASH_PREFIXES.some((prefix) => lowered.startsWith(prefix))) {
    return clean;
  }

  if (
    lowered.startsWith("http://") ||
    lowered.startsWith("https://") ||
    lowered.startsWith("//") ||
    lowered.includes("feishu.cn")
  ) {
    return null;
  }

  return null;
}

export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === "string");
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return [];
    }
    throw error;
  }
}
