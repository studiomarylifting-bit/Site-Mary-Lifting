-- Studio Mary Lifting — schema inicial
-- Migration ADITIVA (somente create). Sem drop/truncate/alter destrutivo.
-- Princípios:
--  * RLS habilitada em TODAS as tabelas do schema public.
--  * Papéis ficam em user_roles; nenhum usuário consegue escrever nela
--    (somente service_role / SQL do operador).
--  * Inserts anônimos (SAC, feedback sem login) ocorrem apenas pelo backend
--    com service_role, após validação Zod e rate limit.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- enums
create type public.app_role as enum ('admin');
create type public.feedback_status as enum ('pending', 'approved', 'rejected');
create type public.ticket_status as enum ('open', 'in_progress', 'answered', 'closed');
create type public.ticket_type as enum (
  'duvida', 'agendamento', 'procedimento', 'pos_atendimento',
  'financeiro', 'privacidade', 'reclamacao', 'sugestao', 'outro'
);
create type public.consent_kind as enum (
  'health_data_processing',   -- obrigatório para enviar a ficha
  'whatsapp_followup',        -- lembretes/manutenção/pós-atendimento
  'whatsapp_marketing',       -- novidades, ofertas, aniversário
  'ranking_name',             -- nome no ranking anual
  'image_use',                -- fotos/vídeos de resultados
  'instagram_mention',        -- marcar o perfil informado
  'terms_privacy',            -- aceite de termos e política no cadastro
  'sac_contact'               -- contato sobre solicitação de SAC
);
create type public.privacy_request_type as enum (
  'access', 'correction', 'deletion', 'consent_revocation', 'export'
);
create type public.request_status as enum ('received', 'in_progress', 'done', 'rejected');
create type public.notification_status as enum ('pending', 'sent', 'failed', 'skipped');

-- ----------------------------------------------------------- utilidades
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ------------------------------------------------------------- catálogo
create table public.service_categories (
  slug text primary key check (slug ~ '^[a-z0-9-]+$'),
  position int not null,
  index_label text not null,
  title text not null,
  tagline text not null,
  declared_option_count int not null check (declared_option_count >= 0)
);

create table public.services (
  slug text primary key check (slug ~ '^[a-z0-9-]+$'),
  category_slug text not null references public.service_categories(slug) on delete restrict,
  position int not null,
  name text not null,
  description text not null,
  price_cents int not null check (price_cents >= 0),
  maintenance_cents int check (maintenance_cents >= 0),
  return_info text,
  notes text[] not null default '{}',
  active boolean not null default true
);
create index services_category_idx on public.services (category_slug, position);

-- --------------------------------------------------------------- papéis
create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create or replace function public.is_admin()
returns boolean language sql stable security definer
set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- --------------------------------------------------------------- perfil
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  phone text not null check (phone ~ '^55[0-9]{10,11}$'),
  birth_date date,
  instagram text check (instagram is null or instagram ~ '^[A-Za-z0-9._]{1,30}$'),
  no_instagram boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- Cria o perfil a partir do metadata do cadastro. O papel NUNCA vem do metadata.
-- O backend valida os dados antes do signUp; esta função só aplica o que passou
-- nas constraints da tabela (um metadata inválido faz o cadastro falhar).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  );
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------- ficha de anamnese
create table public.intake_forms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  status text not null default 'submitted' check (status in ('draft', 'submitted', 'reviewed')),
  -- Cadastrais
  full_name text not null,
  phone text not null check (phone ~ '^55[0-9]{10,11}$'),
  birth_date date not null,
  instagram text check (instagram is null or instagram ~ '^[A-Za-z0-9._]{1,30}$'),
  no_instagram boolean not null default false,
  -- Anamnese (texto livre, nunca para logs/WhatsApp)
  allergies text not null,
  medications text not null,
  health_conditions text not null,
  pregnancy_breastfeeding text not null,
  skin_sensitivity text not null,
  eye_sensitivity text not null,
  contact_lenses text not null,
  recent_procedures text not null,
  previous_reactions text not null,
  goals_preferences text not null,
  other_information text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (no_instagram = false or instagram is null)
);
create trigger intake_forms_updated before update on public.intake_forms
  for each row execute function public.set_updated_at();

