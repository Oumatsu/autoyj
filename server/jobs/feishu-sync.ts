import type { Env } from "../api/portal";
import { syncVehicleModelsToDB, syncVehiclesToD1 } from "../api/portal";

/**
 * Scheduled Cron Job — Runs every 10 minutes via Cloudflare Workers.
 *
 * Architecture:
 *   Feishu Bitable API → (this cron job) → D1 database
 *   API handlers → D1 database only (zero Feishu calls)
 *
 * This is the ONLY place in the system that calls Feishu.
 * All user-facing API handlers read purely from D1.
 */
export async function runFeishuScheduledSync(env: Env): Promise<{ models: number; trims: number; vehicles: number; elapsed: number }> {
  console.log("[cron:feishu-sync] Starting sync: Feishu → D1...");
  const startTime = Date.now();

  const [modelsResult, vehiclesResult] = await Promise.allSettled([
    syncVehicleModelsToDB(env),
    syncVehiclesToD1(env),
  ]);

  const elapsed = Date.now() - startTime;
  let models = 0, trims = 0, vehicles = 0;

  if (modelsResult.status === "fulfilled") {
    models = modelsResult.value.models;
    trims = modelsResult.value.trims;
    console.log(`[cron:feishu-sync] ✓ Vehicle models: ${models} models + ${trims} trims written to D1`);
  } else {
    console.error("[cron:feishu-sync] ✗ Vehicle models sync failed:", modelsResult.reason);
  }

  if (vehiclesResult.status === "fulfilled") {
    vehicles = vehiclesResult.value.synced;
    console.log(`[cron:feishu-sync] ✓ Vehicles: ${vehicles} records written to D1`);
  } else {
    console.error("[cron:feishu-sync] ✗ Vehicles sync failed:", vehiclesResult.reason);
  }

  console.log(`[cron:feishu-sync] Done in ${elapsed}ms`);
  return { models, trims, vehicles, elapsed };
}
