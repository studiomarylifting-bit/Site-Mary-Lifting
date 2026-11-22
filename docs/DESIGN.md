# Design system

Direção: boutique de beleza editorial. Fundo creme, tipografia serifada de destaque (Cormorant Garamond), texto em Jost, sombras suaves e cantos arredondados com função.

## Tokens (`src/app/globals.css`, bloco `@theme`)

| Grupo | Tokens |
| --- | --- |
| Cores | `cream` (fundo), `ivory` (superfície), `blush`, `nude`, `sand`, `rose`, `rose-deep` (texto de destaque, 5,3:1 sobre o creme), `taupe`, `cocoa`, `espresso`, `ink`, `stroke` (contorno de campos, 3:1) |
| Raios | `rounded-field` 14 px · `rounded-card` 20 px · `rounded-media` 28 px · `rounded-panel` 40 px · `rounded-full` só em botões, chips e ícones |
| Sombras | `shadow-soft` (repouso) · `shadow-lift` (hover/destaque) |

## Regras
- **Raio por função, não uniforme:** campo < card < imagem/painel; botões são pill.
- **Sem borda para separar cards:** superfície `ivory` + `shadow-soft` sobre o creme. Bordas só em campos de formulário (contraste de 3:1) e divisórias finas de tabela.
- **Fundos escuros** recebem a classe `on-dark` (foco com contorno claro).
- **Movimento:** transições de 200–300 ms, sempre com `motion-reduce:transition-none`.
- **Toque:** alvos de pelo menos 44 px (`min-h-11`/`min-h-12`).
- **Ícones:** Lucide; nenhum emoji na interface.
- **Imagens:** `MediaSlot` mostra um espaço reservado até existir foto real. Para trocar, edite `src/features/catalog/media.ts` e coloque o arquivo em `public/images/`.

## Componentes base
`components/ui` (Button/LinkButton, Field, Alert), `components/layout` (SiteHeader, SiteFooter, AuthShell), `components/shared` (PageHero, MediaSlot, ServiceCard, Stars) e `features/faq/Faq` (acordeão WAI-ARIA).
