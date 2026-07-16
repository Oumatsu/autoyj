# Products Overview i18n Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every translatable string on `/products` readable in Chinese and Amharic while preserving brands, model identifiers, technical names, numbers, and units.

**Architecture:** Add a pure overview-card translation layer that resolves slug-keyed model text and reusable short values before React renders cards. Store new translations in Feishu `I18n Locale`, sync them into generated locale dictionaries, and keep English/API values as safe fallbacks.

**Tech Stack:** React 19, TypeScript, Node test runner, Feishu Base via `lark-cli`, vinext.

## Global Constraints

- Scope is the `/products` overview only.
- Category titles must concatenate to the existing `nav.revenueKing`, `nav.eliteFlagship`, and `nav.utilityPro` values.
- Preserve Huawei, BYD, AITO, LiDAR, ADS 3.0, 800V, kW, km, model codes, and currency amounts.
- Feishu `I18n Locale` is the source of truth; generated locale dictionaries are not hand-maintained.
- Missing or malformed translations fall back to source text without throwing.
- Do not stage `tsconfig.tsbuildinfo`, `.dev.vars`, or `%SystemDrive%/`.

---

### Task 1: Pure overview card translation contract

**Files:**
- Create: `views/products/productsOverviewTranslations.ts`
- Modify: `views/products/catalogTranslations.ts`
- Test: `tests/products-overview-translations.test.mjs`

**Interfaces:**
- Consumes: translation function `(key: string, fallback?: string) => unknown` and raw API card data.
- Produces: `translateOverviewCard(card, t)` returning localized `name`, `desc`, `tag`, `label`, and normalized `tags`.
- Produces: `catalogCardValueKey(value: string): string` and model fields `cardTag | cardLabel`.

- [ ] **Step 1: Write the failing helper tests**

```js
assert.equal(catalogCardValueKey("405km Range"), "catalog.cardValues.405km-range");
assert.deepEqual(
  translateOverviewCard(rawCard, fakeT),
  { ...rawCard, name: "问界M9", desc: "华为 ADS 3.0 技术旗舰", tag: "性能旗舰", label: "科技巅峰", tags: [] },
);
assert.doesNotThrow(() => translateOverviewCard({ ...rawCard, tags: "bad" }, malformedT));
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `node --test tests/products-overview-translations.test.mjs`

Expected: failure because the helper module and `catalogCardValueKey` do not exist.

- [ ] **Step 3: Implement the minimal pure resolver**

```ts
export function translateOverviewCard(card: OverviewCard, t: TranslationFn): OverviewCard {
  const slug = String(card.slug || card.link?.split("/").pop() || "");
  return {
    ...card,
    name: translatedText(t, catalogModelKey(slug, "displayName"), card.name),
    desc: translatedText(t, catalogModelKey(slug, "cardHighlight"), card.desc),
    tag: translatedText(t, catalogModelKey(slug, "cardTag"), card.tag),
    label: translatedText(t, catalogModelKey(slug, "cardLabel"), card.label),
    tags: normalizeTags(card.tags).map((tag) => translatedText(t, catalogCardValueKey(tag), tag)),
  };
}
```

- [ ] **Step 4: Run the focused test and confirm GREEN**

Run: `node --test tests/products-overview-translations.test.mjs`

Expected: all helper tests pass.

---

### Task 2: Route every overview card field through the resolver

**Files:**
- Modify: `views/products.tsx`
- Test: `tests/products-overview-translations.test.mjs`
- Test: `tests/products-overview-utility-showcase.test.mjs`

**Interfaces:**
- Consumes: `translateOverviewCard(card, t)` from Task 1.
- Produces: translated revenue, elite, AITO M9, and utility card collections used by JSX.

- [ ] **Step 1: Add a failing source-contract test**

```js
assert.match(source, /translateOverviewCard/);
assert.doesNotMatch(source, /\{car\.desc\}/);
assert.doesNotMatch(source, /\{car\.tag\}/);
assert.doesNotMatch(source, /\{car\.label\}/);
assert.doesNotMatch(source, /\{car\.name\}/);
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `node --test tests/products-overview-translations.test.mjs`

