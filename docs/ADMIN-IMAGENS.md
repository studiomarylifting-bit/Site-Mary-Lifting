# Ambiente do admin e troca de imagens

## Dois ambientes
- **Cliente** (`/conta`): ficha, SAC, feedbacks, autorizações, perfil.
- **Admin** (`/admin`, só papel `admin` em `user_roles`): painel, clientes, SAC, feedback e **Imagens**.
- Depois do login, cada um cai no seu ambiente; a admin que abrir `/conta` é levada a `/admin`. Visitante e
  cliente em `/admin` recebem 404/redirecionamento. O menu do site mostra "Painel" para a admin e "Minha conta" para a cliente.

## Tela Imagens (`/admin/imagens`)
Só **imagens** mudam; textos e preços não.
- **Marca:** logo do menu (tema claro e escuro) e favicon (navegador claro e escuro).
- **Página inicial:** foto principal, foto de detalhe, ambiente e detalhe do Studio.
- **Catálogo:** foto de cada categoria e de cada serviço (só se o catálogo já estiver no Supabase).
- Cada item tem prévia, envio com prévia da nova imagem, e "Voltar ao padrão" (apaga o arquivo enviado).

### Como funciona
1. Migration `supabase/migrations/20261124000001_site_images.sql` (**rodar no SQL Editor; aditiva e idempotente**):
   cria `public.site_images` (slot → caminho no bucket `site-media`) e libera a pasta `brand/`.
2. O arquivo vai para o bucket `site-media` com nome único (sem cache velho); o nome antigo é apagado.
3. O site lê `site_images`; sem linha, usa a imagem padrão do código (`src/features/site-images/slots.ts`).

### Segurança
- Ação de servidor confere `admin` no banco; o RLS do banco confere de novo (admin-only para escrever).
- O formato é verificado pelos **bytes** (JPG/PNG/WebP/AVIF), não pelo nome. SVG e HTML são recusados.
- Máximo de 4 MB por arquivo; caminho validado (sem URL, sem `..`, só pastas permitidas).
- Nenhuma chave de serviço no navegador.

### Limites
- O ícone de iPhone (`src/app/apple-icon.png`) é arquivo fixo e não é editável pela tela.
- Fotos do catálogo seguem o cache de até 5 minutos do catálogo.
- O navegador pode guardar o favicon antigo por um tempo (Ctrl+F5).

## Testes
`tests/unit/site-images.test.ts`, `tests/db/site_images_rls.sql` (via `npm run test:db`) e
`tests/e2e/admin-images.spec.ts` (o trecho com admin precisa de `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD`).
