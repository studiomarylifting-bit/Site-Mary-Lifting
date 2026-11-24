# Studio Mary Lifting — Lash e Estética

Aplicação web do Studio Mary Lifting (Rua Tiradentes, 144 — Centro, Embu-Guaçu — SP): catálogo de procedimentos, conta da cliente com ficha de atendimento, SAC, feedback com moderação, avaliações reais do Google e painel administrativo.

**Stack:** Next.js 15 (App Router) · TypeScript strict · Tailwind CSS 4 · Supabase (Postgres, Auth, RLS) · Zod · React Hook Form · Vitest · Playwright · Lucide.

**Arquitetura:** monólito modular por funcionalidade. `src/app` só roteia; regras e integrações ficam em `src/features`, `src/server` e `src/lib`.

## Rodar localmente

```bash
npm install
cp .env.example .env.local      # preencha o que for usar; tudo é opcional para ver o catálogo
npm run dev                     # http://localhost:3000
```

Sem nenhuma variável, o catálogo e as páginas públicas funcionam. Cada integração degrada de forma segura: Google mostra "aguardando configuração", Uazapi registra a notificação como `skipped`, e as rotas `/conta` e `/admin` redirecionam para o login.

**Quer testar?** Siga o passo a passo em [docs/TESTE-LOCAL.md](docs/TESTE-LOCAL.md).
Guia de configuração (Supabase, primeiro admin, e-mails): [docs/SETUP.md](docs/SETUP.md).

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest (unitários, `tests/unit`) |
| `npm run test:e2e` | Playwright (`tests/e2e`, desktop e mobile) |
| `npm run seed:generate` | Regenera `supabase/seed.sql` a partir de `src/features/catalog/data.ts` |
| `npm run verify` | typecheck + lint + testes + build, em sequência |
| `npm run check:env` | Mostra quais integrações estão configuradas (sem revelar valores) |
| `npm run faq:review` | Regenera `docs/FAQ-REVISAO.md` (o que a proprietária precisa confirmar) |
| `npm run test:db` | Migrations, seed e RLS/Storage num PostgreSQL local descartável (requer `psql`) |
| `npm run link:images -- arquivos.txt` | Gera o SQL que vincula imagens do Storage aos serviços (correspondência exata) |
| `npm run check:images` | Diagnostica por que as fotos do Supabase não aparecem no site |
| `npm run audit:deps` | `npm audit --omit=dev` |

## Estrutura

```
src/
  app/          rotas (públicas, /conta, /admin, /api)
  features/     auth, catalog, feedback, intake, privacy, profile, reviews, sac
  components/   ui, layout, shared
  server/       http, policies (authz), services, integrations (uazapi, google)
  lib/          env, supabase, security (rate limit, anti-spam), validation
supabase/       migrations/ e seed.sql
tests/          unit/ e e2e/
docs/           SETUP, SECURITY, PRIVACY, INTEGRATIONS, TESTING
```

## Rotas

Públicas: `/`, `/catalogo`, `/catalogo/[categoria]`, `/catalogo/[categoria]/[slug]`, `/studio`, `/pagamentos`, `/avaliacoes`, `/feedback`, `/feedback/enviar`, `/sac`, `/quem-sou`, `/privacidade`, `/termos`, `/entrar`, `/cadastro`, `/recuperar-senha`, `/redefinir-senha`.
Cliente (login): `/conta`, `/conta/ficha`, `/conta/perfil`, `/conta/autorizacoes`, `/conta/feedbacks`, `/conta/sac`.
Admin (role `admin`): `/admin`, `/admin/clientes`, `/admin/clientes/[id]`, `/admin/feedback`, `/admin/sac`, `/admin/sac/[id]`.
API: `/api/sac`, `/api/feedback`, `/api/intake`, `/api/profile`, `/api/consents`, `/api/privacy`, `/api/account/export`, `/api/admin/*`.

## Catálogo

Fonte única: `src/features/catalog/data.ts` (valores em centavos). A lista informada tem 15 entradas de cílios (14 técnicas + "Remoção de extensão"). Para incluir outro serviço, adicione um item e rode `npm run seed:generate`.

## Documentação

- [Teste local](docs/TESTE-LOCAL.md) · [Design](docs/DESIGN.md) · [Idiomas e temas](docs/I18N-TEMAS.md) · [Admin e imagens](docs/ADMIN-IMAGENS.md) · [Catálogo e imagens](docs/CATALOGO-IMAGENS.md) · [Revisão do FAQ](docs/FAQ-REVISAO.md) · [Setup](docs/SETUP.md) · [Segurança](docs/SECURITY.md) · [Privacidade e LGPD](docs/PRIVACY.md) · [Integrações](docs/INTEGRATIONS.md) · [Testes e estado de validação](docs/TESTING.md)
