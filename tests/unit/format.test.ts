import { describe, expect, it } from "vitest";
import { formatBRL, formatBrazilPhone, normalizeBrazilPhone, onlyDigits } from "@/lib/format";

const plain = (s: string) => s.replace(/\s/g, " ");

describe("formatBRL", () => {
  it("formata centavos em reais", () => {
    expect(plain(formatBRL(17000))).toBe("R$ 170,00");
    expect(plain(formatBRL(1000))).toBe("R$ 10,00");
    expect(plain(formatBRL(4050))).toBe("R$ 40,50");
  });
});

describe("normalizeBrazilPhone", () => {
  it.each([
    ["(11) 99999-9999", "5511999999999"],
    ["11999999999", "5511999999999"],
    ["5511999999999", "5511999999999"],
    ["+55 11 99999-9999", "5511999999999"],
    ["(11) 3333-4444", "551133334444"],
  ])("aceita %s", (input, out) => {
    expect(normalizeBrazilPhone(input)).toBe(out);
  });

  it.each(["", "123", "(10) 99999-9999", "(11) 89999-9999", "abc", "999999999999999"])(
    "rejeita %s",
    (input) => {
      expect(normalizeBrazilPhone(input)).toBeNull();
    },
  );

  it("onlyDigits e formatBrazilPhone", () => {
    expect(onlyDigits("(11) 9-9999")).toBe("1199999");
    expect(formatBrazilPhone("5511999999999")).toBe("(11) 99999-9999");
    expect(formatBrazilPhone("551133334444")).toBe("(11) 3333-4444");
  });
});
