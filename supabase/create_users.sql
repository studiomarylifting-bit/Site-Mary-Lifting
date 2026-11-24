-- =====================================================================
-- Cria 1 CLIENTE e 1 ADMIN (Marina Silva) já com e-mail confirmado.
-- Rodar no Supabase: SQL Editor (executa como postgres). NÃO vai para o frontend.
--
-- ANTES DE RODAR: troque os 4 valores marcados com TROQUE_ em "params".
-- Nunca commite este arquivo com senhas reais.
--
--  * Idempotente: se o e-mail já existe, não recria e não altera a senha.
--  * O perfil (public.profiles) é criado pelo gatilho on_auth_user_created.
--  * O papel admin é gravado em public.user_roles (única fonte de verdade).
--  * Senha: mínimo 8 caracteres, com letra e número (mesma regra do cadastro).
-- =====================================================================
do $$
declare
  -- ---------------------------- params ----------------------------
  admin_email    text := 'TROQUE_admin@seudominio.com';
  admin_password text := 'TROQUE_SenhaDoAdmin1';
  admin_name     text := 'Marina Silva';
  admin_phone    text := '5511900000000';   -- formato 55 + DDD + número

  client_email    text := 'TROQUE_cliente@seudominio.com';
  client_password text := 'TROQUE_SenhaDoCliente1';
  client_name     text := 'Cliente Teste';
  client_phone    text := '5511900000001';
  -- -----------------------------------------------------------------
  uid uuid;
begin
  if admin_email like 'TROQUE\_%' or client_email like 'TROQUE\_%'
     or admin_password like 'TROQUE\_%' or client_password like 'TROQUE\_%' then
    raise exception 'Troque os valores TROQUE_ (e-mails e senhas) antes de executar.';
  end if;

  -- ------------------------------ admin ------------------------------
  select id into uid from auth.users where lower(email) = lower(admin_email);
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
      lower(admin_email), extensions.crypt(admin_password, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('full_name', admin_name, 'phone', admin_phone),
      now(), now(), '', '', '', ''
    );
    insert into auth.identities (
      id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), uid, uid::text, 'email',
      jsonb_build_object('sub', uid::text, 'email', lower(admin_email),
                         'email_verified', true, 'phone_verified', false),
      now(), now(), now()
    );
  end if;
  insert into public.user_roles (user_id, role) values (uid, 'admin') on conflict do nothing;

  -- ----------------------------- cliente -----------------------------
  select id into uid from auth.users where lower(email) = lower(client_email);
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
      lower(client_email), extensions.crypt(client_password, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('full_name', client_name, 'phone', client_phone),
      now(), now(), '', '', '', ''
    );
    insert into auth.identities (
      id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), uid, uid::text, 'email',
      jsonb_build_object('sub', uid::text, 'email', lower(client_email),
                         'email_verified', true, 'phone_verified', false),
      now(), now(), now()
    );
  end if;
end $$;

-- Conferência (somente leitura): deve listar a Marina como admin e o cliente sem papel.
select u.email, p.full_name, coalesce(r.role::text, 'cliente') as papel, u.email_confirmed_at is not null as confirmado
from auth.users u
left join public.profiles p on p.id = u.id
left join public.user_roles r on r.user_id = u.id
where p.full_name in ('Marina Silva') or u.email in ('TROQUE_cliente@seudominio.com')
   or r.role is not null or p.full_name = 'Cliente Teste'
order by papel;
