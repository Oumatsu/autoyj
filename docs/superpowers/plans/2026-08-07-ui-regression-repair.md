# UI Regression Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the pre-refactor page structure and content while making all website reads D1-only, making Feishu cron synchronization safe, making Tolgee the user-facing translation source, and eliminating broken local image URLs.

**Architecture:** A typed public-content repository will translate sparse D1 rows into the existing product, insight, and academy view contracts. A single asset resolver will validate database values against the static `/public/pic` manifest and provide deterministic local fallbacks. Feishu mapping remains behind the scheduled sync boundary; sync groups validate and stage data before replacing stale rows.

**Tech Stack:** Next/Vinext, React 19, TypeScript, Cloudflare Workers/D1, Bun tests, Playwright, Tolgee, existing static manifests in `app/products`, `views/academy`, and `views/insights`.

---

## Scope and execution order

The work is split into four dependent subprojects, but this plan keeps them in one sequence because
the public API contract, asset resolver, sync boundary, and page wiring must be released together
to preserve the requested architecture:

1. **Contracts and assets:** pure normalizers, static fallback indexes, and tests.
2. **D1 public API and sync:** complete response contracts, explicit not-found behavior, D1-only
   request paths, safe cron replacement, and D1 authentication/portal writes.
3. **Views and Tolgee:** wire every affected page to the stable contracts, repair forms, and
   remove user-facing literal copy.
4. **Regression validation:** dynamic route/image/locale coverage and final existing checks.

Do not reset or overwrite pre-existing user changes. Before each commit, stage only the paths
listed by that task.

## File map

### Create

- `lib/content-normalizers.ts` — slug/category/value/URL normalization shared by server and tests.
- `server/db/public-content.ts` — typed D1-to-view contract repository and static baseline merge.
- `tests/unit/content-normalizers.test.ts` — pure normalization tests.
- `tests/unit/public-content.test.ts` — sparse/complete/malformed/unknown D1 row contract tests.
- `tests/unit/content-assets.test.ts` — image resolver and gallery existence tests.
- `tests/unit/sync-safety.test.ts` — failure/empty-batch sync preservation tests.
- `tests/e2e/dynamic-content-regressions.spec.ts` — localized dynamic pages, image status, and
  not-found coverage.

### Modify

- `lib/static-assets.ts` — verified asset manifest and safe cover/gallery/academy/insight resolvers.
- `server/db/d1.ts` — complete row types, D1 reads, account lookup, and transactional replacement
  helpers.
- `server/db/schema.sql` — only additive sync metadata or missing D1 columns required by the
  implementation.
- `server/api/portal.ts` — public handlers, D1-only portal/auth paths, contact route, cache
  behavior, and sync helper boundaries.
- `server/jobs/feishu-sync.ts` — cron orchestration and last-good-data-preserving sync reporting.
- `app/products/page.tsx` — normalized product overview payload.
- `app/products/revenue-king/page.tsx` — normalized category cards and filters.
- `app/products/elite-flagship/page.tsx` — normalized category cards and filters.
- `app/products/utility-pro/page.tsx` — normalized category cards and filters.
- `app/products/[category]/[slug]/page.tsx` — complete detail contract and 404 state.
- `app/products/_VehicleDetail.tsx` — shared safe gallery and image error fallback.
- `views/academy.tsx` — shared lesson image resolver and normalized list payload.
- `views/academy/ev-fundamentals.tsx` — normalized category payload and images.
- `views/academy/dealer-playbook.tsx` — normalized category payload and images.
- `views/academy/technical-workshop.tsx` — normalized category payload and images.
- `views/academy/[category]/[slug].tsx` — lesson image/content contract and not-found behavior.
- `views/insights.tsx` — normalized insight list and verified covers.
- `views/insights/[slug].tsx` — normalized detail, inline image resolution, and not-found behavior.
- `views/insights/insightImages.ts` — shared verified cover resolver.
- `views/contact.tsx` — one real submit handler, named fields, translated form states.
- `components/MarkdownRenderer.tsx` — safe local image URL normalization if required by current
  renderer API.
- `i18n/translations/{zh,en,am}.ts` — keys needed by repaired states and forms.
- `tests/integration/academy-detail-query.test.ts` — contract-based D1/not-found assertions.
- `tests/integration/insight-detail-query.test.ts` — contract-based D1/not-found assertions.
- `tests/integration/new-base-runtime.test.ts` — boundary assertions updated for the new repository.
- `tests/integration/portal-role-fob-price.test.ts` — D1-backed role pricing instead of Feishu mocks.
- `tests/integration/better-auth-feishu.test.ts` — rename/rewrite assumptions to D1 account storage.
- `tests/integration/quote-request-submission.test.ts` — D1 transactional submission behavior.
- `tests/integration/inquiry-lead-pipeline.test.ts` — contact/inquiry D1 persistence.
- `tests/e2e/i18n-strict-isolation.spec.ts` — dynamic paths and CSS/background image collection.

## Task 1: Add normalization primitives and tests

**Files:**
- Create: `lib/content-normalizers.ts`
- Create: `tests/unit/content-normalizers.test.ts`

- [ ] **Step 1: Write failing normalization tests**

Add tests for canonical product categories, slug extraction, safe JSON parsing, and URL handling:

