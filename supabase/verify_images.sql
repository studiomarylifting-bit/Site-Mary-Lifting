-- GERADO por scripts/link-images.ts. SOMENTE LEITURA: nada aqui altera dados.
-- Esperado: 21 serviços com imagem e 2 sem imagem (de 23).

-- A) RESUMO: cada linha deve ser OK.
with expected(slug, path) as (values
    ('6d-volume-glamour', 'servicos/6D.jpg'),
    ('efeito-rimel-jade-picon', 'servicos/Efeito rImel Jade Picon.jpg'),
    ('fio-a-fio-classico', 'servicos/Fio a fio classico.jpg'),
    ('fox-easy', 'servicos/Fox Easy.jpg'),
    ('jade-picon-no-castanho', 'servicos/Jade Picon no castanho.jpg'),
    ('kim-kardashian', 'servicos/Kim Kardashian.jpg'),
    ('mega-brasileiro', 'servicos/Mega brasileiro.jpg'),
    ('mega-volume', 'servicos/Mega volume.jpg'),
    ('volume-brasileiro', 'servicos/Volume brasileiro.jpg'),
    ('volume-brasileiro-no-castanho', 'servicos/Volume brasileiro no castanho.jpg'),
    ('volume-egipcio-no-castanho', 'servicos/Volume egipcio no castanho.jpg'),
    ('volume-hibrido', 'servicos/Volume hibrido.jpg'),
    ('volume-moderado', 'servicos/Volume moderado.jpg'),
    ('brow-lamination', 'servicos/Brow lamination.jpg'),
    ('design-com-henna', 'servicos/Design com henna.jpg'),
    ('design-de-sobrancelhas-com-cera', 'servicos/Design de sobrancelhas com cera.jpg'),
    ('henna-nas-sobrancelhas', 'servicos/Henna nas sobrancelhas.jpg'),
    ('buco-com-cera-fria', 'servicos/Buco com cera fria.jpg'),
    ('depilacao-facial-completa-com-navalha', 'servicos/Depilacao facial completa com navalha.jpg'),
    ('hidra-gloss-color', 'servicos/Hidra Gloss Color.jpg'),
    ('nano-lips-gloss', 'servicos/Nano Lips Gloss.jpg')
),
sv as (select slug, image_path from public.services),
objs as (select name from storage.objects where bucket_id = 'site-media' and name like 'servicos/%')
select * from (
  select 1 as n, 'vínculos esperados gravados corretamente (21)' as verificacao,
         case when (select count(*) from expected e join sv on sv.slug = e.slug and sv.image_path = e.path) = 21 then 'OK' else 'FALHA' end as resultado
  union all
  select 2, 'serviços com imagem = 21',
         case when (select count(*) from sv where image_path is not null) = 21 then 'OK' else 'FALHA' end
  union all
  select 3, 'serviços sem imagem = 2',
         case when (select count(*) from sv where image_path is null) = 2 then 'OK' else 'FALHA' end
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
  select 7, 'total de serviços inalterado (23)',
         case when (select count(*) from sv) = 23 then 'OK' else 'FALHA' end
) r order by n;

-- B) Conferência visual: serviço -> arquivo (esperado x gravado). 'DIFERENTE' deve ser 0 linhas.
select e.slug, e.path as esperado, sv.image_path as gravado,
       case when sv.image_path = e.path then 'igual' else 'DIFERENTE' end as status
from (values
    ('6d-volume-glamour', 'servicos/6D.jpg'),
    ('efeito-rimel-jade-picon', 'servicos/Efeito rImel Jade Picon.jpg'),
    ('fio-a-fio-classico', 'servicos/Fio a fio classico.jpg'),
    ('fox-easy', 'servicos/Fox Easy.jpg'),
    ('jade-picon-no-castanho', 'servicos/Jade Picon no castanho.jpg'),
    ('kim-kardashian', 'servicos/Kim Kardashian.jpg'),
    ('mega-brasileiro', 'servicos/Mega brasileiro.jpg'),
    ('mega-volume', 'servicos/Mega volume.jpg'),
    ('volume-brasileiro', 'servicos/Volume brasileiro.jpg'),
    ('volume-brasileiro-no-castanho', 'servicos/Volume brasileiro no castanho.jpg'),
    ('volume-egipcio-no-castanho', 'servicos/Volume egipcio no castanho.jpg'),
    ('volume-hibrido', 'servicos/Volume hibrido.jpg'),
    ('volume-moderado', 'servicos/Volume moderado.jpg'),
    ('brow-lamination', 'servicos/Brow lamination.jpg'),
    ('design-com-henna', 'servicos/Design com henna.jpg'),
    ('design-de-sobrancelhas-com-cera', 'servicos/Design de sobrancelhas com cera.jpg'),
    ('henna-nas-sobrancelhas', 'servicos/Henna nas sobrancelhas.jpg'),
    ('buco-com-cera-fria', 'servicos/Buco com cera fria.jpg'),
    ('depilacao-facial-completa-com-navalha', 'servicos/Depilacao facial completa com navalha.jpg'),
    ('hidra-gloss-color', 'servicos/Hidra Gloss Color.jpg'),
    ('nano-lips-gloss', 'servicos/Nano Lips Gloss.jpg')
) as e(slug, path)
left join public.services sv on sv.slug = e.slug
order by e.slug;

-- C) Serviços SEM imagem (devem ser exatamente 2).
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
