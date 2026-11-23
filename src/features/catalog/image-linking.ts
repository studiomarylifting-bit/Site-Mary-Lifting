import { isValidImagePath } from "./storage";

/**
 * Correspondência entre arquivos enviados ao Storage (site-media/servicos/) e
 * serviços cadastrados. Módulo puro: sem rede, sem banco.
 *
 * Regra ÚNICA de vínculo automático (exata):
 *   nome do arquivo SEM extensão === slug do serviço (idêntico, caractere a caractere).
 * Qualquer outra semelhança vira SUGESTÃO para a pessoa confirmar e nunca entra no SQL.
 */
export interface ServiceRef {
  slug: string;
  name: string;
}

export interface Suggestion {
  file: string;
  slug: string;
  reason: "mesmo texto sem acentos/maiúsculas/separadores" | "nome do serviço";
}

export interface MatchResult {
  /** Vínculos exatos: viram UPDATE. */
  links: { slug: string; imagePath: string }[];
  /** Arquivos que casam com mais de um formato do mesmo serviço (ex.: x.jpg e x.webp). Não vinculados. */
  conflicts: { slug: string; files: string[] }[];
  /** Arquivos sem serviço de mesmo slug. Não vinculados. */
  unmatchedFiles: string[];
  /** Arquivos cujo nome o banco recusaria (espaço, acento, extensão inválida...). Não vinculados. */
  invalidFiles: string[];
  /** Semelhanças NÃO aplicadas, para conferência manual. */
  suggestions: Suggestion[];
  /** Serviços que ficarão com image_path nulo. */
  servicesWithoutImage: string[];
  /** Linhas ignoradas na leitura (cabeçalho, "(21 rows)" etc.). */
  ignoredLines: string[];
}

const FOLDER = "servicos/";

