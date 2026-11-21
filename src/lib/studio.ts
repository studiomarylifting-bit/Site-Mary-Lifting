/** Informações institucionais fornecidas pelo Studio. Não adicionar dados não informados. */
export const studio = {
  name: "Mary Lifting",
  fullName: "Studio Mary Lifting — Lash e Estética",
  brandLine: "MARY LIFTING · LASH E ESTÉTICA",
  headline: "BELEZA QUE RESPEITA SUA ESSÊNCIA",
  subheadline: "Seu próximo cuidado começa aqui.",
  address: {
    street: "Rua Tiradentes, 144",
    district: "Centro",
    city: "Embu-Guaçu",
    state: "SP",
    display: "Rua Tiradentes, 144 — Centro, Embu-Guaçu — SP",
  },
  instagram: {
    handle: "@studio_marylifting",
    url: "https://www.instagram.com/studio_marylifting/",
  },
  maps: {
    gps: "https://www.google.com/maps/search/?api=1&query=Rua%20Tiradentes%2C%20144%2C%20Centro%2C%20Embu-Gua%C3%A7u%2C%20S%C3%A3o%20Paulo",
    /** Embed por busca de endereço (sem chave). */
    embed:
      "https://www.google.com/maps?q=Rua%20Tiradentes%2C%20144%2C%20Centro%2C%20Embu-Gua%C3%A7u%2C%20S%C3%A3o%20Paulo&output=embed",
  },
  paymentMethods: ["Dinheiro", "Pix", "Cartão", "Link de pagamento"],
  referenceSite: "https://studio-mary-lifting-cadastro.orderlysloth4.chatgpt.site",
} as const;
