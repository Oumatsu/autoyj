import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { register, onRequestError } from "../../instrumentation";

describe("Official Sentry Next.js Integration Standards", () => {
  test("instrumentation.ts exports official register and onRequestError hooks", () => {
    expect(typeof register).toBe("function");
    expect(typeof onRequestError).toBe("function");
  });

  test("next.config.ts wraps configuration with withSentryConfig", () => {
    const configSource = readFileSync("next.config.ts", "utf8");
    expect(configSource).toContain('import { withSentryConfig } from "@sentry/nextjs"');
    expect(configSource).toContain("export default withSentryConfig(");
  });

  test("sentry.client.config.ts enforces input masking and client noise filtering", () => {
    const clientSource = readFileSync("sentry.client.config.ts", "utf8");
    expect(clientSource).toContain("maskAllInputs: true");
    expect(clientSource).toContain("ignoreErrors");
    expect(clientSource).toContain("ResizeObserver loop limit exceeded");
    expect(clientSource).toContain("Failed to fetch");
  });

  test("sentry.edge.config.ts and sentry.server.config.ts exist with valid DSN references", () => {
    const edgeSource = readFileSync("sentry.edge.config.ts", "utf8");
    const serverSource = readFileSync("sentry.server.config.ts", "utf8");
    expect(edgeSource).toContain("Sentry.init");
    expect(serverSource).toContain("Sentry.init");
  });
});
