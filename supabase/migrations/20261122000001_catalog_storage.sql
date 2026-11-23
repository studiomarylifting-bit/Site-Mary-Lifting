-- =====================================================================
-- Catálogo + Storage de imagens (Fase: catálogo no Supabase)
--
-- ADITIVA e IDEMPOTENTE: só adiciona colunas/constraints/policies e cria o
-- bucket. Nenhuma tabela, coluna ou dado é removido. Pode rodar mais de uma vez.
-- Reaproveita service_categories e services da migration inicial (não cria
-- uma segunda estrutura de catálogo).
--
-- Mapeamento dos nomes sugeridos -> nomes existentes (mantidos de propósito,
-- pois feedback.procedure_slug e o app já dependem deles):
--   sort_order        -> position
--   is_active         -> active
--   category_id       -> category_slug  (FK por slug; `id` uuid foi adicionado)
--   description (cat) -> tagline
--   application_price -> price_cents (inteiro, exato) + application_price numeric(10,2) gerado
--   maintenance_price -> maintenance_cents + maintenance_price numeric(10,2) gerado
-- =====================================================================

-- ------------------------------------------------------- service_categories
alter table public.service_categories
  add column if not exists id         uuid        not null default gen_random_uuid(),
  add column if not exists image_path text,
  add column if not exists active     boolean     not null default true,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists service_categories_id_key on public.service_categories (id);

-- -------------------------------------------------------------------- services
alter table public.services
  add column if not exists id               uuid        not null default gen_random_uuid(),
  add column if not exists image_path       text,
  add column if not exists maintenance_days int,
  add column if not exists related_slugs    text[]      not null default '{}',
  add column if not exists created_at       timestamptz not null default now(),
  add column if not exists updated_at       timestamptz not null default now();

-- Preços legíveis em reais (numeric, sem float). A FONTE da verdade continua
-- sendo price_cents/maintenance_cents (inteiros em centavos); estas são
-- colunas GERADAS: aparecem no Table Editor, mas não são editáveis.
alter table public.services
  add column if not exists application_price numeric(10, 2) generated always as (price_cents / 100.0) stored,
  add column if not exists maintenance_price numeric(10, 2) generated always as (maintenance_cents / 100.0) stored;

create unique index if not exists services_id_key on public.services (id);

-- ----------------------------------------------------------------- constraints
-- image_path é um caminho DENTRO do bucket `site-media`, nunca uma URL.
alter table public.services drop constraint if exists services_image_path_chk;
alter table public.services add constraint services_image_path_chk check (
  image_path is null or (
    image_path ~* '^servicos/[a-z0-9][a-z0-9._/-]*\.(jpe?g|png|webp|avif)$'
    and image_path !~ '\.\.'
  )
);

alter table public.service_categories drop constraint if exists service_categories_image_path_chk;
alter table public.service_categories add constraint service_categories_image_path_chk check (
  image_path is null or (
    image_path ~* '^categorias/[a-z0-9][a-z0-9._/-]*\.(jpe?g|png|webp|avif)$'
    and image_path !~ '\.\.'
  )
);

-- Só existe prazo de manutenção para quem tem valor de manutenção.
alter table public.services drop constraint if exists services_maintenance_chk;
alter table public.services add constraint services_maintenance_chk check (
  (maintenance_days is null or (maintenance_days > 0 and maintenance_cents is not null))
);

-- ------------------------------------------------------------------ updated_at
-- public.set_updated_at() já existe (migration inicial).
drop trigger if exists service_categories_set_updated_at on public.service_categories;
create trigger service_categories_set_updated_at before update on public.service_categories
  for each row execute function public.set_updated_at();

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at before update on public.services
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------------ RLS
-- Leitura pública só do que está ativo (admin enxerga tudo).
drop policy if exists categories_read on public.service_categories;
create policy categories_read on public.service_categories for select
  using (active = true or public.is_admin());
-- services_read (active = true or is_admin) já existe e permanece.

-- Escrita: ninguém altera preços/serviços pela API. A ÚNICA coluna que um admin
-- autenticado pode alterar pelo site é image_path (preparo p/ upload no painel):
-- o grant é por COLUNA, então tentar mudar preço dá "permission denied".
grant update (image_path) on public.services           to authenticated;
grant update (image_path) on public.service_categories to authenticated;

drop policy if exists services_admin_image on public.services;
create policy services_admin_image on public.services for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists categories_admin_image on public.service_categories;
create policy categories_admin_image on public.service_categories for update
  using (public.is_admin()) with check (public.is_admin());

-- --------------------------------------------------------------------- Storage
-- Bucket PÚBLICO somente para imagens de exibição. Pastas por convenção:
--   servicos/  categorias/  studio/  home/
-- Limite de 5 MB e só formatos de imagem. Os outros buckets não são alterados.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media', 'site-media', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Leitura pública das imagens funciona pela URL pública do bucket (sem policy).
-- NÃO há policy de SELECT para anon: ninguém consegue LISTAR o bucket pela API.
-- Envio, troca e exclusão: somente admin (papel lido de public.user_roles).
drop policy if exists site_media_admin_select on storage.objects;
create policy site_media_admin_select on storage.objects for select to authenticated
  using (bucket_id = 'site-media' and public.is_admin());

drop policy if exists site_media_admin_insert on storage.objects;
create policy site_media_admin_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'site-media'
    and public.is_admin()
    and (storage.foldername(name))[1] in ('servicos', 'categorias', 'studio', 'home')
  );

drop policy if exists site_media_admin_update on storage.objects;
create policy site_media_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'site-media' and public.is_admin())
  with check (
    bucket_id = 'site-media'
    and public.is_admin()
    and (storage.foldername(name))[1] in ('servicos', 'categorias', 'studio', 'home')
  );

drop policy if exists site_media_admin_delete on storage.objects;
create policy site_media_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'site-media' and public.is_admin());
