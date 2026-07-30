import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import PortalPage from "../app/portal/page.tsx";

test("PortalPage component renders without throwing ReferenceError or TypeError and zero [object Object]", () => {
  assert.doesNotThrow(() => {
    const html = renderToString(React.createElement(PortalPage));
    assert.ok(typeof html === "string");
    assert.ok(html.length > 0);
    assert.ok(!html.includes("[object Object]"), "Rendered UI contains forbidden '[object Object]' string leakage!");
  });
});
