# Testes e estado de validação

## O que existe
- `tests/unit` (Vitest): catálogo (todos os preços informados), formatação e telefone, anti-spam, `safeNextPath`, mensagens minimizadas, cliente Uazapi (headers, retry, 4xx), validação de ambiente, helpers de rate limit e schemas Zod (cadastro, SAC, feedback, ficha, consentimentos).
- `tests/e2e` (Playwright, desktop e Pixel 7): FAQ da home (teclado, aria, JSON-LD), ausência de rolagem horizontal, menu mobile, páginas públicas, catálogo, rotas protegidas, login/cadastro, formulários, CSRF por `Origin`, honeypot e cabeçalhos de segurança.

## O que foi de fato executado (ambiente sem acesso ao npm)
| Verificação | Resultado |
| --- | --- |
| Testes unitários de módulos puros (catálogo, formato, anti-spam, safe-next, mensagens) | **Executados e aprovados** (109/109, inclui FAQ, catálogo/Storage e vínculo de imagens) com um mini-runner compatível com a API do Vitest, não com o Vitest real |
| `scripts/generate-seed.ts` | Executado; `seed.sql` já estava atualizado (4 categorias, 23 serviços) |
| Sintaxe TS/JSX (`tsc`) | Sem erros de sintaxe; **sem typecheck completo** |
| RLS: todas as 12 tabelas com RLS ativado; migration sem operações destrutivas | Verificado por leitura do SQL; **não aplicado em um Postgres real** |
| Variáveis usadas no código × `.env.example` | Conferido (5 variáveis `NEXT_PUBLIC_LEGAL_*` estavam faltando e foram adicionadas) |
| Varredura de secrets e de uso de service role em client components | Nada encontrado |

## Banco de dados (PostgreSQL real, descartável)
`npm run test:db` (`scripts/test-db.sh`) aplica as migrations e o seed num PostgreSQL local vazio, reaplica a migration e o seed (idempotência) e roda 41 verificações de RLS e Storage: anon/cliente/admin não alteram preço, nome nem excluem; só admin altera `image_path` e envia ao bucket; `image_path` inválido é recusado; o re-seed preserva `image_path`; o bucket é público, 5 MB, só imagens. O script **recusa** URLs do Supabase.

**Resultado executado: 41/41 aprovados** no PostgreSQL 16, mais `supabase/verify_catalog.sql` conferido (4 categorias, 23 serviços, preços corretos, sem duplicados, `image_path` nulo em todos).

**Limite:** o Supabase é simulado por *stubs* (`tests/db/supabase_stub.sql`: schemas `auth`/`storage`, roles `anon`/`authenticated`, `auth.uid()`). Isso valida a lógica do SQL e das políticas, mas **não substitui** rodar as migrations no seu projeto Supabase de verdade e conferir o resultado com `verify_catalog.sql`.

## O que NÃO foi executado
`npm install`, `typecheck` completo, `lint`, **Vitest real**, **Playwright**, `next build`, `npm audit`, testes de RLS contra um banco, e qualquer chamada real a Supabase, Uazapi ou Google. Os testes de `schemas`, `env`, `rate-limit` e `uazapi-client` dependem de pacotes (Zod, Supabase) e **ainda não foram rodados**. Nada disso deve ser considerado aprovado até rodar `npm install && npm run typecheck && npm run lint && npm test && npm run build && npm run test:e2e`.

Testes de RLS exigem um projeto Supabase de teste e são um próximo passo recomendado.
