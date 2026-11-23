-- Verificação SOMENTE LEITURA do catálogo. Cole no SQL Editor do Supabase depois de
-- aplicar as migrations e o seed. Nada aqui altera dados.

-- 1) Contagens esperadas: 4 categorias e 23 serviços (15 + 4 + 2 + 2).
select c.slug, c.title, c.declared_option_count as declaradas, count(s.slug) as cadastrados
from public.service_categories c
left join public.services s on s.category_slug = c.slug
group by c.slug, c.title, c.declared_option_count, c.position
order by c.position;
select count(*) as total_servicos from public.services;

-- 2) Nenhum serviço duplicado (esperado: 0 linhas).
select name, count(*) from public.services group by name having count(*) > 1;

-- 3) Preços em reais (colunas geradas, só leitura) e prazo de manutenção.
--    "Remoção de extensão" deve ter maintenance_price e maintenance_days NULOS.
select position, name, application_price, maintenance_price, maintenance_days, image_path
from public.services order by position;

-- 4) Imagens ainda não cadastradas (no início: total_servicos = sem_imagem).
select count(*) filter (where image_path is null) as sem_imagem,
       count(*) filter (where image_path is not null) as com_imagem
from public.services;

-- 5) RLS ligado nas duas tabelas (esperado: rowsecurity = true).
select tablename, rowsecurity from pg_tables
where schemaname = 'public' and tablename in ('service_categories', 'services');

-- 6) Políticas do catálogo e do bucket.
select tablename, policyname, cmd from pg_policies
where (schemaname = 'public' and tablename in ('service_categories', 'services'))
   or (schemaname = 'storage' and tablename = 'objects' and policyname like 'site_media_%')
order by tablename, policyname;

-- 7) Bucket: público, 5 MB, só imagens.
select id, public, file_size_limit, allowed_mime_types from storage.buckets where id = 'site-media';
