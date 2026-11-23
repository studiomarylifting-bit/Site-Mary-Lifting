-- GERADO por scripts/link-images.ts. Revise antes de executar.
-- Correspondência (arquivo -> serviço [critério]):
--   servicos/6D.jpg                                  -> 6d-volume-glamour                        [indicado manualmente - CONFIRA]
--   servicos/Efeito rImel Jade Picon.jpg             -> efeito-rimel-jade-picon                  [nome equivalente]
--   servicos/Fio a fio classico.jpg                  -> fio-a-fio-classico                       [nome equivalente]
--   servicos/Fox Easy.jpg                            -> fox-easy                                 [nome equivalente]
--   servicos/Jade Picon no castanho.jpg              -> jade-picon-no-castanho                   [nome equivalente]
--   servicos/Kim Kardashian.jpg                      -> kim-kardashian                           [nome equivalente]
--   servicos/Mega brasileiro.jpg                     -> mega-brasileiro                          [nome equivalente]
--   servicos/Mega volume.jpg                         -> mega-volume                              [nome equivalente]
--   servicos/Volume brasileiro.jpg                   -> volume-brasileiro                        [nome equivalente]
--   servicos/Volume brasileiro no castanho.jpg       -> volume-brasileiro-no-castanho            [nome equivalente]
--   servicos/Volume egipcio no castanho.jpg          -> volume-egipcio-no-castanho               [nome equivalente]
--   servicos/Volume hibrido.jpg                      -> volume-hibrido                           [nome equivalente]
--   servicos/Volume moderado.jpg                     -> volume-moderado                          [nome equivalente]
--   servicos/Brow lamination.jpg                     -> brow-lamination                          [nome equivalente]
--   servicos/Design com henna.jpg                    -> design-com-henna                         [nome equivalente]
--   servicos/Design de sobrancelhas com cera.jpg     -> design-de-sobrancelhas-com-cera          [nome equivalente]
--   servicos/Henna nas sobrancelhas.jpg              -> henna-nas-sobrancelhas                   [nome equivalente]
--   servicos/Buco com cera fria.jpg                  -> buco-com-cera-fria                       [nome equivalente]
--   servicos/Depilacao facial completa com navalha.jpg -> depilacao-facial-completa-com-navalha    [nome equivalente]
--   servicos/Hidra Gloss Color.jpg                   -> hidra-gloss-color                        [nome equivalente]
--   servicos/Nano Lips Gloss.jpg                     -> nano-lips-gloss                          [nome equivalente]
-- Preenche SOMENTE services.image_path (21 serviços). Não altera preço, nome,
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
  ) as v(slug, path)
  where not exists (select 1 from public.services s where s.slug = v.slug);
  if faltando is not null then
    raise exception 'Serviço(s) inexistente(s): %. Nada foi alterado.', faltando;
  end if;

  update public.services s
     set image_path = v.path
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
    ) as v(slug, path)
   where s.slug = v.slug
     and s.image_path is distinct from v.path;
  get diagnostics alterados = row_count;
  raise notice 'image_path atualizado em % serviço(s) (esperado: no máximo 21; 0 = já estava tudo vinculado).', alterados;
end $$;

commit;
