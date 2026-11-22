import { describe, expect, it } from "vitest";
import { buildFaqJsonLd, faqAnswerText, faqItems, serializeJsonLd } from "@/features/faq/data";
import { studio } from "@/lib/studio";

/** Valores aceitos por /sac?tipo= (espelha `ticketTypes` em schemas.ts). */
const sacTypes = ["duvida", "agendamento", "procedimento", "pos_atendimento", "financeiro", "privacidade", "reclamacao", "sugestao", "outro"];

const requiredQuestions = [
  "Quanto tempo dura uma extensão de cílios?",
  "Qual a diferença entre os efeitos de extensão?",
  "Como cuidar das extensões após o procedimento?",
  "Posso realizar manutenção de uma extensão feita por outra profissional?",
  "Existem contraindicações para os procedimentos?",
  "Como faço para escolher o efeito ideal para mim?",
  "Quais são as formas de pagamento?",
  "Onde fica o Studio Mary Lifting?",
];

describe("FAQ da home", () => {
  it("contém as 8 perguntas pedidas, na ordem", () => {
    expect(faqItems.map((i) => i.question)).toEqual(requiredQuestions);
  });

  it("usa ids únicos e respostas não vazias", () => {
    const ids = faqItems.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const i of faqItems) expect(i.answer.length).toBeGreaterThan(0);
  });

  it("pagamento lista exatamente as formas informadas pelo Studio", () => {
    const text = faqAnswerText(faqItems.find((i) => i.id === "pagamento")!).toLowerCase();
    for (const m of studio.paymentMethods) expect(text).toContain(m.toLowerCase());
  });

  it("localização usa o endereço oficial", () => {
    const text = faqAnswerText(faqItems.find((i) => i.id === "localizacao")!);
    expect(text).toContain(studio.address.display);
  });

  it("não inventa prazos ou valores de duração: só o retorno de 30 dias do catálogo", () => {
    const text = faqAnswerText(faqItems.find((i) => i.id === "duracao")!);
    expect(text).toContain("30 dias");
    expect(/\b\d+\s*(semanas?|meses|mês)\b/i.test(text)).toBe(false);
  });

  it("itens sem confirmação da proprietária trazem nota de revisão", () => {
    for (const i of faqItems.filter((x) => x.needsOwnerReview)) {
      expect((i.reviewNote ?? "").length).toBeGreaterThan(10);
    }
  });

  it("não expõe notas internas no texto público", () => {
    for (const i of faqItems) {
      const pub = faqAnswerText(i) + JSON.stringify(i.links ?? []);
      if (i.reviewNote) expect(pub).not.toContain(i.reviewNote);
    }
  });

  it("links internos têm formato válido e ?tipo= conhecido", () => {
    for (const i of faqItems) {
      for (const l of i.links ?? []) {
        if (l.external) {
          expect(l.href.startsWith("https://")).toBe(true);
          continue;
        }
        expect(l.href.startsWith("/")).toBe(true);
        const tipo = new URL(l.href, "https://x.test").searchParams.get("tipo");
        if (tipo !== null) expect(sacTypes).toContain(tipo);
      }
    }
  });
});

describe("JSON-LD do FAQ", () => {
  it("é um FAQPage com o mesmo texto exibido", () => {
    const ld = buildFaqJsonLd();
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity).toHaveLength(faqItems.length);
    expect(ld.mainEntity[0]!.name).toBe(requiredQuestions[0]);
    expect(ld.mainEntity[0]!.acceptedAnswer.text).toBe(faqAnswerText(faqItems[0]!));
  });

  it("escapa '<' para impedir fechar a tag <script>", () => {
    const out = serializeJsonLd({ a: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(out).toContain("\\u003c/script>");
    expect(JSON.parse(out).a).toBe("</script><script>alert(1)</script>");
  });
});
