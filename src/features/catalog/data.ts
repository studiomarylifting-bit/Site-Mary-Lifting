import type { Service, ServiceCategory } from "./types";

/**
 * Fonte única do catálogo (textos e valores informados pelo Studio).
 * Para incluir a 15ª opção de extensão de cílios, basta adicionar um item
 * em `services` com categorySlug "cilios". Nada mais precisa mudar.
 * O seed SQL é gerado a partir deste arquivo (npm run seed:generate).
 */
export const categories: ServiceCategory[] = [
  {
    slug: "cilios",
    position: 1,
    index: "01",
    title: "Extensão de cílios",
    tagline: "Métodos, efeitos e manutenções.",
    declaredOptionCount: 15,
  },
  {
    slug: "sobrancelhas",
    position: 2,
    index: "02",
    title: "Brow lamination e sobrancelhas",
    tagline: "Brow lamination · Design com e sem henna.",
    declaredOptionCount: 4,
  },
  {
    slug: "depilacao",
    position: 3,
    index: "03",
    title: "Depilação de buço e facial",
    tagline: "Cuidados e detalhes de cada procedimento.",
    declaredOptionCount: 2,
  },
  {
    slug: "labios",
    position: 4,
    index: "04",
    title: "Hidra Gloss Color e Nano Lips Color",
    tagline: "Informações, resultados e retornos.",
    declaredOptionCount: 2,
  },
];

const RETURN_30 = "Retorno em até 30 dias.";

