import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

test("account filter tabs keep fluorescent green text when selected", () => {
  const source = readFileSync("app/portal/page.tsx", "utf8");
  const start = source.indexOf("function AdminUserManagement(");
  const end = source.indexOf("function AdminSettings", start);
  const panel = source.slice(start, end);

  expect(panel.match(/activeTab === "(?:all|customers|staff)" \? "bg-theme text-lime-300"/g)).toHaveLength(3);
  expect(panel).not.toContain("bg-theme text-black");
});
