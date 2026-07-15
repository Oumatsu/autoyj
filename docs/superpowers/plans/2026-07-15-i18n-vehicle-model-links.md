# I18n Vehicle Model Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a one-time, database-only, bidirectional relation between the 94 model-specific `I18n Locale` records and their 47 corresponding `Vehicle Models` records.

**Architecture:** Use authenticated `lark-cli base` reads to build and validate an exact slug-to-record-ID map before any mutation. After the preflight passes, create one bidirectional link field and update each translation record by record ID; then re-read both tables and verify forward and reverse cardinality. No repository runtime code, Worker projection, frontend behavior, or ongoing sync automation changes.

**Tech Stack:** PowerShell 7, `lark-cli`, Feishu Base (`Xvdfbpk7cadLrnsVCFFcHbhOnCb`)

## Global Constraints

- Only keys matching `catalog.models.<slug>.displayName` or `catalog.models.<slug>.cardHighlight` may be linked.
- Match by the translation-key slug and the final segment of `Vehicle Models.Product Path`; do not match by translated names or `Model ID`.
- Abort before creating fields or updating records unless there are exactly 47 unique model slugs, 94 unique target keys, exactly two target translations per model, and a one-to-one slug match.
- Create `I18n Locale.Vehicle Model` as a bidirectional link to `Vehicle Models`, with reverse field `Vehicle Models.I18n Translations`.
- Do not change translation values, vehicle business data, Worker/API/frontend code, `vehicle_variants`, or the i18n synchronization flow.
- This is a one-time migration only.

---

### Task 1: Run the mutation-free preflight

**Files:**
- Reference: `docs/superpowers/specs/2026-07-15-i18n-vehicle-model-links-design.md`
- No repository files modified

**Interfaces:**
- Consumes: `Vehicle Models.Model ID`, `Vehicle Models.Product Path`, and `I18n Locale.Key` from live Base records
- Produces: an in-memory array of `{ translationRecordId, key, slug, vehicleRecordId, modelId }` mappings

- [ ] **Step 1: Confirm authentication and writable field names**

Run:

```powershell
lark-cli auth status
lark-cli base +field-list --base-token Xvdfbpk7cadLrnsVCFFcHbhOnCb --table-id tblJq4Un2LQQaFPU --format json
lark-cli base +field-list --base-token Xvdfbpk7cadLrnsVCFFcHbhOnCb --table-id tblATd4EWHge1l1k --format json
```

Expected: user identity is ready; `Product Path`, `Model ID`, and `Key` exist; neither `Vehicle Model` nor `I18n Translations` exists before migration.

- [ ] **Step 2: Read the complete projected record sets**

Run:

```powershell
$modelsJson = lark-cli base +record-list --base-token Xvdfbpk7cadLrnsVCFFcHbhOnCb --table-id tblJq4Un2LQQaFPU --field-id 'Model ID' --field-id 'Product Path' --limit 200 --format json
$i18nJson = lark-cli base +record-list --base-token Xvdfbpk7cadLrnsVCFFcHbhOnCb --table-id tblATd4EWHge1l1k --field-id Key --limit 200 --offset 0 --format json
```

If `I18n Locale` reports more than 200 records, repeat `+record-list` with offsets `200`, `400`, `600`, and `800`, then concatenate the returned record arrays in memory. Expected: all 47 vehicle records and all current i18n records are present.

- [ ] **Step 3: Build and validate the slug mapping**

Use the exact regular expression below for translation keys and trim trailing slashes before reading the final product-path segment:

```powershell
$keyPattern = '^catalog\.models\.(?<slug>[a-z0-9]+(?:-[a-z0-9]+)*)\.(?<kind>displayName|cardHighlight)$'
$modelSlug = { param($path) (($path.TrimEnd('/')) -split '/')[-1] }
```

Validate all of the following before continuing:

```text
unique vehicle slugs = 47
target translation keys = 94
unique target translation keys = 94
translations per slug = 2
kinds per slug = displayName + cardHighlight
vehicle matches per translation slug = 1
unmatched target translations = 0
```

Expected: a 94-row in-memory mapping and zero validation failures. On any failure, stop without creating either field.

- [ ] **Step 4: Dry-run the field creation request**

Run:

