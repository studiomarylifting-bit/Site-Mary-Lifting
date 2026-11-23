/** Slug da categoria. É dinâmico: novas categorias podem vir do banco. */
export type CategorySlug = string;

export interface ServiceCategory {
  slug: CategorySlug;
  position: number;
  /** Numeração editorial exibida na home (01, 02...) */
  index: string;
  title: string;
  tagline: string;
  /** Quantidade de opções informada pelo Studio (pode diferir do cadastrado). */
  declaredOptionCount: number;
  /** Caminho dentro do bucket `site-media` (ex.: categorias/cilios.webp). Nunca uma URL. */
  imagePath?: string;
  /** URL pública resolvida a partir de `imagePath` (só existe se o caminho for válido). */
  imageUrl?: string;
}

export interface Service {
  slug: string;
  categorySlug: CategorySlug;
  name: string;
  description: string;
  /** Valores em centavos (inteiros) para evitar erros de ponto flutuante. */
  priceCents: number;
  maintenanceCents?: number;
  /** Prazo de retorno para manutenção, em dias (só existe com valor de manutenção). */
  maintenanceDays?: number;
  /** Texto de retorno, exatamente como informado. */
  returnInfo?: string;
  /** Informações importantes adicionais. */
  notes?: string[];
  /** Slugs de variações relacionadas (ex.: versão no castanho). */
  relatedSlugs?: string[];
  /** Caminho dentro do bucket `site-media` (ex.: servicos/volume-egipcio.webp). Nunca uma URL. */
  imagePath?: string;
  /** URL pública resolvida a partir de `imagePath` (só existe se o caminho for válido). */
  imageUrl?: string;
}
