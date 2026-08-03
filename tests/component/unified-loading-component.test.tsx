import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import React from "react";
import Loading, { LoadingSkeleton, LoadingOverlay } from "../../components/Loading";

describe("Component: Unified Loading Standard Component", () => {
  test("Renders default Spinner Loading with custom text", () => {
    const html = renderToString(<Loading text="Loading vehicle models..." />);
    expect(html).toContain("Loading vehicle models...");
    expect(html).toContain("role=\"status\"");
  });

  test("Renders Fullscreen Loading Overlay when fullscreen=true", () => {
    const html = renderToString(<Loading text="Authenticating Portal..." fullscreen />);
    expect(html).toContain("Authenticating Portal...");
    expect(html).toContain("fixed inset-0");
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
