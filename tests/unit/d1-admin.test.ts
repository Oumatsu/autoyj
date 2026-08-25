import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { getLocalD1Path, LOCAL_D1_DIRECTORY } from "../../scripts/d1/local-d1";

describe("D1 Admin & Local Database Utilities", () => {
  test("LOCAL_D1_DIRECTORY is resolved properly within repo root", () => {
    expect(LOCAL_D1_DIRECTORY.replaceAll("\\", "/")).toContain(".wrangler/local-d1/v3/d1");
  });

  test("getLocalD1Path locates existing sqlite file when initialized", () => {
    if (existsSync(LOCAL_D1_DIRECTORY)) {
      const dbPath = getLocalD1Path();
      expect(dbPath).toBeDefined();
      expect(dbPath.endsWith(".sqlite")).toBe(true);
    }
  });

  test("d1-admin script file exists and exports valid functions", async () => {
    const d1AdminPath = resolve(import.meta.dir, "../../scripts/d1/d1-admin.ts");
    expect(existsSync(d1AdminPath)).toBe(true);

    const d1AdminModule = await import("../../scripts/d1/d1-admin");
    expect(typeof d1AdminModule.exportDatabase).toBe("function");
    expect(typeof d1AdminModule.importDatabase).toBe("function");
    expect(typeof d1AdminModule.pullRemote).toBe("function");
    expect(typeof d1AdminModule.main).toBe("function");
  });
});
