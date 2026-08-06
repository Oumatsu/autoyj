import type { Env } from "../api/portal";
import { syncVehicleModelsToDB, syncVehiclesToD1, syncUsersToD1 } from "../api/portal";

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
export async function runFeishuScheduledSync(env: Env): Promise<{ models: number; trims: number; vehicles: number; users: number; elapsed: number }> {
  console.log("[cron:feishu-sync] Starting sync: Feishu → D1...");
  const startTime = Date.now();

  let models = 0, trims = 0, vehicles = 0, users = 0;

  try {
    const res = await syncVehicleModelsToDB(env);
    models = res.models;
    trims = res.trims;
    console.log(`[cron:feishu-sync] ✓ Vehicle models: ${models} models + ${trims} trims written to D1`);
  } catch (err) {
    console.error("[cron:feishu-sync] ✗ Vehicle models sync failed:", err);
  }

  try {
    const res = await syncVehiclesToD1(env);
    vehicles = res.synced;
    console.log(`[cron:feishu-sync] ✓ Vehicles: ${vehicles} records written to D1`);
  } catch (err) {
    console.error("[cron:feishu-sync] ✗ Vehicles sync failed:", err);
  }

  try {
    const res = await syncUsersToD1(env);
    users = res.users;
    console.log(`[cron:feishu-sync] ✓ Users: ${users} records written to D1`);
  } catch (err) {
    console.error("[cron:feishu-sync] ✗ Users sync failed:", err);
  }

  const elapsed = Date.now() - startTime;
  console.log(`[cron:feishu-sync] Done in ${elapsed}ms`);
  return { models, trims, vehicles, users, elapsed };
}
