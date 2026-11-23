/**
 * Gera o SQL que vincula as imagens de site-media/servicos/ aos serviços.
 *
 *   npm run link:images -- arquivos.txt
 *
 * `arquivos.txt`: um nome de arquivo por linha (com ou sem "servicos/"), ou a saída
 * colada do SQL Editor (ver docs/CATALOGO-IMAGENS.md). Só vincula quando o nome do
 * arquivo (sem extensão) é IDÊNTICO ao slug do serviço; o resto vira relatório.
 * Não acessa banco nem rede; só escreve supabase/link_images.sql e supabase/verify_images.sql.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { services } from "../src/features/catalog/data";
import { buildLinkSql, buildVerifySql, matchImages, parseFileList } from "../src/features/catalog/image-linking";

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith("--") && !args[args.indexOf(a) - 1]?.startsWith("--confirm"));
// --confirm "arquivo.jpg=slug-do-servico"  (vínculo que NÃO é óbvio, confirmado por você)
const confirmations: Record<string, string> = {};
args.forEach((a, i) => {
  if (a !== "--confirm") return;
  const [file, slug] = (args[i + 1] ?? "").split("=");
  if (!file || !slug) {
    console.error('Use --confirm "arquivo.jpg=slug-do-servico"');
    process.exit(2);
  }
  confirmations[file] = slug;
});
if (!input) {
  console.error('Uso: npm run link:images -- arquivos.txt [--confirm "arquivo.jpg=slug"]');
  process.exit(2);
}
const { files, ignored } = parseFileList(readFileSync(input, "utf8"));
const refs = services.map((s) => ({ slug: s.slug, name: s.name }));
const r = matchImages(files, refs, ignored, confirmations);

const list = (title: string, items: string[]) => {
  console.log(`\n${title} (${items.length})`);
  for (const i of items) console.log(`  - ${i}`);
};
console.log(`Arquivos lidos: ${files.length} | Serviços cadastrados: ${services.length}`);
list("VINCULADOS", r.links.map((l) => `${l.slug}  <-  ${l.imagePath}  [${l.kind}]`));
list("SEM IMAGEM (continuam com image_path nulo)", r.servicesWithoutImage);
list("ARQUIVOS SEM SERVIÇO DE MESMO NOME (não vinculados)", r.unmatchedFiles);
list("ARQUIVOS COM NOME RECUSADO PELO BANCO (renomeie no Storage)", r.invalidFiles);
list("CONFLITOS (mais de um formato do mesmo serviço; não vinculados)", r.conflicts.map((c) => `${c.slug}: ${c.files.join(", ")}`));
list("SUGESTÕES NÃO APLICADAS (confirme e renomeie o arquivo, ou me diga)", r.suggestions.map((s) => `${s.file}  ~  ${s.slug}  (${s.reason})  -> para aceitar: --confirm "${s.file.replace("servicos/", "")}=${s.slug}"`));

if (r.links.length === 0) {
  console.error("\nNenhum vínculo exato encontrado: nada foi gerado.");
  process.exit(1);
}
writeFileSync("supabase/link_images.sql", buildLinkSql(r.links));
writeFileSync("supabase/verify_images.sql", buildVerifySql(r.links, services.length));
console.log(`\nGerado: supabase/link_images.sql (${r.links.length} vínculos) e supabase/verify_images.sql`);
