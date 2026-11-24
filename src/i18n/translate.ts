import type { Locale } from "./config";

/** Árvore de textos: folhas string ou listas. Módulo puro (sem React, sem Next). */
export type MessageTree = { [key: string]: string | readonly string[] | MessageTree | readonly MessageTree[] };

/** Mesma forma de T, com folhas string: força en/es/it a terem as mesmas chaves do pt. */
export type SameShape<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? SameShape<U>[]
    : { [K in keyof T]: SameShape<T[K]> };

export type Vars = Record<string, string | number>;

function lookup(tree: unknown, path: string): unknown {
  let cur: unknown = tree;
  for (const part of path.split(".")) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

const interpolate = (text: string, vars?: Vars) =>
  vars ? text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : text;

/**
 * t("nav.catalog") / t("home.count", { n: 3 }). Chave ausente: usa o português; se também
 * faltar, devolve a própria chave (visível em desenvolvimento, nunca quebra a página).
 */
export function createT(messages: MessageTree, fallback?: MessageTree) {
  function t(path: string, vars?: Vars): string {
    const v = lookup(messages, path) ?? (fallback ? lookup(fallback, path) : undefined);
    return typeof v === "string" ? interpolate(v, vars) : path;
  }
  /** Lista ou objeto estruturado (ex.: perguntas do FAQ). */
  function raw<T = unknown>(path: string): T {
    return (lookup(messages, path) ?? (fallback ? lookup(fallback, path) : undefined)) as T;
  }
  return Object.assign(t, { raw });
}
export type TFunction = ReturnType<typeof createT>;

/** Todas as chaves-folha ("a.b.c" ou "a.b.0.c"), para o teste de paridade entre idiomas. */
export function flattenKeys(tree: unknown, prefix = ""): string[] {
  if (typeof tree === "string") return [prefix];
  if (tree === null || typeof tree !== "object") return [];
  const entries = Array.isArray(tree) ? tree.map((v, i) => [String(i), v] as const) : Object.entries(tree);
  return entries.flatMap(([k, v]) => flattenKeys(v, prefix ? `${prefix}.${k}` : k));
}

export type Dictionary = Record<Locale, MessageTree>;
