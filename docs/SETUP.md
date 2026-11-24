# Setup

## 1. Requisitos
Node 20.11+ (testado com 22), npm, um projeto Supabase.

## 2. Supabase
1. Crie um projeto em supabase.com.
2. Aplique as migrations **em ordem** (SQL Editor, ou `supabase db push` com a CLI): `20261121000001_init_schema.sql` e `20261122000001_catalog_storage.sql`. São **aditivas**: sem `drop table`/`truncate`/`delete`, e idempotentes.
3. Aplique `supabase/seed.sql` (4 categorias e 23 serviços, idempotente) e confira com `supabase/verify_catalog.sql` (somente leitura). Para regenerar o seed: `npm run seed:generate`. Imagens e `image_path`: [CATALOGO-IMAGENS.md](CATALOGO-IMAGENS.md).
4. Em **Authentication → URL Configuration**, defina o Site URL e adicione `{SITE_URL}/auth/callback` em Redirect URLs.
5. Em **Authentication → Providers → Email**, decida sobre confirmação de e-mail. O fluxo funciona com e sem ela.
6. Copie a URL e a chave anon (Project Settings → API) para `.env.local`. A `service_role` fica **somente** no servidor e nunca recebe prefixo `NEXT_PUBLIC_`.

## 3. Primeiro administrador
Ninguém vira admin pelo site. Crie a conta normalmente em `/cadastro` e, no SQL Editor do Supabase (que roda com privilégios de administrador do banco), execute:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'EMAIL_DA_ADMIN@exemplo.com';
```

A tabela `user_roles` não tem grant de escrita para `anon`/`authenticated`: nem pela API do Supabase uma cliente consegue se promover.

## 4. Variáveis de ambiente
Todas documentadas em `.env.example`. Resumo:

| Variável | Onde | Obrigatória para |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | público | links nas notificações e metadados |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | público | login, conta, admin |
| `SUPABASE_SERVICE_ROLE_KEY` | **servidor** | rate limit, SAC/feedback anônimos, fila de notificações |
| `RATE_LIMIT_SALT` | servidor | pseudonimizar IPs (string aleatória longa) |
| `UAZAPI_BASE_URL`, `UAZAPI_TOKEN`, `UAZAPI_STUDIO_PHONE` | servidor | avisos ao WhatsApp do Studio |
| `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID` | servidor | avaliações do Google |
| `NEXT_PUBLIC_LEGAL_*` | público | identificação do controlador em `/privacidade` |

Sem a service role, os formulários de SAC e feedback respondem 429 de propósito (falham fechados) em vez de abrir mão do rate limit.

## 5. Deploy
Não há deploy automatizado neste repositório. Use HTTPS (o HSTS já é enviado) e cadastre as variáveis no provedor, nunca em arquivo versionado.

## Criar o primeiro admin (Marina Silva) e um cliente de teste
1. Abra `supabase/create_users.sql`, troque os valores `TROQUE_` (e-mails e senhas) e rode no **SQL Editor** do Supabase.
2. O script confirma o e-mail, cria o perfil (gatilho) e grava o papel `admin` em `user_roles`. É idempotente.
3. Entre em `/entrar`: a Marina cai em `/admin`; o cliente cai em `/conta`.
4. Não commite o arquivo com senhas reais. Troque as senhas após o primeiro acesso (`/recuperar-senha`).
