import { describe, expect, test } from "bun:test";
import { cn } from "../../../lib/utils";

describe("cn utility", () => {
  test("joins two class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  test("drops undefined values", () => {
    expect(cn("foo", undefined, "bar")).toBe("foo bar");
  });

  test("drops falsy values like null and false", () => {
    expect(cn("foo", false, null, "bar")).toBe("foo bar");
  });

  test("returns empty string for no args", () => {
    expect(cn()).toBe("");
  });

  test("merges tailwind utility classes correctly", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    expect(cn("bg-red-500 text-white", "bg-blue-500")).toBe("text-white bg-blue-500");
  });
});
