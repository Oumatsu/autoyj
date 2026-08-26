import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

test("local test-account buttons use dev sessions without embedding credentials", async () => {
  const source = await readFile(new URL("../../app/portal/page.tsx", import.meta.url), "utf8");
  const options = source.slice(source.indexOf("const devLoginOptions"), source.indexOf("const roleLabels"));

  expect(source).toContain("onClick={() => void devLogin(option.role)}");
  expect(source).not.toContain("fillTestCredentials");
  expect(options).not.toContain("accessCode");
});

test("Vite and local D1 scripts share the same persistence directory", async () => {
  const viteConfig = await readFile(new URL("../../vite.config.ts", import.meta.url), "utf8");
  const packageJson = await readFile(new URL("../../package.json", import.meta.url), "utf8");

  expect(viteConfig).toContain('persistState: { path: ".wrangler/local-d1" }');
  expect(packageJson).toContain("--persist-to .wrangler/local-d1");
});
