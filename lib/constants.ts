/**
 * Shared runtime constants — import from here instead of repeating magic numbers.
 *
 * All durations are in seconds unless noted.
 */

// ---------------------------------------------------------------------------
// Cookie / session durations
// ---------------------------------------------------------------------------

/** 1 year in seconds — used for locale preference cookie */
export const COOKIE_TTL_1Y = 60 * 60 * 24 * 365;

/** 7 days in seconds — Better Auth session expiry */
export const SESSION_TTL_7D = 60 * 60 * 24 * 7;

/** 1 day in seconds — Better Auth session refresh age */
export const SESSION_UPDATE_AGE_1D = 60 * 60 * 24;

// ---------------------------------------------------------------------------
// Cookie names — single source of truth; never inline these strings elsewhere
// ---------------------------------------------------------------------------

/** Next.js / middleware locale cookie — persists the user's language preference */
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

// ---------------------------------------------------------------------------
// Tolgee
// ---------------------------------------------------------------------------

/** Fallback Tolgee project ID when NEXT_PUBLIC_TOLGEE_PROJECT_ID is not set */
export const TOLGEE_PROJECT_ID_FALLBACK = 33857;

/** Tolgee Cloud API URL */
export const TOLGEE_API_URL_DEFAULT = "https://app.tolgee.io";
