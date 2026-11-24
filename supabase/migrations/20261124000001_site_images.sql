-- =====================================================================
-- Imagens editáveis do site (favicon, logo do navbar, fotos da home...)
--
-- ADITIVA e IDEMPOTENTE: cria public.site_images e libera a pasta `brand/` no
-- bucket site-media. Nada existente é removido. Pode rodar mais de uma vez.
--
-- Cada linha liga um "slot" (ex.: logoLight, heroPhoto) a um caminho DENTRO do
-- bucket `site-media` (nunca uma URL). Sem linha = o site usa a imagem padrão
-- que vem no código. Leitura pública; escrita só admin (user_roles).
-- =====================================================================
create table if not exists public.site_images (
  slot       text primary key check (slot ~ '^[A-Za-z][A-Za-z0-9]{1,39}$'),
  image_path text not null check (
    image_path ~* '^(brand|home|studio)/[a-z0-9][a-z0-9._-]*\.(jpe?g|png|webp|avif)$'
    and image_path !~ '\.\.'
  ),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

drop trigger if exists site_images_set_updated_at on public.site_images;
create trigger site_images_set_updated_at before update on public.site_images
  for each row execute function public.set_updated_at();

alter table public.site_images enable row level security;

drop policy if exists site_images_read on public.site_images;
create policy site_images_read on public.site_images for select using (true);

drop policy if exists site_images_admin_insert on public.site_images;
create policy site_images_admin_insert on public.site_images for insert to authenticated
  with check (public.is_admin());
drop policy if exists site_images_admin_update on public.site_images;
create policy site_images_admin_update on public.site_images for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists site_images_admin_delete on public.site_images;
create policy site_images_admin_delete on public.site_images for delete to authenticated
  using (public.is_admin());

grant select on public.site_images to anon, authenticated;
grant insert, update, delete on public.site_images to authenticated;

-- Storage: acrescenta a pasta `brand/` às já permitidas (servicos, categorias, studio, home).
drop policy if exists site_media_admin_insert on storage.objects;
create policy site_media_admin_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'site-media'
    and public.is_admin()
    and (storage.foldername(name))[1] in ('servicos', 'categorias', 'studio', 'home', 'brand')
  );

drop policy if exists site_media_admin_update on storage.objects;
create policy site_media_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'site-media' and public.is_admin())
  with check (
    bucket_id = 'site-media'
    and public.is_admin()
    and (storage.foldername(name))[1] in ('servicos', 'categorias', 'studio', 'home', 'brand')
  );
-- select/delete de admin no bucket já existem (migration do catálogo).
