# Como testar localmente

Passo a passo para rodar o site no seu computador. Você pode começar **sem configurar nada** e ir ligando as integrações aos poucos.

## 0. O que instalar uma vez
- [Node.js 22 LTS](https://nodejs.org) (já inclui o npm). Confira com `node -v`.
- [Git](https://git-scm.com).

## 1. Baixar o projeto
```bash
git clone https://github.com/studiomarylifting-bit/site-mary-lifting.git
cd site-mary-lifting
git checkout dev          # o trabalho está na branch dev
npm install
```

## 2. Primeira verificação (sem nenhuma configuração)
```bash
npm run verify            # typecheck + lint + testes unitários + build
```
**Importante:** este código foi escrito sem poder rodar `npm install`, então este é o primeiro momento em que ele é compilado de verdade. Se algum passo falhar, copie a mensagem de erro e me envie: são ajustes pequenos, mas esperados.

Para rodar um passo por vez: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.

## 3. Ver o site
```bash
npm run dev
```
Abra http://localhost:3000. **Sem variáveis de ambiente** você já consegue testar:

| O que | Esperado |
| --- | --- |
| Home, catálogo, categorias, detalhe de cada serviço | Funcionam; preços conforme sua lista |
| `/studio`, `/pagamentos`, `/quem-sou`, `/privacidade`, `/termos` | Funcionam |
| `/avaliacoes` | "Avaliações aguardando configuração" (nenhuma avaliação inventada) |
| `/entrar`, `/cadastro` | Telas aparecem; enviar não funciona sem Supabase |
| `/conta` e `/admin` | Redirecionam para `/entrar` |
| `/sac`, `/feedback/enviar` | Formulário e validação funcionam; o envio é recusado sem Supabase |

Teste também no celular: abra o DevTools do navegador (F12) e ative o modo dispositivo, ou acesse pelo IP da sua máquina na rede.

## 4. Ver o que está configurado
```bash
npm run check:env
```
Mostra o que falta em cada integração, sem exibir valores secretos.

## 5. Ligar o Supabase (login, conta, ficha, SAC, feedback, admin)
1. Siga [SETUP.md](SETUP.md) (criar projeto, aplicar a migration e o seed, criar o primeiro admin).
2. `cp .env.example .env.local` e preencha as 3 chaves do Supabase e `RATE_LIMIT_SALT`.
3. Reinicie `npm run dev` e rode `npm run check:env`.

Use um **projeto Supabase de teste**, separado do definitivo.

## 6. Roteiro de teste manual (com Supabase)
1. Criar conta em `/cadastro` (e confirmar o e-mail, se a confirmação estiver ligada).
2. Entrar em `/entrar`; ver `/conta`.
3. Preencher a ficha em `/conta/ficha`. Confirmar que **não envia** sem a autorização de saúde.
4. Em `/conta/autorizacoes`, ligar e desligar um consentimento opcional.
5. Enviar um SAC em `/sac`; ver o protocolo e o item em `/conta/sac`.
6. Enviar um feedback em `/feedback/enviar`; ele **não** deve aparecer em `/feedback` antes de aprovado.
7. Tornar sua conta admin (SETUP.md, passo 3), entrar em `/admin`, aprovar o feedback e responder o SAC.
8. Com uma **segunda conta de cliente**, tentar abrir `/admin` (deve ser negado) e conferir que ela não vê a ficha nem os SAC da primeira.
9. Em `/conta/perfil`, usar a exportação dos seus dados.

## 7. Uazapi e Google (opcionais)
Preencha as variáveis correspondentes e veja [INTEGRATIONS.md](INTEGRATIONS.md). Use um número de teste do Studio no começo. A Uazapi **ainda não foi testada com token real**: confira se a mensagem chega e me avise do resultado.

## 8. Testes automatizados
```bash
npm test                              # unitários (Vitest)
npx playwright install chromium       # uma vez
npm run test:e2e                      # sobe o site sozinho e testa desktop e celular
```
Os E2E rodam sem secrets.

## Problemas comuns
- **Porta 3000 ocupada:** `npm run dev -- -p 3001` e ajuste `NEXT_PUBLIC_SITE_URL`.
- **Mudou o `.env.local`:** reinicie o `npm run dev`.
- **Erro de versão do Node:** use o Node 22 (`nvm use`, há um `.nvmrc`).
