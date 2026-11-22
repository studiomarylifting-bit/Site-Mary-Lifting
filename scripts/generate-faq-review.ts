/**
 * Gera docs/FAQ-REVISAO.md a partir de src/features/faq/data.ts.
 * Lista o que a proprietária precisa confirmar antes de o FAQ ser considerado final.
 * Uso: npm run faq:review
 */
import { writeFileSync } from "node:fs";
import { faqAnswerText, faqItems } from "../src/features/faq/data";

const lines: string[] = [
  "# FAQ da home — revisão da proprietária",
  "",
  "<!-- GERADO por scripts/generate-faq-review.ts. Não edite à mão: altere src/features/faq/data.ts. -->",
  "",
  "As respostas usam só o conteúdo já informado pelo Studio (catálogo, pagamentos, endereço e ficha).",
  "Onde a regra ainda não foi informada, a resposta é prudente e remete ao atendimento.",
  "Estes itens precisam da sua confirmação. Depois de definir, atualize o texto em `src/features/faq/data.ts`",
  "e troque `needsOwnerReview` para `false`.",
  "",
];
const pending = faqItems.filter((i) => i.needsOwnerReview);
lines.push(`## Pendentes (${pending.length} de ${faqItems.length})`, "");
for (const i of pending) {
  lines.push(`### ${i.question}`, "", `**O que definir:** ${i.reviewNote ?? "(sem nota)"}`, "", "**Resposta exibida hoje:**", "");
  lines.push(...faqAnswerText(i).split(/(?<=\.)\s+/).map((s) => `> ${s}`), "");
}
lines.push("## Confirmados com o conteúdo existente", "");
for (const i of faqItems.filter((x) => !x.needsOwnerReview)) lines.push(`- ${i.question}`);
lines.push("");
writeFileSync("docs/FAQ-REVISAO.md", lines.join("\n"));
console.log(`docs/FAQ-REVISAO.md: ${pending.length} pendentes de ${faqItems.length}`);
