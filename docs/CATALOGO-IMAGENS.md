# Catálogo no Supabase e imagens

O catálogo (categorias e serviços) vive em duas tabelas do Supabase, `service_categories` e `services`, e o site lê delas. As imagens ficam no bucket **público** `site-media` do Supabase Storage; o banco guarda só o **caminho** da imagem (`image_path`), nunca uma URL.

Se o Supabase não estiver configurado ou estiver fora do ar, o site usa o catálogo estático de `src/features/catalog/data.ts` e continua funcionando.

## 1. Aplicar no Supabase (uma vez)

No painel do Supabase, **SQL Editor → New query**, rode **nesta ordem** (cole o conteúdo do arquivo e clique em Run):

1. `supabase/migrations/20261121000001_init_schema.sql` (só se ainda não rodou; cria as tabelas)
2. `supabase/migrations/20261122000001_catalog_storage.sql` (colunas de imagem, preços em reais, bucket e políticas)
3. `supabase/seed.sql` (4 categorias e 23 serviços)
4. `supabase/verify_catalog.sql` (somente leitura: confira o resultado)

Todos são **aditivos e idempotentes**: nada é apagado e rodar de novo não duplica.

> **Cuidado ao rodar o seed de novo:** ele restaura nome, descrição e **preços** para os valores de `data.ts`. Seu `image_path` é preservado. Se você alterar um preço direto no banco, altere também em `data.ts` (e rode `npm run seed:generate`), senão o próximo seed o desfaz.

### O que esperar do `verify_catalog.sql`
- 4 categorias; cílios com 15 cadastrados (declarados 15), sobrancelhas 4, depilação 2, lábios 2; **total 23**.
- Nenhum serviço duplicado (0 linhas).
- Preços iguais aos da sua lista; "Remoção de extensão" com manutenção e prazo vazios.
- `sem_imagem = 23` e `com_imagem = 0` no começo.
- RLS ligada (`true`) nas duas tabelas; bucket `site-media` público, 5 MB, só imagens.

## 2. Colocar as imagens manualmente

1. Supabase → **Storage → site-media**.
2. Crie as pastas: `servicos`, `categorias`, `studio`, `home` (o Supabase cria a pasta ao enviar o primeiro arquivo dentro dela).
3. Envie a foto na pasta certa. Regras: **JPG, PNG, WebP ou AVIF, até 5 MB**. Prefira **WebP** (mais leve). Nomes em **minúsculas**, sem espaços nem acentos, só letras, números, `-`, `_` e `.`.

### Nomes sugeridos por serviço

| # | Serviço | Arquivo sugerido |
| --- | --- | --- |
| 1 | 6D Volume Glamour | `servicos/6d-volume-glamour.webp` |
| 2 | Efeito rímel Jade Picon | `servicos/efeito-rimel-jade-picon.webp` |
| 3 | Fio a fio clássico | `servicos/fio-a-fio-classico.webp` |
| 4 | Fox Easy | `servicos/fox-easy.webp` |
| 5 | Jade Picon no castanho | `servicos/jade-picon-no-castanho.webp` |
| 6 | Kim Kardashian | `servicos/kim-kardashian.webp` |
| 7 | Mega brasileiro | `servicos/mega-brasileiro.webp` |
| 8 | Mega volume | `servicos/mega-volume.webp` |
| 9 | Remoção de extensão | `servicos/remocao-de-extensao.webp` |
| 10 | Volume brasileiro | `servicos/volume-brasileiro.webp` |
| 11 | Volume brasileiro no castanho | `servicos/volume-brasileiro-no-castanho.webp` |
| 12 | Volume egípcio | `servicos/volume-egipcio.webp` |
| 13 | Volume egípcio no castanho | `servicos/volume-egipcio-no-castanho.webp` |
| 14 | Volume híbrido | `servicos/volume-hibrido.webp` |
| 15 | Volume moderado | `servicos/volume-moderado.webp` |
| 16 | Brow lamination | `servicos/brow-lamination.webp` |
| 17 | Design com henna | `servicos/design-com-henna.webp` |
| 18 | Design de sobrancelhas com cera | `servicos/design-de-sobrancelhas-com-cera.webp` |
| 19 | Henna nas sobrancelhas | `servicos/henna-nas-sobrancelhas.webp` |
| 20 | Buço com cera fria | `servicos/buco-com-cera-fria.webp` |
| 21 | Depilação facial completa com navalha | `servicos/depilacao-facial-completa-com-navalha.webp` |
| 22 | Hidra Gloss Color | `servicos/hidra-gloss-color.webp` |
| 23 | Nano Lips Gloss | `servicos/nano-lips-gloss.webp` |