-- Log de consentimentos: append-only (revogação = nova linha granted=false).
create table public.intake_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  intake_form_id uuid references public.intake_forms(id) on delete set null,
  kind public.consent_kind not null,
  granted boolean not null,
  text_version text not null,
  consent_text text not null,
  context text not null check (context in ('signup', 'intake_form', 'account_settings', 'sac_form')),
  created_at timestamptz not null default now()
);
create index intake_consents_user_idx on public.intake_consents (user_id, kind, created_at desc);

-- ------------------------------------------------------------- feedback
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 10 and 1500),
  procedure_slug text references public.services(slug) on delete set null,
  display_name text check (display_name is null or char_length(display_name) between 2 and 60),
  anonymize boolean not null default true,
  publish_consent boolean not null default false,
  status public.feedback_status not null default 'pending',
  moderated_by uuid references auth.users(id) on delete set null,
  moderated_at timestamptz,
  created_at timestamptz not null default now()
);
create index feedback_status_idx on public.feedback (status, created_at desc);
create index feedback_user_idx on public.feedback (user_id);

-- Exposição pública: somente aprovados E com consentimento; sem user_id.
create view public.public_feedback
with (security_invoker = false) as
  select
    f.id,
    f.rating,
    f.comment,
    f.procedure_slug,
    case when f.anonymize or f.display_name is null then 'Cliente' else f.display_name end as author,
    f.created_at
  from public.feedback f
  where f.status = 'approved' and f.publish_consent = true;

-- ------------------------------------------------------------------ SAC
create sequence public.sac_protocol_seq start 1;

create table public.sac_tickets (
  id uuid primary key default gen_random_uuid(),
  protocol text not null unique
    default ('SAC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.sac_protocol_seq')::text, 6, '0')),
  user_id uuid references auth.users(id) on delete set null,
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 254),
  phone text not null check (phone ~ '^55[0-9]{10,11}$'),
  subject text not null check (char_length(subject) between 3 and 140),
  type public.ticket_type not null,
  message text not null check (char_length(message) between 10 and 3000),
  contact_consent boolean not null check (contact_consent = true),
  status public.ticket_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index sac_tickets_status_idx on public.sac_tickets (status, created_at desc);
create index sac_tickets_user_idx on public.sac_tickets (user_id, created_at desc);
create trigger sac_tickets_updated before update on public.sac_tickets
  for each row execute function public.set_updated_at();

create table public.sac_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.sac_tickets(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  author_role text not null check (author_role in ('client', 'admin')),
  body text not null check (char_length(body) between 1 and 3000),
  internal boolean not null default false,
  created_at timestamptz not null default now()
);
create index sac_messages_ticket_idx on public.sac_messages (ticket_id, created_at);

-- ------------------------------------------------- privacidade (LGPD)
create table public.privacy_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  type public.privacy_request_type not null,
  details text check (details is null or char_length(details) <= 2000),
  status public.request_status not null default 'received',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger privacy_requests_updated before update on public.privacy_requests
  for each row execute function public.set_updated_at();

-- ------------------------------------------- fila de notificações (WhatsApp)
-- Guarda SOMENTE metadados minimizados. Nunca conteúdo de ficha/saúde.
create table public.notification_events (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('sac_new', 'intake_submitted', 'feedback_new', 'privacy_request_new')),
  ref_table text not null,
  ref_id uuid not null,
  idempotency_key text not null unique,
  status public.notification_status not null default 'pending',
  attempts int not null default 0,
  error_code text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index notification_events_status_idx on public.notification_events (status, created_at);

-- ------------------------------------------------------------ rate limit
create table public.rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  hits int not null default 0
);

-- Retorna true se a requisição é PERMITIDA. Janela fixa.
create or replace function public.rate_limit_hit(p_key text, p_window_seconds int, p_max int)
returns boolean language plpgsql security definer
set search_path = public as $$
declare
  v_hits int;
begin
  insert into public.rate_limits as r (key, window_start, hits)
  values (p_key, now(), 1)
  on conflict (key) do update
    set hits = case
          when r.window_start < now() - make_interval(secs => p_window_seconds) then 1
          else r.hits + 1 end,
        window_start = case
          when r.window_start < now() - make_interval(secs => p_window_seconds) then now()
          else r.window_start end
  returning hits into v_hits;
  return v_hits <= p_max;
end $$;

revoke all on function public.rate_limit_hit(text, int, int) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, int, int) to service_role;

