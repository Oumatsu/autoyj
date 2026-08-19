import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

describe("Closed comments manager density", () => {
  test("renders every closed comment as an independent compact card in a responsive manager grid", async () => {
    const source = await readFile(new URL("../../app/portal/page.tsx", import.meta.url), "utf8");
    const start = source.indexOf("data-testid=\"closed-comment-manager\"");
    const end = source.indexOf("{commentPendingClosure", start);
    const manager = source.slice(start, end);

    expect(manager).toContain("hiddenNotes.map((item)");
    expect(manager).toContain("md:grid-cols-2 xl:grid-cols-3");
    expect(manager).toContain("content-start auto-rows-max");
    expect(manager).toContain("max-h-24 overflow-hidden");
    expect(manager).not.toContain("Object.entries(groupedHiddenNotes)");
    expect(manager).not.toContain("max-h-[70vh]");
  });
});

describe("Inquiry navigation release state", () => {
  test("marks Inquiry Management as Preview without changing other development modules", async () => {
    const source = await readFile(new URL("../../app/portal/page.tsx", import.meta.url), "utf8");
    const start = source.indexOf("const adminNavItems");
    const end = source.indexOf("const modelCoreSpecNames", start);
    const navigation = source.slice(start, end);

    expect(navigation).toContain('{ key: "quotes", labelKey: "portal.navQuotes", roles: ["admin", "sales", "partner", "customer"], icon: "quotes", badge: "preview" }');
    expect(navigation).toContain('{ key: "orders", labelKey: "portal.navOrders", roles: ["admin", "sales", "finance", "partner", "customer"], icon: "orders", badge: "development" }');
  });
});
