# Tolgee Static Bundle Sync Design

## Problem

Tolgee is the editable source for the site's three locales, but the production Worker currently
bundles `i18n/translations/zh.ts`, `en.ts`, and `am.ts` from Git. A Tolgee instance bound to
`localhost` cannot be reached by the Worker, so edits made in the local Tolgee UI do not reach
production unless the static bundles are updated and deployed.

The project needs a local-first workflow that avoids Tolgee Cloud's key limit, keeps production
independent of Tolgee availability, and can later point at a cloud-hosted self-managed Tolgee
without changing application code.

## Goals

- Make Tolgee the sole editing source for user-facing translations.
- Add a reliable `tolgee:pull` command that exports all three locales into the checked-in TS
  bundles.
- Keep the Worker and browser dependent only on the generated static bundles at runtime.
- Reject incomplete or destructive exports before changing tracked files.
- Support the current local Tolgee URL and a future self-hosted HTTPS URL through environment
  configuration.
- Keep publishing intentionally manual: inspect the diff, commit, and deploy.

## Non-goals

- No runtime Worker-to-Tolgee requests.
- No automatic Git commit, push, or deployment.
- No Tolgee Cloud migration or production Tolgee hosting setup in this change.
- No changes to translation lookup, locale routing, or page rendering behavior.

## Chosen workflow

The local Tolgee server (currently `http://localhost:8085`) remains the editing UI. Before
publishing translations, a developer runs:

```text
bun run tolgee:pull
git diff -- i18n/translations
# review, commit, and deploy as usual
```

The API URL, API key, and project ID come from `TOLGEE_API_URL`, `TOLGEE_API_KEY`, and
`TOLGEE_PROJECT_ID`. Moving Tolgee to a cloud server later only changes those environment
variables.

## Export pipeline

`scripts/tolgee/sync.ts` keeps the existing `push` and `verify` actions and implements `pull` as
follows:

1. Parse the action and the optional `--allow-key-removal` flag.
2. Require an API key and an explicit project ID for pull operations. Do not silently select the
   first project.
3. Confirm that the three tracked translation files have no staged, unstaged, or untracked
   changes. Unrelated worktree changes do not block the command.
4. Request Tolgee's project export endpoint once per locale:
   `/v2/projects/{projectId}/export`, with JSON format, `structureDelimiter=.`, `zip=false`, and
   the locale tag (`zh`, `en`, or `am`).
5. Parse each response as a nested JSON object. Reject non-2xx responses, non-JSON content, empty
   root objects, and malformed values.
6. Flatten the parsed objects with the same dot-notation rules used by `push` and compare the
   three key sets. Pull fails if the locale key sets differ.
7. Reject empty values in the default `zh` locale. Empty translations in `en` or `am` remain
   visible in the generated file, but the existing runtime fallback behavior remains responsible
   for displaying a fallback when appropriate.
8. Compare the remote key set with the current local key set. If any existing key would be
   removed, fail with the removed keys listed unless `--allow-key-removal` was provided.
9. Render all three files in a deterministic format:

   ```ts
   const zh = {
     // JSON-compatible nested translation data
   };

   export default zh;
   ```

   The output uses stable two-space indentation and a trailing newline. The existing module
   names and default exports remain unchanged so all current imports continue to work.
10. Write rendered files through same-directory temporary files and rename only after every
    locale has passed validation. Any validation or network failure leaves the tracked bundles
    untouched.

The generated files are intentionally ordinary TypeScript modules rather than a new runtime
format. This preserves SSR imports, the current `staticData` map, and the offline fallback
without adding a dependency.

## Error handling

Errors are actionable and terminate with a non-zero exit code:

- Missing credentials or project ID identifies the missing variable.
- Authentication and export failures include the HTTP status and response body.
- Invalid JSON identifies the locale.
- Key-set mismatch lists the missing locale/key pairs.
- Key removal lists the affected keys and explains the override flag.
- Dirty translation files identify the paths that must be committed or reverted before pulling.

The command never converts a failed request into an empty translation file and never catches an
error merely to report success.

## Configuration and documentation

`.dev.vars.example` documents the local Tolgee URL and explains that the same variables can point
to a future self-hosted HTTPS instance. README documentation describes:

- starting local Tolgee;
- setting the API key and project ID;
- running `tolgee:pull`;
- reviewing and publishing the generated diff;
- using `--allow-key-removal` only for intentional key deletions.

The package script remains the single user-facing entry point:

```text
bun run tolgee:pull
bun run tolgee:pull -- --allow-key-removal
```

## Validation

Tests for the sync module mock `fetch` and cover:

- successful three-locale export and deterministic file generation;
- missing API key or project ID;
- Tolgee authentication/export errors;
- malformed or empty export data;
- locale key-set mismatch;
- default-locale empty values;
- dirty translation-file protection;
- accidental key-removal protection and the explicit override;
- preservation of existing files when any stage fails.

No production request path changes. Existing static-bundle and Tolgee fallback tests remain
valid, and the generated modules must continue to type-check and build with the current
`staticData` imports.