```powershell
lark-cli base +field-create --base-token Xvdfbpk7cadLrnsVCFFcHbhOnCb --table-id tblATd4EWHge1l1k --json '{"name":"Vehicle Model","type":"link","link_table":"tblJq4Un2LQQaFPU","bidirectional":true,"bidirectional_link_field_name":"I18n Translations"}' --dry-run
```

Expected: request targets only `tblATd4EWHge1l1k` and describes a bidirectional link to `tblJq4Un2LQQaFPU`.

### Task 2: Create the bidirectional field and write the 94 links

**Files:**
- No repository files modified

**Interfaces:**
- Consumes: the validated 94-row mapping from Task 1
- Produces: `I18n Locale.Vehicle Model` and `Vehicle Models.I18n Translations`, plus 94 forward links

- [ ] **Step 1: Create the link field once**

Run:

```powershell
lark-cli base +field-create --base-token Xvdfbpk7cadLrnsVCFFcHbhOnCb --table-id tblATd4EWHge1l1k --json '{"name":"Vehicle Model","type":"link","link_table":"tblJq4Un2LQQaFPU","bidirectional":true,"bidirectional_link_field_name":"I18n Translations"}' --format json
```

Expected: one new `link` field named `Vehicle Model` and one automatically generated reverse field named `I18n Translations`.

- [ ] **Step 2: Re-read both field definitions**

Run:

```powershell
lark-cli base +field-get --base-token Xvdfbpk7cadLrnsVCFFcHbhOnCb --table-id tblATd4EWHge1l1k --field-id 'Vehicle Model' --format json
lark-cli base +field-get --base-token Xvdfbpk7cadLrnsVCFFcHbhOnCb --table-id tblJq4Un2LQQaFPU --field-id 'I18n Translations' --format json
```

Expected: both fields are `link`, each points to the other table, and the relation is bidirectional. Stop before record writes if either definition is wrong.

- [ ] **Step 3: Update each target translation by record ID**

For each validated mapping row, run the equivalent of:

```powershell
$payload = @{ 'Vehicle Model' = @(@{ id = $row.vehicleRecordId }) } | ConvertTo-Json -Compress -Depth 5
lark-cli base +record-upsert --base-token Xvdfbpk7cadLrnsVCFFcHbhOnCb --table-id tblATd4EWHge1l1k --record-id $row.translationRecordId --json $payload --format json
```

Expected: 94 successful updates, each changing only `Vehicle Model`. Record `{ key, translationRecordId, vehicleRecordId }` for any failed command and stop further writes on the first failure so the same validated mapping can be rerun safely.

### Task 3: Verify forward and reverse relations

**Files:**
- No repository files modified

**Interfaces:**
- Consumes: live post-migration Base state
- Produces: an acceptance summary with exact counts and the AITO M9 sample

- [ ] **Step 1: Verify the 94 forward links**

Read all `I18n Locale` records projected to `Key` and `Vehicle Model`. Filter with the same key regular expression from Task 1.

Expected:

```text
target translations = 94
target translations with exactly one Vehicle Model = 94
non-target translations with a Vehicle Model = 0
```

- [ ] **Step 2: Verify the 47 reverse links**

Read all `Vehicle Models` projected to `Model ID`, `Product Path`, and `I18n Translations`.

Expected:

```text
vehicle models = 47
vehicle models with exactly two I18n Translations = 47
total reverse links = 94
```

Resolve the 94 reverse record IDs against `I18n Locale.Key` and verify each model's two keys use its product-path slug and end in `.displayName` and `.cardHighlight`.

- [ ] **Step 3: Verify the required AITO M9 example**

Read `Vehicle Models` record `recvo71bRgGhhf` and resolve its `I18n Translations` IDs.

Expected keys:

```text
catalog.models.aito-m9.displayName
catalog.models.aito-m9.cardHighlight
```

Verify `catalog.models.aito-m9.displayName` record `recvpqtGxzUZO2` links to `recvo71bRgGhhf`.

- [ ] **Step 4: Report the database-only result**

Report the created forward and reverse field IDs, the 94/94 successful forward-link count, the 47/47 reverse-cardinality count, and the AITO M9 sample. Do not push, deploy, or modify frontend code as part of this migration.
