import { describe, expect, test } from "bun:test";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { Dialog } from "../../components/ui/dialog";

describe("Management dialog", () => {
  test("expands the shared closed-content manager to near-full-screen with a responsive grid", () => {
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => {
      root.render(<Dialog open onOpenChange={() => {}} className="max-w-4xl"><div className="grid" /></Dialog>);
    });

    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog?.className).toContain("max-w-[min(96vw,1600px)]");
    expect(dialog?.className).toContain("h-[min(92vh,1100px)]");
    expect(dialog?.className).toContain("[&>div.grid]:md:grid-cols-2");
    expect(dialog?.className).toContain("[&>div.grid]:xl:grid-cols-3");

    act(() => root.unmount());
  });

  test("offers an explicit close control when the manager fills most of the viewport", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    let requestedClose = false;

    await act(async () => {
      root.render(<Dialog open onOpenChange={(open) => { requestedClose = !open; }} className="max-w-4xl"><p>Manager content</p></Dialog>);
    });

    const closeButton = container.querySelector('button[aria-label="Close dialog"]');
    expect(closeButton).not.toBeNull();
    await act(async () => closeButton?.dispatchEvent(new window.MouseEvent("click", { bubbles: true })));
    expect(requestedClose).toBe(true);

    await act(async () => root.unmount());
    container.remove();
  });
});
