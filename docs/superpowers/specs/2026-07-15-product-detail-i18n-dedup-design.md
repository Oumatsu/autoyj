# Vehicle Detail I18n Deduplication Design

## Goal

Reduce the `I18n Locale` vehicle-detail dataset from thousands of repeated or ineffective rows to a maintainable set of meaningful translations, while preserving complete Chinese and Amharic rendering on every vehicle-detail page.

## Confirmed Problems

The live `productsDetail.*` dataset contains 5,437 records:

- 2,357 records where EN, ZH, and AM are identical.
- 440 records whose value is the empty JSON array `[]` in every locale.
- 719 Gallery records even though Gallery category text is not visibly rendered; labels are only image alt text.
- 298 status records, including 297 copies of `Verified`.
- 3,739 rows beyond the first occurrence of an identical EN/ZH/AM translation triple.
- Repeated technical values such as `LFP`, `120 kW / 250 N-m`, prices, ranges, and units that do not require translation.

## Ownership Boundary

The cleanup owns only keys under these prefixes:

```text
productsDetail.models.
productsDetail.variants.
productsDetail.values.
productsDetail.ui.
```

The pre-existing loader keys `productsDetail.loading` and `productsDetail.modelNotFound` remain untouched. No other module or table may be changed or deleted by the cleanup.

## Target Translation Model

### Shared UI copy

Visible interface labels remain under `productsDetail.ui.*`, one record per semantic label. Model-specific copies of `Range`, `Price`, `Battery`, `Why this model`, and equivalent headings are removed. The renderer reads the shared UI key directly.

### Shared value translations

Repeated visible values use a deterministic value key:

```text
productsDetail.values.<stable-hash-of-English-source>
```

The same English source always resolves to the same key in the generator and browser. One row can link to every related Vehicle Model and `vehicle_variants` record. Examples include:

- `Verified`, `Partial`, `TBC`
- drivetrain names
- translatable battery descriptions
- charging descriptions
- repeated equipment phrases and feature values

The hash is an identity key only. EN remains stored in the row so maintainers can read and search the source phrase.

### Context-specific model content

Content whose translation depends on the specific vehicle stays under `productsDetail.models.<slug>.*`, including localized display names, hero prose, model highlights, and other model-specific sentences. It keeps exactly one `Linked Vehicle Model` relation and no variant relation.

### Context-specific Trim names

Trim names remain under `productsDetail.variants.<trim-config-id>.name` because the translated edition name belongs to one concrete version. These rows keep both the model and variant relations.

## Values That Do Not Produce Records

The generator must omit:

- Empty strings and empty JSON arrays.
- Any value whose EN, ZH, and AM outputs are exactly identical.
- Numeric/currency/unit-only values such as prices, ranges, capacities, motor power, torque, dimensions, percentages, and time windows when no natural-language word changes.
- Raw chemistry acronyms such as `LFP`, `NCM`, and `NMC` when the displayed value contains only the acronym.
- Gallery category and label fields.
- Model copies of labels already represented by `productsDetail.ui.*`.

When a translation row is omitted, the renderer uses the English source value directly. This is intentional for technical invariant content.

## Array Handling

Whole feature arrays are no longer stored as one record per Trim. The renderer maps each non-empty source item through the shared value-key resolver. Empty arrays remain ordinary empty arrays and require no translation record. Array order and length therefore always match source data without storing `[]` rows.

## Gallery Handling

Gallery `cat` and `label` are removed from the translation overlay and manifest. Existing source labels remain available as image alt text. The visible gallery contains images, navigation controls, and position indicators only, so removing these translation records does not remove visible localized copy.

## Status and Technical Display Handling

- Statuses resolve through shared value keys, producing one row per distinct status.
- Drivetrain and other repeated natural-language values resolve through shared value keys.
- Motor output such as `120 kW / 250 N-m` falls back directly to source.
- Battery and charging strings use shared translated values only when natural-language words are present.

## Synchronization and Deletion Safety

The sync script builds the complete desired manifest first and validates all model and variant relations. It then:

1. Creates or updates desired records.
2. Re-reads owned records.
3. Computes stale records only inside the ownership prefixes.
4. Prints a dry-run count and category breakdown.
5. Deletes stale records only when both `--write` and `--prune` are supplied.
6. Stops immediately on any failed batch.

No deletion is allowed when duplicate desired keys, missing relations, array-order failures, or unexpected key prefixes are detected.

## Frontend Adaptation

`detailTranslations.ts` gains a deterministic shared-value key helper and scalar/array value resolvers. `_VehicleDetail.tsx` uses:

- shared UI keys for common labels;
- model keys only for model-specific prose;
- variant keys only for Trim-specific names;
- shared value keys for repeated visible values and every non-empty feature item;
- raw fallback for technical invariant values.

## Verification

- Unit tests prove stable shared-value hashing in Node and browser-compatible TypeScript.
- Tests prove empty arrays generate no keys and remain empty.
- Tests prove technical invariant values use raw fallback.
- Source-contract tests prove Gallery fields are absent from the translation overlay and manifest.
- Live dry-run reports the exact create/update/delete set before mutation.
- Post-write verification proves zero duplicate keys, correct relation cardinality, no owned empty-array rows, no Gallery keys, and one record per shared status/value.
- Full tests, `npm run check`, and `npm run build` must pass.

## Non-goals

- No changes to Vehicle Models or `vehicle_variants` business fields.
- No changes to non-detail translation modules.
- No push or deployment unless separately requested.
