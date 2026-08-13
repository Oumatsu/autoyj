import { describe, expect, test } from "bun:test";
import {
  COOKIE_TTL_1Y,
  SESSION_TTL_7D,
  SESSION_UPDATE_AGE_1D,
  LOCALE_COOKIE_NAME,
  TOLGEE_PROJECT_ID_FALLBACK,
  TOLGEE_API_URL_DEFAULT,
} from "../../../lib/constants";

describe("constants", () => {
  test("cookie and session TTL durations match expected values in seconds", () => {
    expect(COOKIE_TTL_1Y).toBe(31536000);
    expect(SESSION_TTL_7D).toBe(604800);
    expect(SESSION_UPDATE_AGE_1D).toBe(86400);
  });

  test("cookie names match required values", () => {
    expect(LOCALE_COOKIE_NAME).toBe("NEXT_LOCALE");
  });

  test("Tolgee fallback values match expected defaults", () => {
    expect(TOLGEE_PROJECT_ID_FALLBACK).toBe(33857);
    expect(TOLGEE_API_URL_DEFAULT).toBe("https://app.tolgee.io");
  });
});
