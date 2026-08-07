# Tolgee Static Bundle Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `bun run tolgee:pull` export validated `zh`, `en`, and `am` translations from the configured Tolgee project into the checked-in static TypeScript bundles without adding a runtime Tolgee dependency.

**Architecture:** Keep Tolgee as the editing source and the Worker as a static-bundle consumer. Extend the existing sync script with a pull pipeline that exports one locale at a time, validates the complete key set and deletion policy, renders deterministic modules, and replaces files only after all locales pass. Configuration remains environment-based so `localhost:8085` can later be replaced by a hosted self-managed Tolgee URL.

**Tech Stack:** Bun/Node TypeScript script, Tolgee REST export API, native `fetch`/`fs`, Bun Test, existing Vite/Cloudflare build.

---

## File map

- Modify: `scripts/tolgee/sync.ts` — expose small pure helpers and implement `pull`.
- Create: `tests/unit/tolgee-sync.test.ts` — mock the export API and cover pull validation/write behavior.
- Modify: `.dev.vars.example` — document local Tolgee pull credentials and hosted URL substitution.
- Modify: `README.md` — document the edit, pull, review, commit, and deploy workflow.
- Create: `docs/superpowers/specs/2026-08-07-tolgee-static-bundle-sync-design.md` — record the approved design.
- Modify: `package.json` only if CLI argument forwarding needs an explicit script adjustment; preserve the existing `tolgee:pull` command.

### Task 1: Record the approved design

**Files:**
- Create: `docs/superpowers/specs/2026-08-07-tolgee-static-bundle-sync-design.md`

- [ ] **Step 1: Write the design specification**

Document the local-first workflow, Tolgee export endpoint, runtime boundary, validation rules,
`--allow-key-removal`, manual publication, configuration, and test acceptance criteria. Keep the
production behavior explicit: no Worker request calls Tolgee.

- [ ] **Step 2: Self-review the specification**

Review the document for unresolved requirements, contradictory runtime boundaries, and accidental
scope expansion. Expected: every design decision has a concrete behavior and no placeholder
language remains.

- [ ] **Step 3: Commit the design**

Run:

```bash
git add docs/superpowers/specs/2026-08-07-tolgee-static-bundle-sync-design.md
git commit -m "docs: design Tolgee static bundle sync"
```

Expected: one commit containing only the approved design document.

### Task 2: Add pure pull helpers and failing tests

**Files:**
- Modify: `scripts/tolgee/sync.ts`
- Create: `tests/unit/tolgee-sync.test.ts`

- [ ] **Step 1: Add test fixtures for nested locale exports**

Use a small nested fixture with one scalar, one numeric-keyed object, and one ICU-like string:

```ts
const zhExport = {
  nav: { home: "首页" },
  home: { steps: { "0": { title: "第一步" } } },
  greeting: "你好，{name}",
};
```

Mock `globalThis.fetch` so each locale export returns a `Response` containing its fixture JSON.
Write tests for exported pure helpers before wiring the command:

```ts
test("flattens nested exports with dot notation", () => {
  expect(flattenToDot(zhExport)).toEqual({
    "nav.home": "首页",
    "home.steps.0.title": "第一步",
    greeting: "你好，{name}",
  });
});

test("renders a default-export TypeScript module", () => {
  expect(renderTranslationModule("zh", zhExport)).toContain("const zh = {");
  expect(renderTranslationModule("zh", zhExport)).toContain("export default zh;");
});
```

Run:

```bash
bun test tests/unit/tolgee-sync.test.ts
```

Expected: FAIL because the helpers are not exported yet.

- [ ] **Step 2: Export deterministic pure helpers**

Keep the existing `flattenToDot` behavior and add typed exports for:

```ts
export function flattenToDot(
  obj: Record<string, unknown>,
  prefix = "",
): Record<string, string>;

export function renderTranslationModule(
  locale: string,
  data: Record<string, unknown>,
): string;

export function compareKeySets(
  locales: Record<string, Record<string, string>>,
  currentKeys: Set<string>,
  allowKeyRemoval: boolean,
): void;
```

`renderTranslationModule` must use stable two-space JSON indentation, preserve Unicode text, add a
trailing newline, and emit the current `const <locale> = ...; export default <locale>;` shape.
`compareKeySets` must reject locale mismatches, empty `zh` values, and removed current keys unless
the override flag is true.

- [ ] **Step 3: Run the helper tests**

Run:

```bash
bun test tests/unit/tolgee-sync.test.ts
```

Expected: PASS for flattening, rendering, locale symmetry, explicit empty-string preservation,
and key removal policy tests.

### Task 3: Implement the pull pipeline

**Files:**
- Modify: `scripts/tolgee/sync.ts`
- Modify: `tests/unit/tolgee-sync.test.ts`

- [ ] **Step 1: Add configuration and CLI parsing tests**

Cover:

