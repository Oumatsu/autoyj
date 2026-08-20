import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";
import { InquiryTitleField } from "../../components/portal/InquiryTitleField";

describe("InquiryTitleField", () => {
  test("always renders the title input while only requiring it before a concrete color configuration is selected", () => {
    const incomplete = renderToString(<InquiryTitleField value="" onChange={() => {}} required />);
    const complete = renderToString(<InquiryTitleField value="" onChange={() => {}} required={false} />);

    expect(incomplete).toContain('aria-label="Inquiry title"');
    expect(incomplete).toContain("required");
    expect(complete).toContain('aria-label="Inquiry title"');
    expect(complete).not.toContain("required");
  });
});
