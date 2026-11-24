# Admin: criar catálogos e procedimentos

Em `/admin/catalogo` a administradora cria e edita **catálogos** (categorias) e os **procedimentos** (serviços) de cada um.

## O que dá para fazer
- **Novo catálogo:** nome, descrição curta, ordem, numeração, opções oferecidas, visível/oculto. O endereço (slug) é gerado do nome ou informado, e **não muda depois**.
- **Novo procedimento** dentro de um catálogo: nome, descrição, valor da aplicação, valor e prazo de manutenção (opcionais; prazo só com valor), texto de retorno, informações importantes (uma por linha) e ordem. Pode mudar o procedimento de catálogo.
- **Arquivar / reativar:** não existe exclusão. Arquivar esconde do site e mantém links, feedbacks e histórico.
- **Fotos:** em `/admin/imagens` (seção do catálogo). Itens novos aparecem lá.

## Como ativar
Rodar no SQL Editor, depois das migrations anteriores: `supabase/migrations/20261124000002_catalog_admin.sql`
(aditiva e idempotente; **não foi executada por mim**). Ela libera inserir/editar por **coluna** só para admin
(papel em `user_roles`), sem DELETE, e põe limites de tamanho.
Sem catálogo no Supabase (migrations/seed pendentes) a tela avisa e não edita.

## Regras e segurança
- Validação no servidor (`src/features/catalog-admin/validate.ts`) e de novo no banco (CHECK + RLS). Preço em reais vira centavos inteiros.
- Quem não é admin não grava: o RLS bloqueia mesmo se a ação fosse chamada direto.
- Criar procedimento nunca diminui "opções oferecidas" do catálogo; se o total ativo passar do declarado, ele é ajustado para cima.
- O site lê o catálogo com cache de até 5 minutos; salvar revalida o site, mas a leitura pode demorar um pouco em produção.

## Limite importante: idiomas
Textos novos aparecem **no idioma em que foram digitados** (português) nos 4 idiomas do site: a tradução por item
(`src/features/catalog/translations.ts`) só existe para os itens originais. Preços, datas e moeda seguem o idioma.
Tradução de itens novos exigiria campos por idioma; não foi feito.

## Testes
`tests/unit/catalog-admin.test.ts` (validação) e `tests/db/catalog_admin_rls.sql` (permissões, via `npm run test:db`).
