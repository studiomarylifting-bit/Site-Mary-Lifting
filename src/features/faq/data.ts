import { staticCatalog } from "@/features/catalog/catalog-core";
import type { Service } from "@/features/catalog/types";
import { formatBRL } from "@/lib/format";
import { studio } from "@/lib/studio";
import { dictionary } from "@/i18n/messages";
import { createT, type TFunction } from "@/i18n/translate";

/** Tradutor em português: idioma-fonte, usado em testes, no FAQ estático e na revisão da proprietária. */
const ptT = createT(dictionary.pt);

/**
 * FAQ da home. REGRA: toda resposta vem do conteúdo já fornecido pelo Studio
 * (catálogo, pagamentos, endereço, ficha). Onde o Studio ainda não informou a
 * regra, a resposta é prudente e remete ao atendimento, e o item recebe
 * `needsOwnerReview: true` para a proprietária confirmar (ver docs/FAQ-REVISAO.md).
 * `needsOwnerReview` nunca é exibido ao público.
 */

export interface FaqLink {
  href: string;
  label: string;
  external?: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  /** Parágrafos em texto simples (também usados no JSON-LD). */
  answer: string[];
  bullets?: string[];
  links?: FaqLink[];
  needsOwnerReview: boolean;
  /** O que a proprietária precisa confirmar/definir. Uso interno. */
  reviewNote?: string;
}

/**
 * Monta o FAQ a partir dos serviços atuais (preços e descrições vêm do catálogo,
 * seja do banco ou do fallback estático) e do tradutor do idioma ativo.
 */
export function buildFaqItems(services: readonly Service[], t: TFunction = ptT): FaqItem[] {
  // Busca por slug (estável entre idiomas e edições de nome no banco).
  const bySlug = (slug: string) => services.find((x) => x.slug === slug);
  const methodLine = (slug: string): string | null => {
    const s = bySlug(slug);
    return s ? `${s.name}: ${s.description}` : null;
  };
  const removal = bySlug("remocao-de-extensao");
  const effectBullets = ["fio-a-fio-classico", "volume-brasileiro", "volume-egipcio", "mega-volume", "fox-easy"]
    .map(methodLine)
    .filter((l): l is string => l !== null);

  const methods = [t("payments.cash"), t("payments.pix"), t("payments.card"), t("payments.link")]
    .map((m) => m.toLowerCase())
    .join(", ")
    .replace(/, ([^,]+)$/, ` ${t("faq.and")} $1`);

  return [
    {
      id: "duracao",
      question: t("faq.duracao.q"),
      answer: [t("faq.duracao.a1"), t("faq.duracao.a2")],
      links: [
        { href: "/catalogo/cilios", label: t("faq.duracao.l1") },
        { href: "/sac?tipo=duvida", label: t("faq.duracao.l2") },
      ],
      needsOwnerReview: true,
      reviewNote: "Informar o tempo médio de duração por método, se desejado. Hoje só o prazo de retorno (30 dias) consta no catálogo.",
    },
    {
      id: "efeitos",
      question: t("faq.efeitos.q"),
      answer: [t("faq.efeitos.a1"), t("faq.efeitos.a2")],
      bullets: effectBullets,
      links: [{ href: "/catalogo/cilios", label: t("faq.efeitos.l1") }],
      needsOwnerReview: false,
    },
    {
      id: "cuidados",
      question: t("faq.cuidados.q"),
      answer: [t("faq.cuidados.a1"), t("faq.cuidados.a2"), t("faq.cuidados.a3")],
      links: [{ href: "/sac?tipo=pos_atendimento", label: t("faq.cuidados.l1") }],
      needsOwnerReview: true,
      reviewNote: "Incluir as orientações oficiais de cuidado pós-procedimento (lavagem, produtos, o que evitar).",
    },
    {
      id: "manutencao-outra-profissional",
      question: t("faq.manutencao.q"),
      answer: [
        t("faq.manutencao.a1"),
        t("faq.manutencao.a2"),
        removal ? t("faq.manutencao.a3", { price: formatBRL(removal.priceCents, (t as { locale?: string }).locale) }) : t("faq.manutencao.a3none"),
      ],
      links: [
        { href: "/sac?tipo=procedimento", label: t("faq.manutencao.l1") },
        { href: "/catalogo/cilios", label: t("faq.manutencao.l2") },
      ],
      needsOwnerReview: true,
      reviewNote: "Definir se o Studio faz manutenção em extensão de outra profissional e em que condições (valor, prazo, avaliação prévia).",
    },
    {
      id: "contraindicacoes",
      question: t("faq.contra.q"),
      answer: [t("faq.contra.a1"), t("faq.contra.a2"), t("faq.contra.a3")],
      links: [
        { href: "/conta/ficha", label: t("faq.contra.l1") },
        { href: "/sac?tipo=procedimento", label: t("faq.contra.l2") },
      ],
      needsOwnerReview: true,
      reviewNote: "Listar, com orientação profissional, as contraindicações e situações que exigem adiar ou adaptar cada procedimento.",
    },
    {
      id: "escolher-efeito",
      question: t("faq.escolher.q"),
      answer: [t("faq.escolher.a1"), t("faq.escolher.a2")],
      links: [
        { href: "/catalogo", label: t("faq.escolher.l1") },
        { href: "/sac?tipo=duvida", label: t("faq.escolher.l2") },
      ],
      needsOwnerReview: false,
    },
    {
      id: "pagamento",
      question: t("faq.pagamento.q"),
      answer: [t("faq.pagamento.a1", { methods }), t("faq.pagamento.a2")],
      links: [
        { href: "/pagamentos", label: t("faq.pagamento.l1") },
        { href: "/sac?tipo=financeiro", label: t("faq.pagamento.l2") },
      ],
      needsOwnerReview: false,
    },
    {
      id: "localizacao",
      question: t("faq.local.q"),
      answer: [t("faq.local.a1", { address: studio.address.display }), t("faq.local.a2")],
      links: [
        { href: studio.maps.gps, label: t("faq.local.l1"), external: true },
        { href: "/studio", label: t("faq.local.l2") },
      ],
      needsOwnerReview: false,
    },
  ];
}

/** FAQ com o catálogo estático (usado em testes e como fallback). */
export const faqItems: FaqItem[] = buildFaqItems(staticCatalog().services);

export function faqAnswerText(item: FaqItem): string {
  return [...item.answer, ...(item.bullets ?? [])].join(" ");
}

/** JSON-LD schema.org/FAQPage, com o mesmo texto exibido na página. */
export function buildFaqJsonLd(items: readonly FaqItem[] = faqItems) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: faqAnswerText(item) },
    })),
  };
}

/** Serializa para <script>: escapa "<" para impedir fechamento de tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
