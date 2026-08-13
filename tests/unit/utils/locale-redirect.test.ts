import { describe, expect, test, mock, beforeEach } from "bun:test";

const redirectMock = mock((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

mock.module("next/navigation", () => ({
  redirect: redirectMock,
}));

import { redirectToDefaultLocale } from "../../../lib/locale-redirect";
import { defaultLocale } from "../../../i18n/config";

describe("redirectToDefaultLocale", () => {
  beforeEach(() => {
    redirectMock.mockClear();
  });

  test("redirects path starting with slash to default locale path", () => {
    expect(() => redirectToDefaultLocale("/products")).toThrow(
      `REDIRECT:/${defaultLocale}/products`
    );
    expect(redirectMock).toHaveBeenCalledWith(`/${defaultLocale}/products`);
  });

  test("redirects path without leading slash to default locale path", () => {
    expect(() => redirectToDefaultLocale("about")).toThrow(
      `REDIRECT:/${defaultLocale}/about`
    );
    expect(redirectMock).toHaveBeenCalledWith(`/${defaultLocale}/about`);
  });

  test("handles root path '/'", () => {
    expect(() => redirectToDefaultLocale("/")).toThrow(
      `REDIRECT:/${defaultLocale}/`
    );
    expect(redirectMock).toHaveBeenCalledWith(`/${defaultLocale}/`);
  });
});
