-- =====================================================================
-- Permite espaços (e maiúsculas) em image_path, para aceitar nomes de arquivo
-- como "Brow lamination.jpg" exatamente como estão no Storage.
--
-- ADITIVA e IDEMPOTENTE: só troca duas constraints CHECK. Nenhum dado é alterado
-- ou removido. Mantém o que protege: caminho dentro de servicos/ (ou categorias/),
-- sem "..", sem "?" "#" "%" ";" ":" "\" nem aspas, e só extensões de imagem.
-- Roda DEPOIS de 20261122000001_catalog_storage.sql.
-- =====================================================================
alter table public.services drop constraint if exists services_image_path_chk;
alter table public.services add constraint services_image_path_chk check (
  image_path is null or (
    image_path ~* '^servicos/[a-z0-9][a-z0-9 ._/-]*\.(jpe?g|png|webp|avif)$'
    and image_path !~ '\.\.'
    and length(image_path) <= 200
  )
);

alter table public.service_categories drop constraint if exists service_categories_image_path_chk;
alter table public.service_categories add constraint service_categories_image_path_chk check (
  image_path is null or (
    image_path ~* '^categorias/[a-z0-9][a-z0-9 ._/-]*\.(jpe?g|png|webp|avif)$'
    and image_path !~ '\.\.'
    and length(image_path) <= 200
  )
);
