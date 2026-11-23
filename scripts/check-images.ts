/**
 * Diagnóstico: por que as fotos não aparecem?  Uso: npm run check:images
 * Lê .env.local, consulta o Supabase com a chave PÚBLICA (a mesma que o site usa) e
 * testa a URL pública de cada foto. Não altera nada e não imprime chaves.
 */
import { existsSync, readFileSync } from "node:fs";
import { publicImageUrl } from "../src/features/catalog/storage";

function loadDotEnv(file: string) {
  if (!existsSync(file)) return false;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m?.[1] && process.env[m[1]] === undefined) process.env[m[1]] = (m[2] ?? "").replace(/^["']|["']$/g, "");
  }
  return true;
}
loadDotEnv(".env.local");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "");
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const stop = (msg: string): never => {
  console.log(`\nPARE AQUI: ${msg}`);
  process.exit(1);
};

async function main() {
  console.log("1) Variáveis do site");
  if (!url || !key) stop("NEXT_PUBLIC_SUPABASE_URL e/ou NEXT_PUBLIC_SUPABASE_ANON_KEY não estão no .env.local.\n   Sem elas o site usa o catálogo ESTÁTICO, que não tem fotos. Preencha e REINICIE o servidor (npm run dev).");
  console.log(`   OK  URL do projeto: ${new URL(url!).hostname}`);

  const get = async (u: string, init: RequestInit = {}) => {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 12000);
    try {
      return await fetch(u, { ...init, signal: ctl.signal });
    } finally {
      clearTimeout(t);
    }
  };

  interface Row { slug: string; name: string; image_path: string | null }
  console.log("\n2) O site consegue ler a tabela services? (papel anon)");
  let rows: Row[] = [];
  try {
    const res = await get(`${url}/rest/v1/services?select=slug,name,image_path&order=position`, {
      headers: { apikey: key!, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      const hint = res.status === 401 || res.status === 403 ? "chave anon inválida ou sem permissão" : res.status === 404 ? "tabela não existe: rode as migrations" : "erro do Supabase";
      stop(`HTTP ${res.status} ao ler services (${hint}).\n   Rode as migrations e o seed (docs/CATALOGO-IMAGENS.md) e confira a chave anon.`);
    }
    rows = (await res.json()) as Row[];
  } catch {
    stop("não consegui falar com o Supabase (rede ou URL errada).");
  }
  console.log(`   OK  ${rows.length} serviços lidos`);
  if (rows.length === 0) stop("a tabela está vazia: rode supabase/seed.sql.");

  const withImg = rows.filter((r) => r.image_path);
  console.log("\n3) Vínculos (image_path preenchido)");
  console.log(`   ${withImg.length} com image_path, ${rows.length - withImg.length} sem`);
  if (withImg.length === 0) stop("nenhum serviço tem image_path: rode supabase/link_images.sql no SQL Editor.");

  console.log("\n4) A URL pública de cada foto abre? (HEAD)");
  let bad = 0;
  for (const r of withImg) {
    const u = publicImageUrl(r.image_path, url);
    if (!u) {
      bad++;
      console.log(`   FALHA ${r.slug.padEnd(38)} caminho inválido para o site: ${r.image_path}`);
      continue;
    }
    try {
      const res = await get(u, { method: "HEAD" });
      const type = res.headers.get("content-type") ?? "?";
      const ok = res.ok && type.startsWith("image/");
      if (!ok) bad++;
      const why = res.status === 400 || res.status === 404 ? "  <- arquivo não existe com esse nome EXATO (maiúsculas e espaços contam) ou o bucket não é público" : "";
      console.log(`   ${ok ? "OK   " : "FALHA"} ${r.slug.padEnd(38)} HTTP ${res.status} ${type}${why}`);
    } catch {
      bad++;
      console.log(`   FALHA ${r.slug.padEnd(38)} sem resposta`);
    }
  }
  console.log(
    bad === 0
      ? `\nTudo certo: ${withImg.length} fotos acessíveis. Se o site ainda não mostra, REINICIE o servidor (o next.config.mjs só lê o .env na partida) e recarregue com Ctrl+Shift+R.`
      : `\n${bad} foto(s) com problema. Corrija o nome no Storage ou o image_path e rode de novo.`,
  );
  process.exit(bad === 0 ? 0 : 1);
}

main().catch(() => {
  console.log("\nErro inesperado no diagnóstico.");
  process.exit(1);
});