```ts
import { describe, expect, test } from "bun:test";
import {
  normalizeProductCategory,
  normalizeProductSlug,
  normalizeAssetUrl,
  parseJsonArray,
} from "../../lib/content-normalizers";

describe("content normalizers", () => {
  test("maps source segment and product path aliases to the three UI categories", () => {
    expect(normalizeProductCategory("ride-hailing", "/products/revenue-king/byd-seagull"))
      .toBe("revenue-king");
    expect(normalizeProductCategory("旗舰", "/products/elite-flagship/byd-seal"))
      .toBe("elite-flagship");
    expect(normalizeProductCategory("commercial", "/products/utility-pro/byd-shark"))
      .toBe("utility-pro");
  });

  test("normalizes route and database product identifiers to the same slug", () => {
    expect(normalizeProductSlug(" /products/revenue-king/BYD Seagull/ ")).toBe("byd-seagull");
    expect(normalizeProductSlug("byd_seagull")).toBe("byd-seagull");
  });

  test("rejects route-relative and Feishu asset URLs", () => {
    expect(normalizeAssetUrl("hero.webp")).toBeNull();
    expect(normalizeAssetUrl("https://open.feishu.cn/file/abc")).toBeNull();
    expect(normalizeAssetUrl("/pic/hero/0.webp")).toBe("/pic/hero/0.webp");
  });

  test("returns a typed empty value for malformed JSON", () => {
    expect(parseJsonArray("{bad json}")).toEqual([]);
    expect(parseJsonArray('["one", 2]')).toEqual(["one"]);
  });
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `bun test tests/unit/content-normalizers.test.ts`

Expected: FAIL because `lib/content-normalizers.ts` and its exports do not exist.

- [ ] **Step 3: Implement the pure normalizers**

Create the exact public types and functions used by later tasks:

```ts
export type PublicProductCategory = "revenue-king" | "elite-flagship" | "utility-pro";

const CATEGORY_ALIASES: Record<string, PublicProductCategory> = {
  "revenue-king": "revenue-king",
  revenue: "revenue-king",
  "ride-hailing": "revenue-king",
  "elite-flagship": "elite-flagship",
  flagship: "elite-flagship",
  luxury: "elite-flagship",
  "utility-pro": "utility-pro",
  utility: "utility-pro",
  commercial: "utility-pro",
};

export function normalizeProductSlug(value: string | null | undefined): string {
  return (value ?? "")
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/^products\/(?:revenue-king|elite-flagship|utility-pro)\//, "")
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/-+/g, "-");
}

export function normalizeProductCategory(
  segment: string | null | undefined,
  productPath?: string | null,
): PublicProductCategory | null {
  const pathCategory = productPath?.match(
    /\/products\/(revenue-king|elite-flagship|utility-pro)(?:\/|$)/i,
  )?.[1];
  const raw = (pathCategory || segment || "").trim().toLowerCase();
  return CATEGORY_ALIASES[raw] ?? null;
}

export function normalizeAssetUrl(value: string | null | undefined): string | null {
  const clean = value?.trim();
  if (!clean || clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean?.startsWith("https://images.unsplash.com/") ? clean : null;
  }
  return clean.startsWith("/pic/") ? clean : null;
}

export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}
```

Use the repository’s existing formatting conventions and extend the parser with typed object
helpers rather than adding `any` casts.

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `bun test tests/unit/content-normalizers.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit only the normalization task**

```bash
git add lib/content-normalizers.ts tests/unit/content-normalizers.test.ts
git commit -m "refactor: add public content normalizers

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 2: Make the static asset resolver authoritative

**Files:**
- Modify: `lib/static-assets.ts`
- Create: `tests/unit/content-assets.test.ts`
- Modify: `views/insights/insightImages.ts`

- [ ] **Step 1: Write failing asset tests**

Test every generated gallery URL against the checked-in public directory and verify all dynamic
content types have absolute local fallbacks:

```ts
import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  getVehicleGalleryImages,
  getVehicleModelImage,
  resolveLessonImage,
  resolveInsightImage,
} from "../../lib/static-assets";

const root = join(import.meta.dir, "../../public");

