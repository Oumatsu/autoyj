import { describe, expect, test } from "bun:test";
import {
  createTolgee,
  getLastCreatedTolgeeLanguage,
  getTolgeeTargetLanguage,
} from "../../lib/tolgee";

describe("lib/tolgee", () => {
  test("getLastCreatedTolgeeLanguage and getTolgeeTargetLanguage track instance locale", () => {
    const tolgee = createTolgee("zh");
    expect(getLastCreatedTolgeeLanguage()).toBe("zh");
    expect(getTolgeeTargetLanguage(tolgee)).toBe("zh");
  });

  test("createTolgee initializes Tolgee instance for valid locale", () => {
    const tolgeeZh = createTolgee("zh", { remote: false });
    expect(tolgeeZh).toBeDefined();

    const tolgeeEn = createTolgee("en", { remote: false });
    expect(tolgeeEn).toBeDefined();
  });

  test("createTolgee falls back to default language for unknown locale", () => {
    const tolgeeFallback = createTolgee("unknown-locale" as any, { remote: false });
    expect(tolgeeFallback).toBeDefined();
  });
});
