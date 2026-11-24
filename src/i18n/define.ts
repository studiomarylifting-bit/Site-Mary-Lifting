import type { Locale } from "./config";
import type { SameShape } from "./translate";

/** Um namespace com os quatro idiomas lado a lado; o compilador exige o mesmo formato do pt. */
export function ns<T extends object>(pt: T, others: Record<Exclude<Locale, "pt">, SameShape<T>>) {
  return { pt, ...others } as Record<Locale, T>;
}
