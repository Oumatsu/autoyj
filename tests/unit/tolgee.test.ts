import { describe, expect, test } from "bun:test";
import { createTolgee, getTolgeeConfig } from "../../lib/tolgee";

describe("lib/tolgee", () => {
  test("getTolgeeConfig returns configuration object with defaults", () => {
    const config = getTolgeeConfig();
    expect(config).toBeDefined();
    expect(typeof config.apiUrl).toBe("string");
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
