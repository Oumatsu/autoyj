import { describe, expect, test, mock } from "bun:test";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import GlobalError from "../../app/global-error";
import LocaleError from "../../app/[locale]/error";

describe("Sentry Crash Capture & Error Boundaries", () => {
  test("GlobalError renders crash fallback UI and provides Try Again button", async () => {
    const iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    const frameDoc = iframe.contentDocument || iframe.contentWindow?.document;
    const container = frameDoc ? frameDoc.createElement("div") : document.createElement("div");
    if (frameDoc) frameDoc.body.appendChild(container);
    const root = createRoot(container);

    let resetCalled = false;
    const testError = new Error("Test global crash") as Error & { digest?: string };
    testError.digest = "DIGEST-12345";

    const origError = console.error;
    console.error = (...args: any[]) => {
      if (typeof args[0] === "string" && args[0].includes("cannot be a child of")) return;
      origError(...args);
    };

    try {
      await act(async () => {
        root.render(
          <GlobalError
            error={testError}
            reset={() => { resetCalled = true; }}
          />
        );
      });
    } finally {
      console.error = origError;
    }

    expect(container.textContent).toContain("Something went wrong");
    expect(container.textContent).toContain("DIGEST-12345");

    const tryAgainBtn = container.querySelector("button") as HTMLButtonElement;
    expect(tryAgainBtn).not.toBeNull();
    await act(async () => tryAgainBtn.click());
    expect(resetCalled).toBe(true);

    await act(async () => root.unmount());
    container.remove();
  });

  test("LocaleError renders nested route crash UI and provides recovery buttons", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    let resetCalled = false;
    const testError = new Error("Route render failure") as Error & { digest?: string };
    testError.digest = "ROUTE-ERR-999";

    await act(async () => {
      root.render(
        <LocaleError
          error={testError}
          reset={() => { resetCalled = true; }}
        />
      );
    });

    expect(container.textContent).toContain("Something went wrong");
    expect(container.textContent).toContain("ROUTE-ERR-999");
    expect(container.textContent).toContain("Back to Home");

    const tryAgainBtn = container.querySelector("button") as HTMLButtonElement;
    expect(tryAgainBtn).not.toBeNull();
    await act(async () => tryAgainBtn.click());
    expect(resetCalled).toBe(true);

    await act(async () => root.unmount());
    container.remove();
  });
});
