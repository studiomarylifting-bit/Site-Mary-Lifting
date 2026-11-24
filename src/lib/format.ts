const brlByLocale = new Map<string, Intl.NumberFormat>();
const INTL: Record<string, string> = { pt: "pt-BR", en: "en-US", es: "es-ES", it: "it-IT" };

/** 17000 -> "R$ 170,00" (pt). Outros idiomas mudam só a pontuação ("R$170.00"); a moeda é sempre BRL. */
export function formatBRL(cents: number, locale: string = "pt"): string {
  const intl = INTL[locale] ?? "pt-BR";
  let f = brlByLocale.get(intl);
  if (!f) {
    f = new Intl.NumberFormat(intl, { style: "currency", currency: "BRL" });
    brlByLocale.set(intl, f);
  }
  return f.format(cents / 100).replace(/\u00a0/g, " ");
}

/** Mantém apenas dígitos. */
export function onlyDigits(value: string): string {
  return value.replace(/\D+/g, "");
}

/**
 * Normaliza celular brasileiro para o formato internacional sem "+".
 * Aceita (11) 99999-9999, 11999999999, 5511999999999.
 * Retorna null se não for um celular/telefone BR plausível.
 */
export function normalizeBrazilPhone(value: string): string | null {
  const digits = onlyDigits(value);
  const national =
    digits.startsWith("55") && digits.length >= 12 ? digits.slice(2) : digits;
  if (national.length !== 10 && national.length !== 11) return null;
  const ddd = Number(national.slice(0, 2));
  if (ddd < 11 || ddd > 99) return null;
  if (national.length === 11 && national[2] !== "9") return null;
  return `55${national}`;
}

/** 5511999999999 -> (11) 99999-9999 */
export function formatBrazilPhone(intl: string): string {
  const d = onlyDigits(intl);
  const n = d.startsWith("55") ? d.slice(2) : d;
  if (n.length === 11) return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
  if (n.length === 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return n;
}
