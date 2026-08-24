import { drizzle } from "drizzle-orm/d1";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./schema";

export type AppDatabase = DrizzleD1Database<typeof schema>;

/**
 * Factory to get a typed Drizzle ORM instance bound to the request's D1Database.
 */
export function getDb(d1: D1Database): AppDatabase {
  return drizzle(d1, { schema });
}

export { schema };
export * from "./schema";