-- ================================================================= RLS
alter table public.service_categories enable row level security;
alter table public.services           enable row level security;
alter table public.user_roles         enable row level security;
alter table public.profiles           enable row level security;
alter table public.intake_forms       enable row level security;
alter table public.intake_consents    enable row level security;
alter table public.feedback           enable row level security;
alter table public.sac_tickets        enable row level security;
alter table public.sac_messages       enable row level security;
alter table public.privacy_requests   enable row level security;
alter table public.notification_events enable row level security;
alter table public.rate_limits        enable row level security;

-- Catálogo: leitura pública; escrita só via service_role/migrations.
create policy categories_read on public.service_categories for select using (true);
create policy services_read   on public.services for select using (active = true or public.is_admin());

-- user_roles: cada usuário só enxerga o próprio papel; ninguém escreve.
create policy roles_read_own on public.user_roles for select using (user_id = auth.uid());

-- profiles
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or public.is_admin());
create policy profiles_update_own on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
-- sem policy de insert/delete: perfil nasce pelo trigger; exclusão via fluxo de privacidade.

-- intake_forms: dados de saúde. Dono lê/cria/edita; admin lê.
create policy intake_select on public.intake_forms for select
  using (user_id = auth.uid() or public.is_admin());
create policy intake_insert_own on public.intake_forms for insert
  with check (user_id = auth.uid());
create policy intake_update_own on public.intake_forms for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy intake_delete_own on public.intake_forms for delete
  using (user_id = auth.uid());
create policy intake_admin_review on public.intake_forms for update
  using (public.is_admin()) with check (public.is_admin());

-- intake_consents: append-only. Sem update/delete para ninguém.
create policy consents_select on public.intake_consents for select
  using (user_id = auth.uid() or public.is_admin());
create policy consents_insert_own on public.intake_consents for insert
  with check (user_id = auth.uid());

-- feedback: dono lê os seus; admin lê/modera tudo. Insert só pelo backend.
create policy feedback_select on public.feedback for select
  using (user_id = auth.uid() or public.is_admin());
create policy feedback_admin_update on public.feedback for update
  using (public.is_admin()) with check (public.is_admin());

-- public_feedback é uma view definer: precisa de grant explícito.
revoke all on public.public_feedback from public, anon, authenticated;
grant select on public.public_feedback to anon, authenticated;

-- sac_tickets: dono lê os seus; admin lê/atualiza. Insert só pelo backend.
create policy tickets_select on public.sac_tickets for select
  using (user_id = auth.uid() or public.is_admin());
create policy tickets_admin_update on public.sac_tickets for update
  using (public.is_admin()) with check (public.is_admin());

-- sac_messages: dono vê mensagens não internas dos seus tickets; admin tudo.
create policy messages_select on public.sac_messages for select
  using (
    public.is_admin()
    or (
      internal = false
      and exists (
        select 1 from public.sac_tickets t
        where t.id = ticket_id and t.user_id = auth.uid()
      )
    )
  );
create policy messages_insert_client on public.sac_messages for insert
  with check (
    author_id = auth.uid() and author_role = 'client' and internal = false
    and exists (
      select 1 from public.sac_tickets t
      where t.id = ticket_id and t.user_id = auth.uid()
    )
  );
create policy messages_insert_admin on public.sac_messages for insert
  with check (public.is_admin() and author_role = 'admin' and author_id = auth.uid());

-- privacy_requests: dono lê as suas; admin gerencia. Insert pelo backend.
create policy privacy_select on public.privacy_requests for select
  using (user_id = auth.uid() or public.is_admin());
create policy privacy_admin_update on public.privacy_requests for update
  using (public.is_admin()) with check (public.is_admin());

-- notification_events: somente admin lê. Escrita só service_role.
create policy notifications_admin_select on public.notification_events for select
  using (public.is_admin());

-- rate_limits: nenhuma policy => inacessível a anon/authenticated.
-- (service_role ignora RLS e chama rate_limit_hit.)

-- Grants mínimos para as roles do PostgREST (RLS faz o resto).
revoke all on all tables in schema public from anon, authenticated;
grant select on public.service_categories, public.services to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.intake_forms to authenticated;
grant select, insert on public.intake_consents to authenticated;
grant select, update on public.feedback to authenticated;
grant select, update on public.sac_tickets to authenticated;
grant select, insert on public.sac_messages to authenticated;
grant select, update on public.privacy_requests to authenticated;
grant select on public.notification_events to authenticated;
grant select on public.user_roles to authenticated;
grant select on public.public_feedback to anon, authenticated;
