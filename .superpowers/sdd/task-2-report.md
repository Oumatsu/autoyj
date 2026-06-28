# Task 2 Report: Implement Cloudflare Worker API & Edge Cache

## Execution Details
* **Status**: DONE
* **Commit**: `f0a4f3cc4c03b12ea66e133d1c9ef16eb47ec158`
* **Verification Status**:
  - GET `/api/portal/public/products/byd-seal`: 200 OK (returns full specs mapped from Feishu Bitable)
  - GET `/api/portal/public/insights`: 200 OK (returns article index metadata)
  - GET `/api/portal/public/insights/byd-south-africa-expansion-2026`: 200 OK (returns full article detail)
  - GET `/api/portal/public/academy`: 200 OK (returns lessons and vault items)
  - GET `/api/portal/public/academy/playbook/ev-objections-african-dealers`: 200 OK (returns lesson details)
  - POST `/api/portal/webhook/sync`: 200 OK (clears edge cache map)

## Implementation Details
1. **Public API Endpoint Routing**:
   - Mapped all requested public endpoints prefixing with `/api/portal/public/` inside the Worker handler `handlePortalRequest` in [worker/portal.ts](file:///Users/a12/projects/autoyj/worker/portal.ts).
   - Dynamic parameters (e.g. `:slug`, `:category`) are safely parsed using regular expressions on paths.

2. **In-Memory Cache & Webhook Sync**:
   - Implemented `cacheMap` with `getCached` and `setCached` helpers in [worker/portal.ts](file:///Users/a12/projects/autoyj/worker/portal.ts) featuring a 10-minute TTL to respect Feishu's rate limit.
   - Added a POST `/api/portal/webhook/sync` endpoint that flushes the cache entirely when invoked.

3. **Field Mapping & Standardisation**:
   - Mapped `Vehicle Models` and linked `Vehicle Model Specs` back into dynamic layout JSONs with logical partitions (`specsLeft` for core specs, `specsRight` for standard specs).
   - Created helpers `cleanUrl`, `mapTagClass`, `formatDate`, and `computeBatchMargin` to clean Feishu data structures for consistent output representation.

4. **Environment Setup**:
   - Updated environmental interfaces in `worker/index.ts` and `worker/portal.ts` to expose the new articles and academy table environment bindings.
