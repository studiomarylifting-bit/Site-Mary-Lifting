# Tipografia

**Títulos:** Cormorant Garamond (serifada de alto contraste, estilo editorial). **Texto e interface:** Jost (sans geométrica, no espírito da Futura).
É o par clássico de marcas de beleza, estética e moda: serifa elegante nos títulos + sans limpa no corpo, com sensação de luxo e leitura fácil.
Ambas cobrem os acentos de português, espanhol e italiano (subconjunto latino) e carregam pelo `next/font` (sem requisição de terceiros em produção).

## Decisão
Mantida. O problema real não era a família e sim **tamanho**: havia 17 rótulos entre 9,3 px e 11,2 px (muito pequenos, ainda mais com caixa-alta e espaçamento largo).
Todos passaram a **12 px no mínimo** (`text-xs`) e o espaçamento entre letras foi reduzido para não estourar a largura.

## Regras
- Cormorant só em títulos (≥ 24 px) e em peso 500; abaixo disso use Jost. Traço fino de Cormorant perde legibilidade em tamanhos pequenos e no tema escuro.
- Jost 400 no corpo, 500 em rótulos. Nada abaixo de 12 px.
- Caixa-alta só em rótulos curtos, com `tracking` ≤ 0,24 em.
