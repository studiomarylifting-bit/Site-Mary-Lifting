# Idiomas (i18n) e temas (claro/escuro)

## Idiomas
Português (padrão, `pt`), inglês (`en`), espanhol (`es`) e italiano (`it`).

- **Escolha do idioma:** cookie `ml-locale` → senão `Accept-Language` do navegador → senão `pt`.
  O seletor fica no cabeçalho (desktop) e dentro do menu (celular). Ele chama a server action
  `setLocaleAction` (`src/i18n/actions.ts`), que grava o cookie e revalida o layout.
- **Dicionários:** `src/i18n/messages/*.ts`. O português é a fonte (`ns(pt, {en, es, it})`);
  os tipos (`SameShape`) e o teste `tests/unit/i18n.test.ts` garantem que os 4 idiomas tenham
  exatamente as mesmas chaves.
- **Usar em servidor:** `const t = await getT()`. **Em cliente:** `const t = useT()`.
  Variáveis: `t("chave", { nome })` com `{nome}` no texto.
- **Adicionar uma chave:** inclua no namespace em português e nos outros três idiomas; o TypeScript
  e o teste acusam se faltar algum.
- **Adicionar um idioma:** acrescente em `LOCALES`/`localeMeta` (`src/i18n/config.ts`), crie a
  tradução em cada `ns(...)`, em `translations.ts` do catálogo e em `server-messages.ts`.
- **Catálogo (serviços do Supabase):** `src/features/catalog/translations.ts` é uma camada por
  `slug`, aplicada só quando o texto ainda é o original em português (edições feitas no banco
  prevalecem). Moeda e datas usam `Intl` com o idioma ativo.
- **Mensagens de erro do servidor:** são geradas em português e traduzidas na fronteira
  (`translateMessage`).
- **Páginas legais** (`/privacidade`, `/termos`): o corpo permanece em português (texto jurídico
  não deve ser traduzido sem revisão); as telas mostram um aviso no idioma ativo.
- **Consentimentos:** o texto exibido é traduzido, mas o banco registra o texto em português e
  `CONSENT_TEXT_VERSION`.
- **Aviso:** as traduções foram feitas por IA. Peça revisão a falantes fluentes e revisão jurídica
  dos textos de consentimento antes de publicar.
- **Efeito colateral:** como o layout lê o cookie, todas as páginas são dinâmicas (sem geração
  estática); no catálogo, `generateStaticParams` usa `getStaticParamsCatalog`.

## Temas
Automático (segue o sistema) → claro → escuro, pelo botão no cabeçalho. A escolha fica em
`localStorage` (`ml-theme`) e é aplicada por um script inline antes da pintura (sem flash),
via `data-theme` em `<html>`; sem escolha vale `prefers-color-scheme`.

- Os tokens de cor (`src/app/globals.css`) são invertidos no bloco escuro; use sempre os tokens
  (`bg-cream`, `text-espresso`...) e nunca cores fixas.
- Superfícies que devem continuar escuras nos dois temas usam a classe `.on-dark` (paleta fixa).
- `color-scheme` e o `theme-color` do navegador acompanham o tema.

## Responsividade
O menu móvel vai até `xl`. O desfoque do cabeçalho fica numa camada irmã porque `backdrop-filter`
no `<header>` faria o menu `position: fixed` ficar preso à altura do cabeçalho.
Títulos quebram palavras longas (`overflow-wrap`, `hyphens`).

## Testes
- `npm run test` — inclui `tests/unit/i18n.test.ts`.
- `npm run test:e2e` — `tests/e2e/i18n-theme.spec.ts` (idioma, tema, menu móvel, sem rolagem horizontal).
  O Playwright roda com `locale: "pt-BR"`; os demais specs esperam português.
