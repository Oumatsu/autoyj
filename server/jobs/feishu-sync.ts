import type { PortalEnv as Env } from "../types";
import { syncVehicleModelsToDB, syncVehiclesToD1, syncUsersToD1, syncArticlesToD1, syncAcademyToD1 } from "../api/portal";

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
export const FEISHU_API = "https://open.feishu.cn";
export type FeishuSyncResult = {
  models: number;
  trims: number;
  vehicles: number;
  users: number;
  articles: number;
  lessons: number;
  vault: number;
  elapsed: number;
};

export class FeishuSyncRunError extends Error {
  readonly errors: Array<{ table: string; message: string }>;
  readonly elapsed: number;

  constructor(errors: Array<{ table: string; message: string }>, elapsed: number) {
    super(`Feishu sync failed for ${errors.map((error) => error.table).join(", ")}`);
    this.name = "FeishuSyncRunError";
    this.errors = errors;
    this.elapsed = elapsed;
  }
}

export async function runFeishuScheduledSync(env: Env): Promise<FeishuSyncResult> {
  console.log("[cron:feishu-sync] Starting sync: Feishu → D1...");
  const startTime = Date.now();

  let models = 0, trims = 0, vehicles = 0, users = 0, articles = 0, lessons = 0, vault = 0;
  const errors: Array<{ table: string; message: string }> = [];

  const MAX_SYNC_DURATION_MS = 25000;
  const isBudgetExhausted = () => Date.now() - startTime > MAX_SYNC_DURATION_MS;

  const run = async <T>(table: string, sync: () => Promise<T>, onSuccess: (result: T) => void) => {
    if (isBudgetExhausted()) {
      console.warn(`[cron:feishu-sync] ⏳ Sync time budget exceeded (${MAX_SYNC_DURATION_MS}ms). Deferring ${table} to next cycle.`);
      return;
    }
    try {
      const result = await sync();
      onSuccess(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown sync failure";
      errors.push({ table, message });
      console.error(`[cron:feishu-sync] ✗ ${table} sync failed: ${message}`);
    }
  };

  await run("vehicle models/trims", () => syncVehicleModelsToDB(env), (res) => {
    models = res.models;
    trims = res.trims;
    console.log(`[cron:feishu-sync] ✓ Vehicle models: ${models} models + ${trims} trims written to D1`);
  });

  await run("vehicles", () => syncVehiclesToD1(env), (res) => {
    vehicles = res.synced;
    console.log(`[cron:feishu-sync] ✓ Vehicles: ${vehicles} records written to D1`);
  });

  await run("users", () => syncUsersToD1(env), (res) => {
    users = res.users;
    console.log(`[cron:feishu-sync] ✓ Users: ${users} records written to D1`);
  });

  await run("articles", () => syncArticlesToD1(env), (res) => {
    articles = res.articles;
    console.log(`[cron:feishu-sync] ✓ Articles: ${articles} records written to D1`);
  });

  await run("academy lessons/vault", () => syncAcademyToD1(env), (res) => {
    lessons = res.lessons;
    vault = res.vault;
    console.log(`[cron:feishu-sync] ✓ Academy: ${lessons} lessons + ${vault} vault items written to D1`);
  });

  const elapsed = Date.now() - startTime;
  if (errors.length) {
    throw new FeishuSyncRunError(errors, elapsed);
  }
  console.log(`[cron:feishu-sync] Done in ${elapsed}ms`);
  return { models, trims, vehicles, users, articles, lessons, vault, elapsed };
}
