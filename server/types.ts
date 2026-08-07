/// <reference types="@cloudflare/workers-types" />

export type ImageBinding = {
  input(stream: ReadableStream): {
    transform(options: Record<string, unknown>): {
      output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
    };
  };
};

/**
 * Environment bindings used by portal API handlers and scheduled jobs.
 * Worker-only asset bindings are kept in WorkerEnv below.
 */
export interface PortalEnv {
  FEISHU_API_URL?: string;
  FEISHU_APP_ID?: string;
  FEISHU_APP_SECRET?: string;
  FEISHU_BASE_APP_TOKEN?: string;
  FEISHU_TABLE_INTERNAL_USERS?: string;
  FEISHU_TABLE_CUSTOMERS?: string;
  FEISHU_TABLE_VEHICLES?: string;
  FEISHU_TABLE_VEHICLE_MODELS?: string;
  FEISHU_TABLE_INQUIRIES?: string;
  FEISHU_TABLE_QUOTES?: string;
  FEISHU_TABLE_NEGOTIATIONS?: string;
  FEISHU_TABLE_INQUIRY_NOTES?: string;
  FEISHU_TABLE_INQUIRY_PARTICIPANTS?: string;
  FEISHU_TABLE_INQUIRY_STATUS_HISTORY?: string;
  FEISHU_TABLE_ORDERS?: string;
  PORTAL_SESSION_SECRET?: string;
  PORTAL_COOKIE_NAME?: string;
  PORTAL_BASE_URL?: string;
  FEISHU_TABLE_ARTICLES?: string;
  FEISHU_TABLE_ACADEMY_LESSONS?: string;
  FEISHU_TABLE_ACADEMY_VAULT?: string;
  FEISHU_TABLE_I18N?: string;
  FEISHU_TABLE_INSIGHTS?: string;
  FEISHU_TABLE_VEHICLE_TRIM_CONFIGURATIONS?: string;
  FEISHU_VIEW_VEHICLE_TRIM_CONFIGURATIONS?: string;
  FEISHU_ALLOW_EMPTY_ARTICLES?: string;
  FEISHU_ALLOW_EMPTY_ACADEMY?: string;
  DEV?: boolean;
  /** Cloudflare D1 database binding — read by API handlers, written by Cron Job. */
  PORTAL_DB?: D1Database;
}

export interface WorkerEnv extends PortalEnv {
  ASSETS: Fetcher;
  IMAGES: ImageBinding;
}

export interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}
