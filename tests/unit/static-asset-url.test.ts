import { expect, test } from "bun:test";
import { toStaticAssetUrl } from "@/lib/static-asset-url";

test("encodes non-ASCII static asset paths for server-side preload headers", () => {
  const assetUrl = toStaticAssetUrl("/pic/hero/ChatGPT Image 2026年5月18日 19_47_04.webp");

  expect(assetUrl).toBe(
    "/pic/hero/ChatGPT%20Image%202026%E5%B9%B45%E6%9C%8818%E6%97%A5%2019_47_04.webp",
  );
  expect(/[\u0080-\uFFFF]/.test(assetUrl)).toBeFalse();
});
