import { describe, expect, it } from "vitest";
import { looksLikeSpam, MIN_FILL_MS } from "@/lib/security/anti-spam";

describe("looksLikeSpam", () => {
  const now = 1_000_000;
  it("aceita envio humano normal", () => {
    expect(looksLikeSpam({ honeypot: "", renderedAt: now - 20_000, text: "Olá, tenho uma dúvida", now })).toBe(false);
  });
  it("bloqueia honeypot preenchido", () => {
    expect(looksLikeSpam({ honeypot: "http://spam", now })).toBe(true);
  });
  it("bloqueia envio rápido demais", () => {
    expect(looksLikeSpam({ renderedAt: now - (MIN_FILL_MS - 1), now })).toBe(true);
    expect(looksLikeSpam({ renderedAt: now - MIN_FILL_MS, now })).toBe(false);
  });
  it("bloqueia excesso de links", () => {
    expect(looksLikeSpam({ text: "http://a.com https://b.com http://c.com", now })).toBe(true);
    expect(looksLikeSpam({ text: "veja https://a.com e http://b.com", now })).toBe(false);
  });
  it("honeypot só com espaços não conta", () => {
    expect(looksLikeSpam({ honeypot: "   ", now })).toBe(false);
  });
});
