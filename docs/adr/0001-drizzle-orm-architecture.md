# ADR 0001: Adopt Drizzle ORM for Cloudflare D1 Type-Safe Data Layer

## Status
Accepted

## Context
AutoYJ previously relied on raw SQL strings in `server/db/schema.sql` and manual `db.prepare(...).bind(...)` calls inside `server/db/d1.ts`. This presented several architectural risks:
1. **Zero compile-time SQL safety**: Field renames or typos in SQL strings were invisible to TypeScript until runtime failures occurred.
2. **Dual Type Definitions**: Data shapes had to be manually declared in both SQL DDL and TypeScript interfaces, violating Iron Law 5 (Single Source of Truth).
3. **Complex manual relational joining**: Fetching inquiries with nested notes and participants required verbose, hand-written grouping logic.

## Decision
We adopt **Drizzle ORM** (`drizzle-orm` + `drizzle-kit`) for Cloudflare D1 with the following engineering standards:
1. **Per-Request D1 Context Factory (`getDb(d1)`)**: Export a factory function to instantiate Drizzle over the dynamically injected Cloudflare D1 database binding, preventing cross-request leaks.
2. **Domain-Driven Modular Schemas (`server/db/schema/`)**: Organize database schemas into domain modules (`catalog.ts`, `inquiries.ts`, `quotations.ts`, `auth.ts`, `telegram.ts`, `content.ts`) re-exported via `server/db/schema/index.ts`.
3. **Relational Query API (`relations`)**: Define explicit schema relations for entity trees (`inquiries -> notes`, `vehicleModels -> trims`).
4. **TypeScript as SSOT for D1 Migrations**: Use `drizzle-kit` (`drizzle.config.ts`) to generate migration artifacts into `drizzle/`.

## Consequences
- **Positive**: 100% type inference on all database queries, zero runtime overhead on Edge Workers, automatic schema migration tracking, and eradication of hand-crafted SQL string bugs.
- **Negative**: Adds `drizzle-orm` dependency (lightweight, zero native binary dependencies, compatible with Cloudflare Workers and Bun runtime).