export const services: Service[] = [
  // ---------- EXTENSÃO DE CÍLIOS ----------
  {
    slug: "6d-volume-glamour",
    categorySlug: "cilios",
    name: "6D Volume Glamour",
    description: "Volume leve e marcante.",
    priceCents: 17000,
    maintenanceCents: 13000,
    returnInfo: "Retorno em até 30 dias, consulte as condições.",
  },
  {
    slug: "efeito-rimel-jade-picon",
    categorySlug: "cilios",
    name: "Efeito rímel Jade Picon",
    description:
      "Técnica leve, com efeito natural e marcante. Veja também a opção no castanho.",
    priceCents: 14000,
    maintenanceCents: 12000,
    returnInfo: RETURN_30,
    relatedSlugs: ["jade-picon-no-castanho"],
  },
  {
    slug: "fio-a-fio-classico",
    categorySlug: "cilios",
    name: "Fio a fio clássico",
    description: "Método natural e discreto, disponível em preto e castanho.",
    priceCents: 13000,
    maintenanceCents: 11000,
    returnInfo: RETURN_30,
  },
  {
    slug: "fox-easy",
    categorySlug: "cilios",
    name: "Fox Easy",
    description:
      "Efeito delineado natural, com proposta de olhar de raposa.",
    priceCents: 16000,
    maintenanceCents: 13000,
    returnInfo: RETURN_30,
  },
  {
    slug: "jade-picon-no-castanho",
    categorySlug: "cilios",
    name: "Jade Picon no castanho",
    description: "Efeito rímel Jade Picon com fios castanhos.",
    priceCents: 16000,
    maintenanceCents: 14000,
    returnInfo: RETURN_30,
    relatedSlugs: ["efeito-rimel-jade-picon"],
  },
  {
    slug: "kim-kardashian",
    categorySlug: "cilios",
    name: "Kim Kardashian",
    description: "Efeito marcante para quem busca destacar o olhar.",
    priceCents: 16000,
    maintenanceCents: 13000,
    returnInfo: RETURN_30,
  },
  {
    slug: "mega-brasileiro",
    categorySlug: "cilios",
    name: "Mega brasileiro",
    description: "Efeito mega 2D duplo para quem busca mais preenchimento.",
    priceCents: 16000,
    maintenanceCents: 12000,
    returnInfo: RETURN_30,
  },
  {
    slug: "mega-volume",
    categorySlug: "cilios",
    name: "Mega volume",
    description: "Fios bem preenchidos para um olhar ousado.",
    priceCents: 19000,
    maintenanceCents: 13000,
    returnInfo: RETURN_30,
  },
  {
    slug: "remocao-de-extensao",
    categorySlug: "cilios",
    name: "Remoção de extensão",
    description:
      "Remoção da extensão com produto e técnica apropriados. Não remova os fios em casa.",
    priceCents: 4000,
    notes: ["Não remova os fios em casa."],
  },
  {
    slug: "volume-brasileiro",
    categorySlug: "cilios",
    name: "Volume brasileiro",
    description: "Efeito Y 2D natural. Veja também a opção no castanho.",
    priceCents: 14000,
    maintenanceCents: 10000,
    returnInfo: RETURN_30,
    relatedSlugs: ["volume-brasileiro-no-castanho"],
  },
  {
    slug: "volume-brasileiro-no-castanho",
    categorySlug: "cilios",
    name: "Volume brasileiro no castanho",
    description: "Efeito Y 2D natural com fios castanhos.",
    priceCents: 16000,
    maintenanceCents: 12000,
    returnInfo: RETURN_30,
    relatedSlugs: ["volume-brasileiro"],
  },
  {
    slug: "volume-egipcio",
    categorySlug: "cilios",
    name: "Volume egípcio",
    description:
      "Efeito de olhar marcado e leve. Método disponível em preto; veja também a opção no castanho.",
    priceCents: 16000,
    maintenanceCents: 12000,
    returnInfo: RETURN_30,
    relatedSlugs: ["volume-egipcio-no-castanho"],
  },
  {
    slug: "volume-egipcio-no-castanho",
    categorySlug: "cilios",
    name: "Volume egípcio no castanho",
    description:
      "Versão do método egípcio com fios castanhos para um efeito de olhar marcado e leve.",
    priceCents: 18000,
    maintenanceCents: 14000,
    returnInfo: RETURN_30,
    relatedSlugs: ["volume-egipcio"],
  },
  {
    slug: "volume-hibrido",
    categorySlug: "cilios",
    name: "Volume híbrido",
    description: "Fans preenchidos para um olhar impactante.",
    priceCents: 16000,
    maintenanceCents: 12000,
    returnInfo: RETURN_30,
  },
  {
    slug: "volume-moderado",
    categorySlug: "cilios",
    name: "Volume moderado",
    description: "Fios 3D para um resultado leve e sutil.",
    priceCents: 16000,
    maintenanceCents: 11000,
    returnInfo: RETURN_30,
  },

  // ---------- SOBRANCELHAS ----------
  {
    slug: "brow-lamination",
    categorySlug: "sobrancelhas",
    name: "Brow lamination",
    description:
      "Técnica para alinhar os fios e criar um efeito de sobrancelhas mais volumosas e preenchidas.",
    priceCents: 8000,
  },
  {
    slug: "design-com-henna",
    categorySlug: "sobrancelhas",
    name: "Design com henna",
    description:
      "Design personalizado associado à aplicação de henna para realçar as sobrancelhas.",
    priceCents: 6000,
  },
  {
    slug: "design-de-sobrancelhas-com-cera",
    categorySlug: "sobrancelhas",
    name: "Design de sobrancelhas com cera",
    description:
      "Design personalizado de acordo com o rosto, realizado com cera fria.",
    priceCents: 3000,
  },
  {
    slug: "henna-nas-sobrancelhas",
    categorySlug: "sobrancelhas",
    name: "Henna nas sobrancelhas",
    description:
      "Pigmentação com henna para realçar o desenho e preencher visualmente pequenas falhas.",
    priceCents: 3000,
  },

  // ---------- DEPILAÇÃO ----------
  {
    slug: "buco-com-cera-fria",
    categorySlug: "depilacao",
    name: "Buço com cera fria",
    description: "Remoção dos pelos do buço com cera fria.",
    priceCents: 1000,
  },
  {
    slug: "depilacao-facial-completa-com-navalha",
    categorySlug: "depilacao",
    name: "Depilação facial completa com navalha",
    description:
      "Procedimento facial completo com navalha, apresentado como dermapiling no catálogo do Studio.",
    priceCents: 3000,
  },

  // ---------- LÁBIOS ----------
  {
    slug: "hidra-gloss-color",
    categorySlug: "labios",
    name: "Hidra Gloss Color",
    description:
      "Regeneração, hidratação e efeito lip tint, com durabilidade de até 30 dias.",
    priceCents: 7000,
  },
  {
    slug: "nano-lips-gloss",
    categorySlug: "labios",
    name: "Nano Lips Gloss",
    description: "Efeito marcante.",
    priceCents: 15000,
  },
];
