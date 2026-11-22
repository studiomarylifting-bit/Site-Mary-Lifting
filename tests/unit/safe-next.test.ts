import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/features/auth/safe-next";

describe("safeNextPath (open redirect)", () => {
  it.each(["/conta", "/conta/ficha", "/catalogo/cilios?x=1"])("aceita %s", (p) => {
    expect(safeNextPath(p)).toBe(p);
  });
  it.each([
    null,
    undefined,
    "",
    "conta",
    "//evil.com",
    "/\\evil.com",
    "https://evil.com",
    "javascript:alert(1)",
    "/conta\n//evil.com",
    "/conta\u0000",
  ])("rejeita %j", (p) => {
    expect(safeNextPath(p as string | null | undefined)).toBeNull();
  });
});
