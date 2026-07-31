# Task 2 Report: Implement Cloudflare Worker API & Edge Cache

## Execution Details
* **Status**: DONE
* **Commit**: `dfc2bc203a09a2534ae271b8cea58bda3a917a79`
* **Verification Status**:
  - GET `/api/portal/public/products/byd-seagull`: 200 OK (returns full specs mapped from Feishu Bitable)
  - GET `/api/portal/public/insights`: 200 OK (returns article index metadata)
  - GET `/api/portal/public/insights/byd-seagull-landed-cost-ethiopia`: 200 OK (returns full article detail)
  - GET `/api/portal/public/academy`: 200 OK (returns lessons and vault items)
  - GET `/api/portal/public/academy/playbook/ev-objections-african-dealers`: 200 OK (returns lesson details)
  - POST `/api/portal/webhook/sync`: 200 OK (clears edge cache map)

## Implementation Details
0. **Data Sourcing Refinement**:
   - Added robust helper `cleanUrl` to normalize URLs from Feishu markdown link outputs (stripping query parameters and hash anchors).
   - Added bilingual support for specification keys (e.g., mapping `Battery Capacity` -> `电池容量`, `Range (CLTC)` -> `CLTC续航`) to handle imported English and Chinese dataset keys seamlessly.
   - Integrated `safeJsonParse` and `normalizeAcademyCategory` to safeguard JSON parsing and standardize category-based routing.
1. **Public API Endpoint Routing**:
   - Mapped all requested public endpoints prefixing with `/api/portal/public/` inside the Worker handler `handlePortalRequest` in [worker/portal.ts](file:///Users/a12/projects/youguard/worker/portal.ts).
   - Dynamic parameters (e.g. `:slug`, `:category`) are safely parsed using regular expressions on paths.

2. **In-Memory Cache & Webhook Sync**:
   - Implemented `cacheMap` with `getCached` and `setCached` helpers in [worker/portal.ts](file:///Users/a12/projects/youguard/worker/portal.ts) featuring a 10-minute TTL to respect Feishu's rate limit.
   - Added a POST `/api/portal/webhook/sync` endpoint that flushes the cache entirely when invoked.

3. **Field Mapping & Standardisation**:
   - Mapped `Vehicle Models` and linked `Vehicle Model Specs` back into dynamic layout JSONs with logical partitions (`specsLeft` for core specs, `specsRight` for standard specs).
   - Created helpers `cleanUrl`, `mapTagClass`, `formatDate`, and `computeBatchMargin` to clean Feishu data structures for consistent output representation.

4. **Environment Setup**:
   - Updated environmental interfaces in `worker/index.ts` and `worker/portal.ts` to expose the new articles and academy table environment bindings.
