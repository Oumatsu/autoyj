import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";
import GlobalError from "../../app/global-error";

describe("Component: GlobalError (Sentry & Fallback Error Boundary)", () => {
  test("renders friendly error message and try again button", () => {
    const error = new Error("Test crash");
    const html = renderToString(<GlobalError error={error} reset={() => {}} />);

    expect(html).toContain("Something went wrong");
    expect(html).toContain("An unexpected system error occurred");
    expect(html).toContain("Try Again");
  });

  test("renders error digest when provided", () => {
    const errorWithDigest = Object.assign(new Error("Test crash with digest"), {
      digest: "ERR_12345_TEST",
    });
    const html = renderToString(
      <GlobalError error={errorWithDigest} reset={() => {}} />
    );

    expect(html).toContain("Error Digest:");
    expect(html).toContain("ERR_12345_TEST");
  });
});