### Categorias

| Categoria | Arquivo sugerido |
| --- | --- |
| Extensão de cílios | `categorias/cilios.webp` |
| Brow lamination e sobrancelhas | `categorias/sobrancelhas.webp` |
| Depilação de buço e facial | `categorias/depilacao.webp` |
| Hidra Gloss Color e Nano Lips Color | `categorias/labios.webp` |

## 3. Preencher o `image_path`

Depois de enviar a foto, informe o caminho (sem o nome do bucket, sem https) no serviço. No **SQL Editor**:

```sql
update public.services set image_path = 'servicos/6d-volume-glamour.webp' where slug = '6d-volume-glamour';
update public.service_categories set image_path = 'categorias/cilios.webp' where slug = 'cilios';
```

Ou, sem SQL, no **Table Editor → services**, edite a célula `image_path` (ex.: `servicos/6d-volume-glamour.webp`).

O banco **recusa** caminhos inválidos (URL, `..`, pasta errada ou extensão que não seja de imagem). Para voltar ao placeholder, deixe `image_path` vazio (NULL).

## 4. Como o site carrega a imagem
1. Lê `image_path` do banco (a cada 5 minutos no máximo; as páginas se atualizam sozinhas).
2. Monta a URL pública: `<SUPABASE_URL>/storage/v1/object/public/site-media/<image_path>`.
3. Exibe com `next/image` (otimiza e converte). Só o host do **seu** projeto e só o bucket `site-media` são liberados (`next.config.mjs`). **Se mudar `NEXT_PUBLIC_SUPABASE_URL`, reinicie o servidor.**
4. Sem `image_path`, ou se o arquivo não existir/falhar, aparece um **placeholder** tonal com o nome do serviço, nunca uma imagem quebrada nem uma foto de outro serviço.

## 5. Segurança
- Visitantes só **leem**, e só o que está ativo. Ninguém lista o bucket pela API.
- Upload, troca e exclusão: somente administradora (papel em `user_roles`), apenas nas pastas `servicos`, `categorias`, `studio`, `home`.
- Pela API, nem a administradora consegue alterar preço, nome ou excluir serviço: a única coluna editável é `image_path` (permissão por coluna). Preços mudam pelo SQL Editor / `data.ts`.
- A `service_role` nunca vai ao navegador.
- Os testes (`npm run test:db`) cobrem esses bloqueios (ver [TESTING.md](TESTING.md)).

## 6. Como o painel gerenciará imagens no futuro
A base já está pronta, sem reconstruir o catálogo: o bucket, as políticas de envio/troca/remoção só para admin, o grant que permite à administradora atualizar apenas `image_path`, as constantes de validação (`MAX_IMAGE_BYTES`, `ALLOWED_IMAGE_MIME`, `IMAGE_FOLDERS` e `isValidImagePath` em `src/features/catalog/storage.ts`) e a revalidação automática. Falta apenas a tela: escolher arquivo com preview, validar formato/tamanho no navegador, enviar ao Storage (`supabase.storage.from("site-media").upload`), gravar o `image_path` e remover o arquivo antigo.