/** Aceita uma lista simples ou a saída colada do SQL Editor (cabeçalho, ---, "(21 rows)", aspas, vírgulas, |). */
export function parseFileList(raw: string): { files: string[]; ignored: string[] } {
  const files: string[] = [];
  const ignored: string[] = [];
  const seen = new Set<string>();
  for (const line of raw.split(/\r?\n/)) {
    let t = line.trim().replace(/^[|"'`]+|[|"'`,;]+$/g, "").trim();
    if (!t) continue;
    if (/^-+[\s+|-]*$/.test(t) || /^\(\d+ rows?\)$/i.test(t) || /^name$/i.test(t) || /^\d+\s+rows?$/i.test(t)) {
      ignored.push(line.trim());
      continue;
    }
    if (!t.startsWith(FOLDER)) {
      if (t.includes("/")) {
        ignored.push(line.trim());
        continue;
      }
      t = FOLDER + t;
    }
    if (t === FOLDER || t.endsWith("/") || t.endsWith(".emptyFolderPlaceholder")) {
      ignored.push(line.trim());
      continue;
    }
    if (!seen.has(t)) {
      seen.add(t);
      files.push(t);
    }
  }
  return { files, ignored };
}

const stemOf = (path: string) => path.slice(FOLDER.length).replace(/\.[^.]+$/, "");

export const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function matchImages(files: string[], services: ServiceRef[], ignoredLines: string[] = []): MatchResult {
  const bySlug = new Map(services.map((s) => [s.slug, s]));
  const links: MatchResult["links"] = [];
  const conflicts: MatchResult["conflicts"] = [];
  const unmatchedFiles: string[] = [];
  const invalidFiles: string[] = [];
  const suggestions: Suggestion[] = [];

  const exactByService = new Map<string, string[]>();
  for (const file of files) {
    if (!isValidImagePath(file)) {
      invalidFiles.push(file);
      continue;
    }
    const stem = stemOf(file);
    if (bySlug.has(stem)) {
      exactByService.set(stem, [...(exactByService.get(stem) ?? []), file]);
      continue;
    }
    unmatchedFiles.push(file);
    const n = normalize(stem);
    for (const s of services) {
      if (normalize(s.slug) === n) suggestions.push({ file, slug: s.slug, reason: "mesmo texto sem acentos/maiúsculas/separadores" });
      else if (normalize(s.name) === n) suggestions.push({ file, slug: s.slug, reason: "nome do serviço" });
    }
  }
  for (const s of services) {
    const found = exactByService.get(s.slug);
    if (!found) continue;
    if (found.length === 1) links.push({ slug: s.slug, imagePath: found[0]! });
    else conflicts.push({ slug: s.slug, files: found });
  }
  const linked = new Set(links.map((l) => l.slug));
  return {
    links,
    conflicts,
    unmatchedFiles,
    invalidFiles,
    suggestions,
    servicesWithoutImage: services.filter((s) => !linked.has(s.slug)).map((s) => s.slug),
    ignoredLines,
  };
}

const q = (v: string) => `'${v.replace(/'/g, "''")}'`;

/**
 * UPDATE idempotente: só toca image_path (e apenas onde mudou). Em uma transação,
 * confere que cada slug existe; se algum faltar, aborta tudo (ROLLBACK) sem alterar nada.
 */
export function buildLinkSql(links: MatchResult["links"]): string {
  const values = links.map((l) => `    (${q(l.slug)}, ${q(l.imagePath)})`).join(",\n");
  return `-- GERADO por scripts/link-images.ts. Revise antes de executar.
-- Preenche SOMENTE services.image_path (${links.length} serviços). Não altera preço, nome,
-- descrição, categoria, id, posição nem status. Idempotente: rodar de novo não muda nada.
-- Serviços que não aparecem aqui permanecem com o image_path que já tinham (nulo, se nunca preenchido).
begin;

do $$
declare
  faltando text;
  alterados int;
begin
  select string_agg(v.slug, ', ') into faltando
  from (values
${values}
  ) as v(slug, path)
  where not exists (select 1 from public.services s where s.slug = v.slug);
  if faltando is not null then
    raise exception 'Serviço(s) inexistente(s): %. Nada foi alterado.', faltando;
  end if;

  update public.services s
     set image_path = v.path
    from (values
${values}
    ) as v(slug, path)
   where s.slug = v.slug
     and s.image_path is distinct from v.path;
  get diagnostics alterados = row_count;
  raise notice 'image_path atualizado em % serviço(s) (esperado: no máximo ${links.length}; 0 = já estava tudo vinculado).', alterados;
end $$;

commit;
`;
}

/** Verificação SOMENTE LEITURA, com o mapeamento esperado embutido. */
export function buildVerifySql(links: MatchResult["links"], totalServices: number): string {
  const values = links.map((l) => `    (${q(l.slug)}, ${q(l.imagePath)})`).join(",\n");
  return `-- GERADO por scripts/link-images.ts. SOMENTE LEITURA: nada aqui altera dados.
-- Esperado: ${links.length} serviços com imagem e ${totalServices - links.length} sem imagem (de ${totalServices}).

-- A) RESUMO: cada linha deve ser OK.
with expected(slug, path) as (values
${values}
),
sv as (select slug, image_path from public.services),
objs as (select name from storage.objects where bucket_id = 'site-media' and name like 'servicos/%')
select * from (
  select 1 as n, 'vínculos esperados gravados corretamente (${links.length})' as verificacao,
         case when (select count(*) from expected e join sv on sv.slug = e.slug and sv.image_path = e.path) = ${links.length} then 'OK' else 'FALHA' end as resultado
  union all
  select 2, 'serviços com imagem = ${links.length}',
         case when (select count(*) from sv where image_path is not null) = ${links.length} then 'OK' else 'FALHA' end
  union all
  select 3, 'serviços sem imagem = ${totalServices - links.length}',
         case when (select count(*) from sv where image_path is null) = ${totalServices - links.length} then 'OK' else 'FALHA' end
  union all
  select 4, 'nenhum image_path repetido em dois serviços',
         case when not exists (select 1 from sv where image_path is not null group by image_path having count(*) > 1) then 'OK' else 'FALHA' end
  union all
  select 5, 'todo image_path aponta para um arquivo que existe no bucket',
         case when not exists (select 1 from sv where image_path is not null and image_path not in (select name from objs)) then 'OK' else 'FALHA' end
  union all
  select 6, 'nenhum serviço fora da lista esperada recebeu imagem',
         case when not exists (select 1 from sv where image_path is not null and slug not in (select slug from expected)) then 'OK' else 'FALHA' end
  union all
  select 7, 'total de serviços inalterado (${totalServices})',
         case when (select count(*) from sv) = ${totalServices} then 'OK' else 'FALHA' end
) r order by n;

-- B) Conferência visual: serviço -> arquivo (esperado x gravado). 'DIFERENTE' deve ser 0 linhas.
select e.slug, e.path as esperado, sv.image_path as gravado,
       case when sv.image_path = e.path then 'igual' else 'DIFERENTE' end as status
from (values
${values}
) as e(slug, path)
left join public.services sv on sv.slug = e.slug
order by e.slug;

-- C) Serviços SEM imagem (devem ser exatamente ${totalServices - links.length}).
select position, slug, name from public.services where image_path is null order by position;

-- D) Duplicidades: o mesmo arquivo em mais de um serviço (esperado: 0 linhas).
select image_path, count(*) as servicos, string_agg(slug, ', ') as slugs
from public.services where image_path is not null group by image_path having count(*) > 1;

-- E) image_path que NÃO existe no Storage (esperado: 0 linhas).
select s.slug, s.image_path from public.services s
where s.image_path is not null
  and not exists (select 1 from storage.objects o where o.bucket_id = 'site-media' and o.name = s.image_path);

-- F) Arquivos em servicos/ que nenhum serviço usa (informativo: devem ser os não vinculados).
select o.name as arquivo_sem_servico from storage.objects o
where o.bucket_id = 'site-media' and o.name like 'servicos/%'
  and o.name not like '%.emptyFolderPlaceholder'
  and not exists (select 1 from public.services s where s.image_path = o.name)
order by o.name;
`;
}
