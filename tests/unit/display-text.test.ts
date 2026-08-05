import { describe, expect, test } from "bun:test";
import { sanitizeDisplayData } from "../../lib/display-text";

describe("Display data sanitization", () => {
  test("replaces database-only unrecognized markers throughout API data", () => {
    const data = {
      trim: "未识别",
      notes: "内饰：未识别",
      specs: ["未识别", { color: "未识别 / 黑色" }],
    };

    expect(sanitizeDisplayData(data)).toEqual({
      trim: "-",
      notes: "内饰：-",
      specs: ["-", { color: "- / 黑色" }],
    });
  });
});