```ts
test("rejects pull without TOLGEE_API_KEY", async () => {
  await expect(runPull({ apiKey: "", projectId: 42 })).rejects.toThrow("TOLGEE_API_KEY");
});

test("rejects pull without TOLGEE_PROJECT_ID", async () => {
  await expect(runPull({ apiKey: "test-key", projectId: 0 })).rejects.toThrow("TOLGEE_PROJECT_ID");
});

test("recognizes --allow-key-removal", () => {
  expect(parseArgs(["pull", "--allow-key-removal"])).toEqual({
    action: "pull",
    allowKeyRemoval: true,
  });
});
```

Use injected environment values or an exported `runPull` options object instead of mutating the
real developer environment.

- [ ] **Step 2: Add per-locale export request tests**

Assert that `runPull` calls:

```text
GET /v2/projects/{projectId}/export
  ?format=JSON
  &structureDelimiter=.
  &zip=false
  &languages=zh
```

once for each configured locale, with the `X-API-Key` header. Return a non-2xx `Response` and
assert that the error includes the locale, status, and response text.

- [ ] **Step 3: Implement export and validation**

Implement typed functions equivalent to:

```ts
const translationFiles = {
  zh: "i18n/translations/zh.ts",
  en: "i18n/translations/en.ts",
  am: "i18n/translations/am.ts",
} as const;

async function exportLocale(
  apiUrl: string,
  projectId: number,
  apiKey: string,
  locale: string,
): Promise<Record<string, unknown>> {
  const url = new URL(`/v2/projects/${projectId}/export`, apiUrl);
  url.searchParams.set("format", "JSON");
  url.searchParams.set("structureDelimiter", ".");
  url.searchParams.set("zip", "false");
  url.searchParams.set("languages", locale);

  const response = await fetch(url, { headers: { "X-API-Key": apiKey } });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Tolgee export failed for ${locale} (${response.status}): ${body}`);
  }

  const parsed: unknown = JSON.parse(body);
  if (!isRecord(parsed) || Object.keys(parsed).length === 0) {
    throw new Error(`Tolgee export for ${locale} is not a non-empty JSON object`);
  }
  return parsed;
}
```

Use the explicit project ID for pull; retain existing project discovery only where needed by
backward-compatible `push`/`verify` behavior. Validate all three locale results before rendering. Explicit empty strings are valid because the
current bundles use them for composition fields; missing keys and locale key-set mismatches remain
errors.

- [ ] **Step 4: Add dirty-file and atomic-write tests**

Mock the Git status check and filesystem writes. Assert that a dirty translation file rejects
before export and that a failure on the second locale leaves all three original files unchanged.
Assert that a successful pull writes all three generated modules.

- [ ] **Step 5: Implement dirty-file protection and atomic replacement**

Check staged, unstaged, and untracked status for only the three translation paths. Do not reject
unrelated changes. Render all files in memory, write same-directory temporary files, then rename
them after all validation has succeeded. Clean up temporary files on write failure and propagate the
original error.

- [ ] **Step 6: Wire `pull` into `main`**

Parse `process.argv.slice(2)`, run `pull` for the `pull` action, and preserve the existing `push`
and `verify` branches. Print the target server, locale counts, changed paths, and a clear manual
next step; exit non-zero for every rejected operation.

- [ ] **Step 7: Run focused sync tests**

Run:

```bash
bun test tests/unit/tolgee-sync.test.ts
```

Expected: PASS for success, configuration, HTTP, JSON, symmetry, explicit-empty-string,
dirty-file, atomic-write, and key-removal cases.

### Task 4: Update developer configuration and documentation

**Files:**
- Modify: `.dev.vars.example`
- Modify: `README.md`

- [ ] **Step 1: Update the environment example**

Explain that `TOLGEE_API_URL=http://localhost:8085` is the local default, `TOLGEE_API_KEY` and
`TOLGEE_PROJECT_ID` are required for pull/push, and a future hosted self-managed Tolgee only
requires replacing the URL and key. Do not add secrets.

- [ ] **Step 2: Add the publication workflow to README**

Add a short section with:

```bash
# edit translations in Tolgee
bun run tolgee:pull
git diff -- i18n/translations
# review and commit the generated bundle
bun run build
bun run deploy
```

Document `bun run tolgee:pull -- --allow-key-removal` as an intentional destructive override and
state that production does not call Tolgee at runtime.

- [ ] **Step 3: Run documentation-adjacent checks**

Run:

```bash
git diff --check
```

Expected: no whitespace errors.

### Task 5: Validate integration and preserve existing behavior

**Files:**
- Modify: none unless validation exposes a type error caused by the sync changes.

- [ ] **Step 1: Run the focused unit suite**

Run:

```bash
bun test tests/unit/tolgee-sync.test.ts tests/unit/tolgee-key-notation.test.ts tests/unit/translation-fallback.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run type/build checks**

Run:

```bash
bun run check
bun run build
```

Expected: both complete successfully; generated translation modules remain valid imports for
`lib/tolgee.ts`.

- [ ] **Step 3: Run the existing unit suite**

Run:

```bash
bun run test:unit
```

Expected: PASS with no regressions to translation fallback or page content tests.

- [ ] **Step 4: Inspect the final diff**

Run:

```bash
git diff --stat
git diff --check
git status --short
```

Expected: only the approved design, plan, script, test, README, and environment-example changes
are present; no secrets, generated backups, or temporary files are tracked.
