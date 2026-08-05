import type { Env, PortalSession } from "../api/portal";
import { fetchAndCacheVehicleModels, fetchAndCacheVehicles } from "../api/portal";

/**
 * Scheduled Cron Job — Runs every 10 minutes in Cloudflare Worker background.
 * Fetches latest records from Feishu Bitable, sanitizes them, and updates edge caches.
 * Ensures user-facing HTTP requests read ONLY from cache with 0ms/near-0ms latency.
 */
export async function runFeishuScheduledSync(env: Env): Promise<void> {
  console.log("[cron-job:feishu-sync] Starting 10-minute scheduled synchronization with Feishu Base...");
  const startTime = Date.now();

  try {
    const fakeAdminSession: PortalSession = {
      userId: "system-cron-job",
      email: "cron@autoyj.local",
      role: "admin",
      accountType: "internal",
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    const [modelsResult, vehiclesResult] = await Promise.allSettled([
      fetchAndCacheVehicleModels(env, fakeAdminSession),
      fetchAndCacheVehicles(env, fakeAdminSession),
    ]);

    const elapsed = Date.now() - startTime;
    const modelsSuccess = modelsResult.status === "fulfilled";
    const vehiclesSuccess = vehiclesResult.status === "fulfilled";

    console.log(
      `[cron-job:feishu-sync] Finished in ${elapsed}ms | Models: ${modelsSuccess ? "SUCCESS" : "FAILED"} | Vehicles: ${vehiclesSuccess ? "SUCCESS" : "FAILED"}`
    );
  } catch (err) {
    console.error("[cron-job:feishu-sync] Fatal error during scheduled sync:", err);
  }
}