describe("verified public assets", () => {
  test("all known vehicle gallery paths exist", () => {
    for (const slug of ["byd-seagull", "zeekr-9x", "hongqi-e-hs9"]) {
      for (const image of getVehicleGalleryImages(slug)) {
        expect(existsSync(join(root, image.src.slice(1))), image.src).toBe(true);
      }
    }
  });

  test("database basenames never become relative URLs", () => {
    expect(resolveLessonImage("technical-workshop", "lesson-a", "hero.webp"))
      .toMatch(/^\/pic\//);
    expect(resolveInsightImage("unknown-article", "cover.webp"))
      .toMatch(/^\/pic\//);
    expect(getVehicleModelImage("unknown-model", "hero.webp"))
      .toBe("/pic/hero/0.webp");
  });
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `bun test tests/unit/content-assets.test.ts`

Expected: FAIL because lesson/insight resolvers are not exported and some generated gallery
paths do not exist.

- [ ] **Step 3: Replace assumed numbered galleries with manifest-backed resolution**

Extend `lib/static-assets.ts` with explicit verified gallery entries and shared content resolvers:

```ts
export function resolveLessonImage(
  category: string,
  slug: string,
  rawImage?: string | null,
): string {
  const local = normalizeAssetUrl(rawImage);
  if (local) return local;
  return LESSON_IMAGE_MAP[`${category}/${slug}`]
    ?? ACADEMY_FALLBACK_IMAGE;
}

export function resolveInsightImage(slug: string, rawImage?: string | null): string {
  const local = normalizeAssetUrl(rawImage);
  if (local) return local;
  return INSIGHT_IMAGE_MAP[slug] ?? "/pic/hero/0.webp";
}

export function getVehicleGalleryImages(
  slug: string,
  primaryImg?: string,
): Array<{ src: string; cat: string; label: string }> {
  const cover = getVehicleModelImage(slug, primaryImg);
  const configured = VEHICLE_GALLERY_MAP[slug];
  return configured?.length
    ? [{ src: cover, cat: "Exterior", label: "Front Angle" }, ...configured]
    : [{ src: cover, cat: "Exterior", label: "Main Profile" }];
}
```

Populate `VEHICLE_GALLERY_MAP`, `LESSON_IMAGE_MAP`, and `INSIGHT_IMAGE_MAP` only with paths
verified in `public/pic`; use the already-existing fallback image when no entry is known. Keep
brand names and static image paths ASCII-safe and do not emit raw Feishu URLs.

- [ ] **Step 4: Make insight image lookup use the shared resolver**

Update `views/insights/insightImages.ts` so its public `getInsightImage()` delegates to
`resolveInsightImage()` and retains its current known-slug map. Do not let a basename such as
`cover.webp` pass through unchanged.

- [ ] **Step 5: Run the focused tests and verify they pass**

Run: `bun test tests/unit/content-assets.test.ts`

Expected: PASS with zero missing paths.

- [ ] **Step 6: Commit the asset task**

```bash
git add lib/static-assets.ts views/insights/insightImages.ts tests/unit/content-assets.test.ts
git commit -m "fix: resolve dynamic content assets from verified manifest

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 3: Define and implement the typed public D1 repository

**Files:**
- Create: `server/db/public-content.ts`
- Modify: `server/db/d1.ts`
- Create: `tests/unit/public-content.test.ts`

- [ ] **Step 1: Write failing contract tests**

Use a small fake D1 database with `prepare().all()` and `prepare().bind().first()` methods. Cover
an empty table, a sparse row, a complete row, malformed JSON, and an unknown slug:

```ts
import { describe, expect, test } from "bun:test";
import {
  getPublicProduct,
  listPublicProducts,
  getPublicInsight,
  getPublicAcademyLesson,
} from "../../server/db/public-content";

test("sparse product rows preserve the old card contract", async () => {
  const db = fakeD1({
    vehicle_models: [{
      id: "model-1",
      model_id: "byd-seagull",
      brand: "BYD",
      model: "Seagull",
      segment: "ride-hailing",
      product_path: "/products/revenue-king/byd-seagull",
      image_url: "hero.webp",
    }],
  });
  const products = await listPublicProducts(db);
  expect(products.find((item) => item.slug === "byd-seagull")).toMatchObject({
    category: "revenue-king",
    img: "/pic/revenue-king/seagull/7.webp",
    battery: expect.any(String),
    range: expect.any(String),
    tags: expect.any(Array),
  });
});

test("unknown dynamic slugs return null instead of the first baseline item", async () => {
  const db = fakeD1({ articles: [] });
  expect(await getPublicInsight(db, "does-not-exist")).toBeNull();
  expect(await getPublicAcademyLesson(db, "workshop", "does-not-exist")).toBeNull();
  expect(await getPublicProduct(db, "does-not-exist")).toBeNull();
});
```

The test helper should return only rows explicitly requested by the SQL table name; it must not
call the real network or Feishu.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `bun test tests/unit/public-content.test.ts`

Expected: FAIL because `server/db/public-content.ts` does not exist.

- [ ] **Step 3: Define stable public contracts**

Export these contracts from `server/db/public-content.ts` and keep their property names aligned
with the existing view consumers:

```ts
export interface PublicProductCard {
  slug: string;
  category: PublicProductCategory;
  brand: string;
  name: string;
  fob: string;
  battery: string;
  batteryType: string;
  range: string;
  charging: string;
  img: string;
  status: string;
  statusText: string;
  link: string;
  tags: string[];
  sortOrder: number;
}

export interface PublicProductDetail {
  modelId: string;
  slug: string;
  vehicle: PublicProductCard;
  category: PublicProductCategory;
  title: string;
  subtitle: string;
  heroDesc: string;
  stat1Label: string;
  stat1Value: string;
  stat2Label: string;
  stat2Value: string;
  stat3Label: string;
  stat3Value: string;
  whyTitle: string;
  whyDesc: string;
  features: Array<{ icon: string; title: string; desc: string }>;
  specsLeft: Array<{ label: string; value: string; green?: boolean; gold?: boolean }>;
  specsRight: Array<{ label: string; value: string; green?: boolean; gold?: boolean }>;
  fits: Array<{ icon: string; title: string; desc: string; accent: string }>;
  relatedModels: Array<{ name: string; href: string }>;
  tags: string[];
  galleryImages: Array<{ src: string; cat: string; label: string }>;
  trimComparison?: Record<string, unknown>;
}
```

Add equivalent `PublicInsightSummary`, `PublicInsightArticle`, `PublicAcademyLesson`, and
`PublicAcademyPayload` types based on the existing `Article`/`Lesson` interfaces, rather than
passing raw `D1Article` rows to React.

- [ ] **Step 4: Implement manifest-indexed D1 overlay**

Import the existing static vehicle arrays and use normalized slug identity:

```ts
const STATIC_PRODUCTS = [
  ...revenueKingVehicles.map((item) => ({ ...item, category: "revenue-king" as const })),
  ...eliteFlagshipVehicles.map((item) => ({ ...item, category: "elite-flagship" as const })),
  ...utilityProVehicles.map((item) => ({ ...item, category: "utility-pro" as const })),
];

export async function listPublicProducts(db: D1Database): Promise<PublicProductCard[]> {
  const rows = await queryVehicleModels(db);
  const bySlug = new Map(rows.map((row) => [
    normalizeProductSlug(row.product_path || row.model_id || row.model),
    row,
  ]));

  return STATIC_PRODUCTS.map((baseline, sortOrder) => {
    const row = bySlug.get(normalizeProductSlug(baseline.link));
    return mapProductCard(baseline, row, sortOrder);
  });
}
```

Implement `mapProductCard`, `getPublicProduct`, insight mapping, and academy mapping in the same
file. Merge non-empty D1 scalar values over baseline values, parse only known JSON shapes, resolve
all images through `lib/static-assets.ts`, and append validated D1-only products after the static
baseline. Never use `rows[0]` for a requested slug.

- [ ] **Step 5: Run the focused tests and verify they pass**

Run: `bun test tests/unit/public-content.test.ts`

Expected: PASS for sparse, complete, malformed, empty, and unknown-slug cases.

- [ ] **Step 6: Commit the contract task**

```bash
git add server/db/public-content.ts server/db/d1.ts tests/unit/public-content.test.ts
git commit -m "feat: add typed D1 public content contracts

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 4: Replace public handlers with D1-only normalized responses

**Files:**
- Modify: `server/api/portal.ts`
- Modify: `tests/integration/academy-detail-query.test.ts`
- Modify: `tests/integration/insight-detail-query.test.ts`
- Modify: `tests/integration/new-base-runtime.test.ts`

- [ ] **Step 1: Write response-contract and no-Feishu assertions**

Replace source-regex-only checks with handler tests that inject fake `PORTAL_DB` and fail if
`globalThis.fetch` receives a Feishu URL:

```ts
test("unknown public detail returns 404 and does not query Feishu", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    throw new Error(`unexpected network request: ${String(input)}`);
  };
  try {
    const response = await handlePortalRequest(
      new Request("https://local/api/portal/public/insights/missing"),
      { PORTAL_DB: fakeD1({ articles: [] }) },
    );
    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ error: "Not found" });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
```

- [ ] **Step 2: Run the affected integration tests and verify the new assertions fail**

Run: `bun test tests/integration/academy-detail-query.test.ts tests/integration/insight-detail-query.test.ts tests/integration/new-base-runtime.test.ts`

Expected: FAIL because the current handlers return incompatible sparse shapes, source fallbacks,
or first-item fallback behavior.

- [ ] **Step 3: Route the public endpoints through the repository**

Replace the bodies of `handlePublicProducts`, `handlePublicProduct`,
`handlePublicInsights`, `handlePublicInsight`, `handlePublicAcademy`, and
`handlePublicAcademyLesson` with repository calls:

```ts
async function handlePublicProduct(slug: string, env: Env): Promise<Response> {
  const product = await getPublicProduct(env.PORTAL_DB, slug);
  if (!product) return problem("Not found", 404);
  return json(product);
}
```

Apply the same explicit `null -> 404` rule to insight and academy detail handlers. Keep list
response wrappers exactly as the current views consume them, and update only the mapping module
when possible.

- [ ] **Step 4: Remove request-time Feishu calls**

Delete the `handleGetVehicles` empty-D1 Feishu fallback and any public-handler import/use of
`searchRecords`, `feishuRequest`, `createRecord`, `updateRecord`, or Feishu auth. Public handlers
may return static baselines through `server/db/public-content.ts` when D1 has no rows.

- [ ] **Step 5: Add contact routing and validation**

Add this branch before the authenticated portal branches:

```ts
if (path === "/api/portal/public/contact" && request.method === "POST") {
  return await handlePublicContact(request, env);
}
```

`handlePublicContact` must parse JSON, require `name`, `company`, and a valid `email`, cap
`message` at the repository’s existing request size limit, insert one D1 inquiry/lead row, and
return `{ ok: true }`. Invalid input returns `problem("Invalid contact request", 400)`;
database errors are logged with the endpoint and return a 500 response, not a success-shaped
fallback.

- [ ] **Step 6: Run integration tests and verify they pass**

Run: `bun test tests/integration/academy-detail-query.test.ts tests/integration/insight-detail-query.test.ts tests/integration/new-base-runtime.test.ts tests/integration/inquiry-lead-pipeline.test.ts`

Expected: PASS with explicit 404s, normalized fields, and no Feishu network calls.

- [ ] **Step 7: Commit the public API task**

```bash
git add server/api/portal.ts tests/integration/academy-detail-query.test.ts tests/integration/insight-detail-query.test.ts tests/integration/new-base-runtime.test.ts
git commit -m "fix: serve public content from normalized D1 contracts

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 5: Make Feishu synchronization last-good-data preserving

**Files:**
- Modify: `server/jobs/feishu-sync.ts`
- Modify: `server/api/portal.ts`
- Modify: `server/db/d1.ts`
- Create: `tests/unit/sync-safety.test.ts`
- Modify: `server/db/schema.sql` only if sync metadata is added

- [ ] **Step 1: Write failure-preservation tests**

Test the group runner with injected fetchers and D1 spies:

```ts
test("transport failure does not delete the existing D1 batch", async () => {
  const db = fakeD1WithExistingRows("vehicle_models", [{ id: "keep-me" }]);
  await expect(runValidatedSyncGroup({
    name: "vehicle_models",
    fetchRows: async () => { throw new Error("Feishu unavailable"); },
    validateRows: validateVehicleModelRows,
    replaceRows: (rows) => replaceVehicleModels(db, rows),
  })).rejects.toThrow("Feishu unavailable");
  expect(await db.rows("vehicle_models")).toEqual([{ id: "keep-me" }]);
});

test("unexpected empty source is skipped", async () => {
  const db = fakeD1WithExistingRows("articles", [{ id: "keep-article" }]);
  const result = await runValidatedSyncGroup({
    name: "articles",
    fetchRows: async () => [],
    validateRows: validateArticleRows,
    replaceRows: (rows) => replaceArticles(db, rows),
  });
  expect(result.status).toBe("skipped-empty");
  expect(await db.rows("articles")).toHaveLength(1);
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `bun test tests/unit/sync-safety.test.ts`

Expected: FAIL because the validated sync runner and replacement helpers do not exist.

- [ ] **Step 3: Implement validation-before-replacement**

Add a typed helper in `server/db/d1.ts` that receives the complete atomic statement list for a
table. Each table-specific caller must put its upserts and stale-row deletes in that list:

```ts
export async function replaceRowsAfterValidation<T>(
  db: D1Database,
  rows: readonly T[],
  validate: (rows: readonly T[]) => void,
  buildStatements: (rows: readonly T[]) => D1PreparedStatement[],
): Promise<void> {
  validate(rows);
  if (rows.length === 0) throw new Error("validated replacement cannot be empty");
  await db.batch(buildStatements(rows));
}
```

Use actual D1 batched statements for the write/delete boundary in each concrete table helper.
Validation must require a stable source ID for every row and reject duplicate IDs. Build the
stale-row delete statements from the validated source-ID set, so a successful batch atomically
upserts the accepted rows and removes only rows no longer present in that source.

- [ ] **Step 4: Update every sync group**

In `server/api/portal.ts`, make `syncVehicleModelsToDB`, `syncVehiclesToD1`,
`syncUsersToD1`, `syncArticlesToD1`, and `syncAcademyToD1`:

1. propagate fetch/auth errors;
2. reject unexpected empty arrays before any delete;
3. validate IDs and required fields;
4. upsert the validated set;
5. delete stale IDs only after upsert succeeds;
6. return counts and `syncedAt`.

Do not turn a failed fetch into `[]`. In `server/jobs/feishu-sync.ts`, retain independent group
logging so one failed source does not suppress healthy groups, but return per-group status in the
existing result object.

- [ ] **Step 5: Add sync metadata only if it is needed by the UI**

If the portal empty state needs the last successful time, add an additive table:

```sql
CREATE TABLE IF NOT EXISTS sync_runs (
  source TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  row_count INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  error TEXT
);
```

Write it only after a group commits. Do not delete or rename existing production tables.

- [ ] **Step 6: Run sync tests and portal integration tests**

Run: `bun test tests/unit/sync-safety.test.ts tests/integration/portal-role-fob-price.test.ts tests/integration/quote-request-submission.test.ts`

Expected: PASS; a mocked Feishu failure leaves old rows and role-specific D1 pricing remains
unchanged.

- [ ] **Step 7: Commit the sync task**

```bash
git add server/jobs/feishu-sync.ts server/api/portal.ts server/db/d1.ts server/db/schema.sql tests/unit/sync-safety.test.ts
git commit -m "fix: preserve last good D1 content during sync

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 6: Repair D1 authentication and portal transaction paths

**Files:**
- Modify: `server/db/d1.ts`
- Modify: `server/api/portal.ts`
- Modify: `tests/integration/better-auth-feishu.test.ts`
- Modify: `tests/integration/portal-role-fob-price.test.ts`
- Modify: `tests/integration/quote-request-submission.test.ts`
- Modify: `tests/integration/inquiry-lead-pipeline.test.ts`
- Modify: `app/portal/page.tsx`

- [ ] **Step 1: Write the failing D1 account lookup test**

```ts
test("login reads account.password joined to user", async () => {
  const account = await findLoginAccount(fakeD1({
    user: [{ id: "u1", email: "buyer@example.com", status: "Active" }],
    account: [{ userId: "u1", password: "hashed-secret" }],
  }), "buyer@example.com");
  expect(account).toMatchObject({ userId: "u1", password: "hashed-secret" });
});
```

The test must also assert that SQL does not reference `access_code` or `password_hash`, because
those columns are absent from `server/db/schema.sql`.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `bun test tests/integration/better-auth-feishu.test.ts`

Expected: FAIL because the current query targets the wrong schema and still assumes Feishu auth.

- [ ] **Step 3: Implement schema-matching login and D1 transaction helpers**

Use an explicit join:

```sql
SELECT u.id AS user_id, u.email, u.name, u.company, u.role, u.account_type,
       u.price_tier, u.status, a.password
FROM user u
JOIN account a ON a.userId = u.id
WHERE lower(u.email) = lower(?) AND u.status = 'Active'
LIMIT 1
```

Implement inquiry/quote/order writes against the existing D1 tables, preserving current role
visibility and price-term behavior. Every handler must get its user/session from D1-backed
session state and must not fall back to Feishu for a missing row.

- [ ] **Step 4: Add explicit portal empty/error states**

Update `app/portal/page.tsx` to distinguish:

```ts
if (loading) return <Loading text={t("portal.loading")} />;
if (error) return <ErrorState title={t("portal.errorTitle")} retry={reload} />;
if (catalog.vehicles.length === 0) {
  return <EmptyState title={t("portal.emptyTitle")} detail={t("portal.emptyDetail")} />;
}
```

Use existing portal components/styles; do not redesign the layout.

- [ ] **Step 5: Run portal/auth tests**

Run: `bun test tests/integration/better-auth-feishu.test.ts tests/integration/portal-role-fob-price.test.ts tests/integration/quote-request-submission.test.ts tests/integration/inquiry-lead-pipeline.test.ts`

Expected: PASS with no Feishu requests and preserved admin/partner/customer price visibility.

- [ ] **Step 6: Commit the portal boundary task**

```bash
git add server/db/d1.ts server/api/portal.ts app/portal/page.tsx tests/integration/better-auth-feishu.test.ts tests/integration/portal-role-fob-price.test.ts tests/integration/quote-request-submission.test.ts tests/integration/inquiry-lead-pipeline.test.ts
git commit -m "fix: complete D1-only portal authentication and transactions

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 7: Wire product pages to the normalized contract

**Files:**
- Modify: `app/products/page.tsx`
- Modify: `app/products/revenue-king/page.tsx`
- Modify: `app/products/elite-flagship/page.tsx`
- Modify: `app/products/utility-pro/page.tsx`
- Modify: `app/products/[category]/[slug]/page.tsx`
- Modify: `app/products/_VehicleDetail.tsx`

- [ ] **Step 1: Add a view-level fixture test**

In the existing component test style, render a sparse normalized product and assert the card
contains non-empty image, battery, range, price, and category link values. The fixture must use:

```ts
const product = {
  slug: "byd-seagull",
  category: "revenue-king",
  name: "Seagull",
  img: "/pic/revenue-king/seagull/7.webp",
  battery: "38.8 kWh",
  range: "405 km",
  link: "/products/revenue-king/byd-seagull",
};
```

- [ ] **Step 2: Run the view test and verify it fails**

Run: `bun test tests/component`

Expected: the new assertion fails against the current raw-response mapping or is unavailable
until the category component is exported through the existing test seam.

- [ ] **Step 3: Remove per-page raw D1 shape inference**

In each category page, map API data directly as `PublicProductCard` values and retain only
category-specific filtering/sorting. Do not use `segment`, `product_path`, or `image_url` inside
the page component:

```ts
const products = response.items
  .filter((item: PublicProductCard) => item.category === category)
  .sort((a, b) => a.sortOrder - b.sortOrder);
```

When the API list is partial, merge by `slug` with the static category manifest before rendering;
never replace the baseline with an empty partial response.

- [ ] **Step 4: Pass the complete detail contract**

In `[category]/[slug]/page.tsx`, handle API status:

```ts
if (response.status === 404) {
  return <NotFoundProduct />;
}
if (!response.ok) throw new Error("Failed to load product");
const detail: DetailData = await response.json();
return <VehicleDetail data={detail} />;
```

Do not cast raw API data to `DetailData`; import the shared contract or define a compatible
type-only adapter.

- [ ] **Step 5: Use verified gallery URLs in `_VehicleDetail.tsx`**

Use `getVehicleGalleryImages(data.slug, data.vehicle.img)` and add an `onError` handler that
replaces a failed local image with `/pic/hero/0.webp` once, without retry loops or silent blank
boxes.

- [ ] **Step 6: Run product tests**

Run: `bun test tests/unit tests/component`

Expected: PASS; all cards retain required content and gallery source URLs are verified local
paths.

- [ ] **Step 7: Commit the product page task**

```bash
git add app/products/page.tsx app/products/revenue-king/page.tsx app/products/elite-flagship/page.tsx app/products/utility-pro/page.tsx 'app/products/[category]/[slug]/page.tsx' app/products/_VehicleDetail.tsx
git commit -m "fix: restore normalized product catalog and detail pages

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 8: Repair academy, insights, and contact page wiring

**Files:**
- Modify: `views/academy.tsx`
- Modify: `views/academy/ev-fundamentals.tsx`
- Modify: `views/academy/dealer-playbook.tsx`
- Modify: `views/academy/technical-workshop.tsx`
- Modify: `views/academy/[category]/[slug].tsx`
- Modify: `views/insights.tsx`
- Modify: `views/insights/[slug].tsx`
- Modify: `components/MarkdownRenderer.tsx`
- Modify: `views/contact.tsx`

- [ ] **Step 1: Add failing route-state tests**

Add component assertions that:

```ts
expect(screen.queryByText("hero.webp")).toBeNull();
expect(screen.getByRole("heading", { name: /lesson not found/i })).toBeVisible();
expect(screen.getByRole("button", { name: /submit/i })).toBeEnabled();
```

The test fixtures must return `img: "hero.webp"` from the fake D1 response and a 404 response for
an unknown slug.

- [ ] **Step 2: Run the focused component tests and verify they fail**

Run: `bun test tests/component`

Expected: FAIL because category/detail pages render `hero.webp` directly, and the contact form
still uses an alert-only handler.

- [ ] **Step 3: Normalize academy images at the API boundary and view boundary**

Use the same resolver everywhere:

```ts
const image = resolveLessonImage(category, lesson.slug, lesson.img);
return <img src={image} alt={lesson.title} onError={handleLocalImageError} />;
```

Do not duplicate `"hero.webp"` special cases in individual category pages. In lesson detail, keep
the current not-found panel and ensure the sibling request cannot turn a valid lesson into an
error if it fails.

- [ ] **Step 4: Normalize insight covers and Markdown image sources**

Replace direct `coverImage`/inline Markdown paths with `resolveInsightImage()` and a renderer
normalizer that accepts only `/pic/...` or trusted Unsplash URLs. For a malformed source, use the
article hero image and preserve the text content.

- [ ] **Step 5: Replace the contact alert form**

Attach the existing `handleSubmit` to the actual rendered form, add names to all fields, and
include all collected values:

```tsx
<form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
  <input name="name" type="text" required className="form-input w-full" />
  <input name="company" type="text" required className="form-input w-full" />
  <input name="phone" type="tel" required className="form-input w-full" />
  <input name="email" type="email" required className="form-input w-full" />
  <select name="market" required className="form-input w-full">...</select>
  <select name="volume" required className="form-input w-full">...</select>
  <select name="interest" required className="form-input w-full">...</select>
  <textarea name="message" className="form-input w-full" />
  <button type="submit" disabled={loading}>{loading ? t("contact.form.submitting") : t("contact.form.submit")}</button>
</form>
```

Render translated success/error messages from state; do not use `alert` or hardcoded English.

- [ ] **Step 6: Run academy/insight/contact tests**

Run: `bun test tests/component tests/integration/academy-detail-query.test.ts tests/integration/insight-detail-query.test.ts tests/integration/inquiry-lead-pipeline.test.ts`

Expected: PASS with absolute image URLs, correct not-found state, and D1 contact persistence.

- [ ] **Step 7: Commit the content page task**

```bash
git add views/academy.tsx views/academy/ev-fundamentals.tsx views/academy/dealer-playbook.tsx views/academy/technical-workshop.tsx 'views/academy/[category]/[slug].tsx' views/insights.tsx 'views/insights/[slug].tsx' views/insights/insightImages.ts components/MarkdownRenderer.tsx views/contact.tsx
git commit -m "fix: restore academy insight and contact page content

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 9: Complete Tolgee key ownership for repaired states

**Files:**
- Modify: `i18n/translations/zh.ts`
- Modify: `i18n/translations/en.ts`
- Modify: `i18n/translations/am.ts`
- Modify: affected public/portal views from Tasks 7–8
- Test: `tests/unit/tolgee-best-practices.test.ts`
- Test: `tests/unit/translation-fallback.test.ts`

- [ ] **Step 1: Search for newly exposed user-facing literals**

Run:

```bash
rg -n 'placeholder="|>[^<{]*(Failed|Error|Loading|Submit|Something went wrong|Not found)|alert\(' views app components server
```

Expected: only intentional brand/product names, technical units, and existing translation data
remain after the audit.

- [ ] **Step 2: Add complete keys to all three static bundles**

Add matching keys for loading, error, empty, not-found, form submit, and portal sync states:

```ts
contact: {
  form: {
    submitting: "Submitting...",
    submit: "Submit enquiry",
    success: "Thanks. Our team will contact you shortly.",
    error: "We could not submit your enquiry. Please try again.",
  },
},
portal: {
  emptyTitle: "Catalog temporarily unavailable",
  emptyDetail: "The catalog will return after the next successful synchronization.",
}
```

Use the equivalent Chinese and Amharic translations in their bundles, then run the existing
Tolgee push command so `localhost:8085` owns the editable values.

- [ ] **Step 3: Run translation tests**

Run: `bun test tests/unit/tolgee-best-practices.test.ts tests/unit/translation-fallback.test.ts`

Expected: PASS without key names or cross-locale heading leakage.

- [ ] **Step 4: Commit translation changes**

```bash
git add i18n/translations/zh.ts i18n/translations/en.ts i18n/translations/am.ts views app components
git commit -m "fix: move repaired UI states into Tolgee keys

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

Only stage files changed by this task; do not include unrelated user edits in the broad `views`
or `app` path.

## Task 10: Add dynamic route and image regression coverage

**Files:**
- Create: `tests/e2e/dynamic-content-regressions.spec.ts`
- Modify: `tests/e2e/i18n-strict-isolation.spec.ts`

- [ ] **Step 1: Add dynamic localized routes**

Use known baseline slugs from the static manifests:

```ts
const DYNAMIC_PAGES = [
  "/products/revenue-king/byd-seagull",
  "/products/elite-flagship/byd-seal",
  "/products/utility-pro/byd-shark",
  "/insights/ethiopia-ev-tax-policy-2026",
  "/academy/technical-workshop/high-voltage-safety-ev-technicians",
];
```

These slugs are present in the current baseline data: `getBaselineArticles()` defines
`ethiopia-ev-tax-policy-2026`, and `getBaselineAcademy()` defines
`high-voltage-safety-ev-technicians` under the `workshop` category. The route path is
`/academy/technical-workshop/...`; the API category adapter must map that route to `workshop`.

- [ ] **Step 2: Test dynamic page status, image URLs, and not-found behavior**

```ts
test("dynamic pages render complete content and no route-relative images", async ({ page, request }) => {
  for (const locale of ["zh", "en", "am"]) {
    for (const path of DYNAMIC_PAGES) {
      const response = await page.goto(`/${locale}${path}`, { waitUntil: "networkidle" });
      expect(response?.status()).toBeLessThan(400);
      const sources = await page.locator("img").evaluateAll((images) =>
        images.map((image) => (image as HTMLImageElement).src),
      );
      expect(sources.every((src) => !src.endsWith("/hero.webp"))).toBe(true);
      for (const source of new Set(sources.filter((src) => src.includes("/pic/")))) {
        expect((await request.get(source)).status()).toBe(200);
      }
    }
  }
});

test("unknown dynamic slug does not display the first article", async ({ page }) => {
  const response = await page.goto("/en/insights/definitely-missing");
  expect(response?.status()).toBe(404);
  await expect(page.getByText(/not found/i)).toBeVisible();
});
```

- [ ] **Step 3: Extend strict isolation to background images**

In `tests/e2e/i18n-strict-isolation.spec.ts`, collect `src` values from `<img>`,
`background-image` declarations, and `MarkdownRenderer` images. Check unique local `/pic/` URLs
with `request.get()` and keep the existing locale leakage assertions.

- [ ] **Step 4: Run E2E against the existing dev server configuration**

Run: `bun run test:e2e -- tests/e2e/dynamic-content-regressions.spec.ts tests/e2e/i18n-strict-isolation.spec.ts`

Expected: PASS for all three locales, all known dynamic routes, and zero local image 404s.

- [ ] **Step 5: Commit E2E coverage**

```bash
git add tests/e2e/dynamic-content-regressions.spec.ts tests/e2e/i18n-strict-isolation.spec.ts
git commit -m "test: cover dynamic content and rendered asset regressions

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Task 11: Final boundary audit and validation

**Files:**
- Modify: `tests/integration/new-base-runtime.test.ts`
- Modify: any implementation file still found by the searches below.

- [ ] **Step 1: Audit request-time Feishu references**

Run:

```bash
rg -n 'searchRecords|feishuRequest|createRecord|updateRecord|createFeishuAuth|FEISHU_' server/api views app
```

Expected: no Feishu client/auth/source-table calls under request-time handlers. References may
remain in cron-only sync modules, protected operational sync routing, and configuration tests.

- [ ] **Step 2: Audit dangerous fallback and image patterns**

Run:

```bash
rg -n 'rows\\[0\\]|hero\\.webp|/1\\.webp|/2\\.webp|/3\\.webp|alert\\(' server app views components lib
```

Expected: no first-row fallback in dynamic detail handlers, no unqualified `hero.webp` render,
no assumed gallery numbering without a manifest entry, and no alert-only form submission.

- [ ] **Step 3: Run the smallest complete existing validation set**

Run:

```bash
bun run test
bun run check
bun run lint
bun run build
```

Expected: all commands exit 0. If a command exposes a type or lint issue introduced by these
tasks, fix the implementation rather than weakening the check or adding a cast.

- [ ] **Step 4: Run the complete browser suite**

Run: `bun run test:e2e`

Expected: all existing and new localized page, portal, dynamic content, translation, and image
tests pass.

- [ ] **Step 5: Review the final diff and commit only task-owned files**

Run:

```bash
git status --short
git diff --check
git diff --stat
```

Confirm pre-existing user modifications remain present and unmodified except where a task
explicitly required integration. Stage exact paths, then create the final commit:

```bash
git add lib server app views components i18n tests
git commit -m "fix: complete post-refactor page and data boundary repair

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

Before staging the broad directories, inspect `git diff` and remove unrelated paths from the
staging set; the final commit must not absorb unrelated work.

## Completion criteria

- Every localized public route and authenticated portal/dashboard route renders the preserved
  pre-refactor sections with non-empty normalized content.
- All dynamic image sources are verified `/pic/...` paths or explicitly trusted external URLs;
  no route-relative `hero.webp` or assumed missing gallery file is emitted.
- Unknown dynamic slugs return a real 404/not-found state.
- Public and portal request handlers read D1/static baselines only; Feishu is called only from
  scheduled or explicitly protected synchronization.
- Failed/empty syncs preserve the last valid D1 content.
- Login reads `user` + `account.password`, and portal role/price/inquiry behavior remains intact.
- User-facing repaired copy is represented by Tolgee keys in all supported locales.
- `bun run test`, `bun run check`, `bun run lint`, `bun run build`, and `bun run test:e2e` pass.
