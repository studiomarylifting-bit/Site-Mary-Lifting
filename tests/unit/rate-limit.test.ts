import { describe, expect, it, vi } from "vitest";
import { getClientIp, hashIdentifier, RULES } from "@/lib/security/rate-limit";

describe("rate limit helpers", () => {
  it("extrai o primeiro IP de x-forwarded-for", () => {
    const h = new Headers({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" });
    expect(getClientIp(h)).toBe("203.0.113.9");
    expect(getClientIp(new Headers({ "x-real-ip": "198.51.100.2" }))).toBe("198.51.100.2");
    expect(getClientIp(new Headers())).toBe("unknown");
  });

  it("hash do identificador é estável, salgado e não contém o IP", () => {
    vi.stubEnv("RATE_LIMIT_SALT", "sal-a");
    const a = hashIdentifier("203.0.113.9");
    expect(a).toBe(hashIdentifier("203.0.113.9"));
    expect(a).not.toContain("203");
    expect(a).toHaveLength(32);
    vi.stubEnv("RATE_LIMIT_SALT", "sal-b");
    expect(hashIdentifier("203.0.113.9")).not.toBe(a);
  });

  it("regras definem limites positivos", () => {
    for (const r of Object.values(RULES)) {
      expect(r.max).toBeGreaterThan(0);
      expect(r.windowSeconds).toBeGreaterThan(0);
    }
  });
});
