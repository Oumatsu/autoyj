export type FeaturedVehicleResourceInput = {
  id: string;
  featuredRank?: number | null;
  featuredImageUrl?: string | null;
  imageUrl?: string | null;
};

export type FeaturedVehicleResource<T extends FeaturedVehicleResourceInput> = T & {
  imageUrl: string;
};

function attachmentRecords(value: unknown): Record<string, unknown>[] {
  let attachments: unknown = value;
  if (typeof value === "string") {
    try {
      attachments = JSON.parse(value || "[]");
    } catch {
      attachments = [];
    }
  }
  return Array.isArray(attachments)
    ? attachments.filter((attachment): attachment is Record<string, unknown> => Boolean(attachment) && typeof attachment === "object")
    : [];
}

function usableImageUrl(value: string | null | undefined): string {
  const candidate = value?.trim() || "";
  return featuredLocalImageUrl(candidate)
    || featuredAttachmentProxyUrl(candidate)
    || (/^https?:\/\//i.test(candidate) ? candidate : "");
}

function featuredAttachmentProxyUrl(value: string): string {
  return /^\/api\/portal\/vehicles\/[^\\/?#]+\/featured-image$/.test(value) ? value : "";
}

export function featuredLocalImageUrl(value: unknown): string {
  const candidate = typeof value === "string" ? value.trim() : "";
  let decodedPath = "";
  try {
    decodedPath = decodeURIComponent(candidate);
  } catch {
    return "";
  }
  const prefix = "/pic/vehicle-resources/";
  if (!decodedPath.startsWith(prefix)) return "";
  const segments = decodedPath.slice(prefix.length).split("/");
  if (!segments.length || segments.some((segment) => !segment || segment === "." || segment === ".." || /[\\\0?#]/.test(segment))) return "";
  if (!/\.(?:avif|gif|jpe?g|png|webp)$/i.test(segments.at(-1) || "")) return "";
  return encodeURI(decodedPath);
}

export function featuredImageUrlFromAttachment(value: unknown): string {
  for (const record of attachmentRecords(value)) {
    for (const key of ["url", "tmp_url"]) {
      const candidate = typeof record[key] === "string" ? record[key].trim() : "";
      if (/^https?:\/\//i.test(candidate)) return candidate;
    }
  }
  return "";
}

export function featuredAttachmentTokenFromAttachment(value: unknown): string {
  for (const record of attachmentRecords(value)) {
    const token = typeof record.file_token === "string" ? record.file_token.trim() : "";
    if (token) return token;
  }
  return "";
}

export function selectFeaturedVehicleResources<T extends FeaturedVehicleResourceInput>(
  resources: T[],
): FeaturedVehicleResource<T>[] {
  return resources
    .filter((resource) => Number.isInteger(resource.featuredRank) && (resource.featuredRank || 0) > 0)
    .map((resource) => ({
      ...resource,
      imageUrl: usableImageUrl(resource.featuredImageUrl) || usableImageUrl(resource.imageUrl),
    }))
    .sort((left, right) => (left.featuredRank! - right.featuredRank!) || left.id.localeCompare(right.id));
}
