import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import React from "react";
import Loading, { LoadingSkeleton, LoadingOverlay } from "../../components/Loading";

describe("Component: Unified Loading Standard Component", () => {
  test("Renders default Spinner Loading with custom text and fullscreen overlay", () => {
    const html = renderToString(<Loading text="Loading vehicle models..." />);
    expect(html).toContain("Loading vehicle models...");
    expect(html).toContain("role=\"status\"");
    expect(html).toContain("fixed inset-0");
  });

  test("Renders inline container loading when fullscreen=false", () => {
    const html = renderToString(<Loading text="Loading inline section..." fullscreen={false} />);
    expect(html).toContain("Loading inline section...");
    expect(html).toContain("w-full py-12");
  });

  test("Renders LoadingSkeleton variant for catalog loading", () => {
    const html = renderToString(<LoadingSkeleton count={3} />);
    expect(html).toContain("animate-pulse");
  });

  test("LoadingOverlay helper renders correctly", () => {
    const html = renderToString(<LoadingOverlay message="Processing request..." />);
    expect(html).toContain("Processing request...");
  });
});
