-- =====================================================================
-- Admin cria/edita catálogos (categorias) e procedimentos (serviços)
--
-- ADITIVA e IDEMPOTENTE. Não apaga nada: o admin NÃO tem DELETE; "remover" é
-- arquivar (active = false), o que preserva links, feedbacks e histórico.
-- Visitantes continuam vendo só o que está ativo (policies de leitura existentes).
--
-- Antes só `image_path` era editável pela API. Agora o admin (public.is_admin(),
-- papel lido de user_roles) pode inserir e editar as colunas de conteúdo. Os grants
-- são POR COLUNA: colunas geradas e `id` ficam de fora; `slug` não é editável depois
-- de criado (é a chave e a URL).
-- =====================================================================

-- Limites de tamanho (NOT VALID: vale para novas gravações sem falhar por linhas antigas).
alter table public.service_categories drop constraint if exists service_categories_text_chk;
alter table public.service_categories add constraint service_categories_text_chk check (
  char_length(title) between 2 and 80 and char_length(tagline) <= 300 and char_length(index_label) between 1 and 4
) not valid;

alter table public.services drop constraint if exists services_text_chk;
alter table public.services add constraint services_text_chk check (
  char_length(name) between 2 and 120
  and char_length(description) <= 2000
  and (return_info is null or char_length(return_info) <= 500)
  and price_cents <= 100000000
  and (maintenance_cents is null or maintenance_cents <= 100000000)
) not valid;

-- ------------------------------------------------------------------ grants
grant insert (slug, position, index_label, title, tagline, declared_option_count, active, image_path)
  on public.service_categories to authenticated;
grant update (position, index_label, title, tagline, declared_option_count, active, image_path)
  on public.service_categories to authenticated;

grant insert (slug, category_slug, position, name, description, price_cents, maintenance_cents,
              maintenance_days, return_info, notes, related_slugs, active, image_path)
  on public.services to authenticated;
grant update (category_slug, position, name, description, price_cents, maintenance_cents,
              maintenance_days, return_info, notes, related_slugs, active, image_path)
  on public.services to authenticated;

-- ---------------------------------------------------------------- policies
drop policy if exists categories_admin_insert on public.service_categories;
create policy categories_admin_insert on public.service_categories for insert to authenticated
  with check (public.is_admin());

drop policy if exists services_admin_insert on public.services;
create policy services_admin_insert on public.services for insert to authenticated
  with check (public.is_admin());

-- UPDATE de admin: as policies categories_admin_image / services_admin_image (migration do
-- catálogo) já liberam UPDATE só para admin; agora cobrem as colunas acima pelo grant.
-- Sem policy nem grant de DELETE: arquivar = active=false.