Expected: source-contract assertions fail against direct raw field rendering.

- [ ] **Step 3: Localize the lists before rendering**

```ts
const localizedRevenueKingList = revenueKingList.map((card) => translateOverviewCard(card, t));
const localizedAitoM9 = translateOverviewCard(aitoM9, t);
const localizedEliteSmallList = eliteSmallList.map((card) => translateOverviewCard(card, t));
const localizedUtilityList = utilityList.map((card) => translateOverviewCard(card, t));
```

Use those collections in JSX, localize the hero image alternative text, and replace English savings concatenation with a translated placeholder formatter.

- [ ] **Step 4: Align category headings with navigation terminology**

Set Chinese and Amharic `products.*.heading + headingAccent` values so each concatenation equals the corresponding `nav.*` value while retaining the split-color layout.

- [ ] **Step 5: Run focused page tests**

Run: `node --test tests/products-overview-translations.test.mjs tests/products-overview-utility-showcase.test.mjs`

Expected: all focused tests pass and the three Utility Pro slugs remain intact.

---

### Task 3: Add only the missing Feishu translation rows

**Files:**
- Modify remotely: Base `Xvdfbpk7cadLrnsVCFFcHbhOnCb`, table `tblATd4EWHge1l1k` (`I18n Locale`)
- Generate: `i18n/translations/en.ts`
- Generate: `i18n/translations/zh.ts`
- Generate: `i18n/translations/am.ts`

**Interfaces:**
- Consumes: keys emitted by Tasks 1 and 2.
- Produces: string values for `catalog.models.<slug>.cardTag`, `catalog.models.<slug>.cardLabel`, `catalog.cardValues.*`, category heading fragments, savings templates, and accessible image text.

- [ ] **Step 1: Resolve existing rows by exact `Key`**

Use `lark-cli base +record-search --search-field Key` with minimal fields `Key`, `EN`, `ZH`, `AM`, `Module`, and `Linked Vehicle Model`. Update an exact match by `record_id`; create only when no exact match exists.

- [ ] **Step 2: Write model-specific rows**

For the ten featured slugs, add only meaningful `cardTag` and `cardLabel` rows. Link each model-specific row to its existing Vehicle Models record through `Linked Vehicle Model`. Preserve brands and technical names inside translated prose.

- [ ] **Step 3: Write shared short-value and page rows**

Create shared rows such as:

```json
{"Key":"catalog.cardValues.405km-range","EN":"405km Range","ZH":"405 公里续航","AM":"405 km የመንዳት ርቀት","Module":"产品"}
```

Update category heading fragments and add savings/accessibility templates under `products.*`. Do not create linked-model relationships for shared page values.

- [ ] **Step 4: Sync Base to local dictionaries**

Run: `npm run sync:i18n`

Expected: generated `en.ts`, `zh.ts`, and `am.ts` contain the new keys and no unrelated deletions.

- [ ] **Step 5: Verify locale coverage**

Run: `node --test tests/products-overview-translations.test.mjs tests/product-catalog-translations.test.mjs`

Expected: featured-model and shared-value coverage passes in all three dictionaries.

---

### Task 4: Full verification and handoff

**Files:**
- Review: all files changed by Tasks 1-3

**Interfaces:**
- Consumes: completed page and synced dictionaries.
- Produces: verified local implementation ready for an explicit push/deploy request.

- [ ] **Step 1: Run full tests**

Run: `npm test`

Expected: zero failing tests.

- [ ] **Step 2: Run compatibility/type checks**

Run: `npm run check`

Expected: exit code 0.

- [ ] **Step 3: Run a clean build**

Delete only the repository `dist` directory after verifying its resolved path, then run `npm run build`.

Expected: build exit code 0.

- [ ] **Step 4: Inspect the final diff**

Run: `git status --short`, `git diff --check`, and focused diffs for source, tests, and locale dictionaries. Confirm `.dev.vars`, `%SystemDrive%/`, and `tsconfig.tsbuildinfo` are not staged.

- [ ] **Step 5: Report without push or deployment**

Summarize translated surfaces, Base rows created/updated, tests, and build results. Do not push or deploy unless explicitly requested.
