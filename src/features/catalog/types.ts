export type CategorySlug = "cilios" | "sobrancelhas" | "depilacao" | "labios";

export interface ServiceCategory {
  slug: CategorySlug;
  position: number;
  /** Numeração editorial exibida na home (01, 02...) */
  index: string;
  title: string;
  tagline: string;
  /** Quantidade de opções informada pelo Studio (pode diferir do cadastrado). */
  declaredOptionCount: number;
}

export interface Service {
  slug: string;
  categorySlug: CategorySlug;
  name: string;
  description: string;
  /** Valores em centavos (inteiros) para evitar erros de ponto flutuante. */
  priceCents: number;
  maintenanceCents?: number;
  /** Texto de retorno, exatamente como informado. */
  returnInfo?: string;
  /** Informações importantes adicionais. */
  notes?: string[];
  /** Slugs de variações relacionadas (ex.: versão no castanho). */
  relatedSlugs?: string[];
}
