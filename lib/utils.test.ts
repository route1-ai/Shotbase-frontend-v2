import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
  it("merges standard classes correctly", () => {
    expect(cn("px-2 py-1", "bg-red-500")).toBe("px-2 py-1 bg-red-500");
  });

  it("handles falsy values", () => {
    expect(cn("px-2", null, undefined, false, "", "py-1")).toBe("px-2 py-1");
  });

  it("evaluates conditional objects", () => {
    expect(cn("px-2", { "bg-blue-500": true, "bg-red-500": false })).toBe("px-2 bg-blue-500");
  });

  it("supports arrays", () => {
    expect(cn(["px-2", "py-1"], ["bg-green-500"])).toBe("px-2 py-1 bg-green-500");
  });

  it("resolves Tailwind CSS conflicts using twMerge", () => {
    expect(cn("px-2 py-1 bg-red-500", "p-4 bg-blue-500")).toBe("p-4 bg-blue-500");
  });
});
