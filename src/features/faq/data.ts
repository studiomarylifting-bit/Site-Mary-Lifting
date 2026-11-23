import { staticCatalog } from "@/features/catalog/catalog-core";
import type { Service } from "@/features/catalog/types";
import { formatBRL } from "@/lib/format";
import { studio } from "@/lib/studio";

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
 * seja do banco ou do fallback estático).
 */
export function buildFaqItems(services: readonly Service[]): FaqItem[] {
function methodLine(name: string): string | null {
  const s = services.find((x) => x.name === name);
  return s ? `${s.name}: ${s.description}` : null;
}

const removal = services.find((s) => s.name === "Remoção de extensão");

const effectBullets = [
  "Fio a fio clássico",
  "Volume brasileiro",
  "Volume egípcio",
  "Mega volume",
  "Fox Easy",
]
  .map(methodLine)
  .filter((l): l is string => l !== null);

  return [
  {
    id: "duracao",
    question: "Quanto tempo dura uma extensão de cílios?",
    answer: [
      "A duração varia de pessoa para pessoa e depende do método escolhido e dos cuidados em casa.",
      "Nos métodos de aplicação, o Studio informa retorno para manutenção em até 30 dias (consulte as condições de cada procedimento). Para saber o que esperar no seu caso, converse com o Studio.",
    ],
    links: [
      { href: "/catalogo/cilios", label: "Ver métodos e valores" },
      { href: "/sac?tipo=duvida", label: "Perguntar ao Studio" },
    ],
    needsOwnerReview: true,
    reviewNote: "Informar o tempo médio de duração por método, se desejado. Hoje só o prazo de retorno (30 dias) consta no catálogo.",
  },
  {
    id: "efeitos",
    question: "Qual a diferença entre os efeitos de extensão?",
    answer: [
      "Cada método muda o preenchimento e o desenho do olhar. Alguns exemplos do catálogo:",
      "Vários métodos também têm a versão com fios castanhos. Todos os efeitos, valores de aplicação e manutenção estão no catálogo.",
    ],
    bullets: effectBullets,
    links: [{ href: "/catalogo/cilios", label: "Ver todos os efeitos" }],
    needsOwnerReview: false,
  },
  {
    id: "cuidados",
    question: "Como cuidar das extensões após o procedimento?",
    answer: [
      "As orientações de cuidado são passadas pelo Studio no atendimento, de acordo com o método aplicado.",
      "Uma recomendação já informada no catálogo: não remova os fios em casa. A remoção deve ser feita com produto e técnica apropriados.",
      "Ficou com alguma dúvida depois do atendimento? Envie pelo SAC, no tipo Pós-atendimento.",
    ],
    links: [{ href: "/sac?tipo=pos_atendimento", label: "Dúvida pós-atendimento" }],
    needsOwnerReview: true,
    reviewNote: "Incluir as orientações oficiais de cuidado pós-procedimento (lavagem, produtos, o que evitar).",
  },
  {
    id: "manutencao-outra-profissional",
    question: "Posso realizar manutenção de uma extensão feita por outra profissional?",
    answer: [
      "Cada caso precisa ser avaliado pelo Studio, e as condições para esse tipo de manutenção ainda não estão informadas aqui.",
      "Envie sua dúvida pelo SAC para receber a orientação correta antes de agendar.",
      removal
        ? `Se preferir retirar a extensão, o Studio oferece o serviço de remoção (${formatBRL(removal.priceCents)}).`
        : "Se preferir retirar a extensão, consulte o serviço de remoção no catálogo.",
    ],
    links: [
      { href: "/sac?tipo=procedimento", label: "Perguntar ao Studio" },
      { href: "/catalogo/cilios", label: "Ver catálogo" },
    ],
    needsOwnerReview: true,
    reviewNote: "Definir se o Studio faz manutenção em extensão de outra profissional e em que condições (valor, prazo, avaliação prévia).",
  },
  {
    id: "contraindicacoes",
    question: "Existem contraindicações para os procedimentos?",
    answer: [
      "Cada pessoa é avaliada individualmente, e só o Studio pode definir se um procedimento é adequado ao seu caso.",
      "Por isso existe a ficha de atendimento: nela você informa alergias, medicamentos, gestação ou amamentação, sensibilidade da pele e dos olhos, uso de lentes de contato, procedimentos recentes e reações anteriores. A ficha é revisada e não substitui a avaliação do atendimento.",
      "Se não souber responder algum item, você pode escrever que prefere conversar na avaliação.",
    ],
    links: [
      { href: "/conta/ficha", label: "Preencher a ficha" },
      { href: "/sac?tipo=procedimento", label: "Tirar uma dúvida" },
    ],
    needsOwnerReview: true,
    reviewNote: "Listar, com orientação profissional, as contraindicações e situações que exigem adiar ou adaptar cada procedimento.",
  },
  {
    id: "escolher-efeito",
    question: "Como faço para escolher o efeito ideal para mim?",
    answer: [
      "Comece pelo resultado que você imagina: natural e discreto, marcante ou com mais preenchimento. O catálogo descreve cada método e mostra os valores de aplicação e de manutenção.",
      "Na ficha de atendimento você registra seu objetivo e suas preferências, e o Studio ajuda a decidir na avaliação.",
    ],
    links: [
      { href: "/catalogo", label: "Explorar o catálogo" },
      { href: "/sac?tipo=duvida", label: "Falar com o Studio" },
    ],
    needsOwnerReview: false,
  },
  {
    id: "pagamento",
    question: "Quais são as formas de pagamento?",
    answer: [
      `O Studio aceita ${studio.paymentMethods
        .map((m) => m.toLowerCase())
        .join(", ")
        .replace(/, ([^,]+)$/, " e $1")}.`,
      "Dúvidas sobre valores ou condições? Fale com o Studio pelo SAC.",
    ],
    links: [
      { href: "/pagamentos", label: "Ver formas de pagamento" },
      { href: "/sac?tipo=financeiro", label: "Dúvida financeira" },
    ],
    needsOwnerReview: false,
  },
  {
    id: "localizacao",
    question: "Onde fica o Studio Mary Lifting?",
    answer: [
      `O Studio fica na ${studio.address.display}.`,
      "Você pode abrir o endereço direto no GPS.",
    ],
    links: [
      { href: studio.maps.gps, label: "Abrir no GPS", external: true },
      { href: "/studio", label: "Conheça o Studio" },
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
