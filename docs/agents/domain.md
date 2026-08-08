# Domain documentation

## Layout

This repository uses a single-context domain layout:

- `CONTEXT.md` is the repository-wide domain model and vocabulary.
- `docs/adr/` contains architecture decision records.

No `CONTEXT-MAP.md` or per-package context files are needed unless the repository becomes a genuine monorepo.

## Consumer rules

Read `CONTEXT.md` before changing domain terminology, workflows, or cross-cutting behavior. Treat its vocabulary as the canonical language for code, issues, and documentation.

Read relevant records in `docs/adr/` before changing an architectural decision or introducing a new integration boundary. If a change creates a durable architectural decision, add an ADR rather than relying on an undocumented convention.

Keep domain documentation close to the repository root and update it when the corresponding behavior or decision changes. Do not infer separate domains from directories alone.
