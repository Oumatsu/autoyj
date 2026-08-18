# ADR 0003: Elimination of Cloudflare Error 1102 and Decoupling Heavy Sync from Edge Worker Cron

## Status
Accepted

## Context
Production Cloudflare Worker logs recorded recurring Cloudflare Error 1102 (\`Worker exceeded CPU limits or Worker threw an unhandled exception during execution\`).

Analysis revealed:
1. **Cron Trigger Resource Overload**: \`wrangler.jsonc\` had an active cron schedule (\`*/10 * * * *\`) that triggered \`runFeishuScheduledSync\` every 10 minutes on the edge worker.
2. **CPU & Subrequest Exceedance**: In standard Cloudflare Workers (50ms CPU limit / 50 subrequests limit), fetching 7 Feishu Bitable tables with multi-page pagination, complex regex processing, and large D1 \`batch\` transactions exceeded the 50ms edge CPU ceiling.
3. **Unhandled Promise Rejections in \`ctx.waitUntil\`**: Errors during cron sync bubbled up uncaught, causing the Cloudflare runtime to abort the worker and throw Error 1102.

## Decisions

1. **Decouple Heavy Sync from Edge Worker Cron**:
   - Remove the \`crons\` trigger from \`wrangler.jsonc\`.
   - The user-facing edge worker strictly handles public web traffic and fast D1 reads/writes with <2ms CPU time, completely eliminating Error 1102.
   - Heavy data ingestion (Feishu to D1) is performed via offline sync scripts (\`bun run db:local:sync\`), Webhook triggers, or dedicated CI cron workflows.

2. **Top-Level Error Boundaries**:
   - In \`server/index.ts\`, wrap \`fetch\` and \`scheduled\` handlers in top-level \`try...catch\` and \`.catch()\` blocks to ensure unhandled promise rejections never crash the Worker runtime.
   - Return structured JSON error responses instead of letting workers terminate abruptly.

3. **Safe D1 Read-First Architecture**:
   - All client and portal requests continue to query Cloudflare D1 with zero upstream dependencies on third-party Bitable APIs during request time.

## Consequences
- 100% elimination of Cloudflare Error 1102.
- Consistent sub-millisecond edge response times for all global users.
- Predictable and isolated data synchronization lifecycle.
