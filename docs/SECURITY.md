# Segurança

| Controle | Implementação |
| --- | --- |
| Autenticação | Supabase Auth; sem senhas no banco da aplicação. Sessão renovada no middleware com `getUser()` (valida o JWT no servidor). |
| Autorização | Papel `admin` lido da tabela `user_roles` via RLS; nunca de metadata ou cookie. Layouts e handlers refazem a checagem; o middleware é só defesa em profundidade. |
| RLS | Ativado nas 12 tabelas de `public`. Grants mínimos para `anon`/`authenticated`. `rate_limit_hit` executável só por `service_role`. |
| Escalada de privilégio | `user_roles` sem grant de escrita para clientes. |
| Dados sensíveis | Ficha só visível à dona e a admins; consentimentos append-only (revogar = nova linha). |
| Validação | Zod no servidor em toda rota; corpo limitado a 64 KB. |
| CSRF | Rotas que alteram estado exigem `Origin` igual ao do site. |
| Anti-abuso | Rate limit por IP com hash salgado (IP nunca em claro), honeypot, tempo mínimo de preenchimento, limite de links. Fail-closed. |
| Open redirect | `safeNextPath` aceita só caminhos internos. |
| Cabeçalhos | CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`; `X-Powered-By` removido. |
| Segredos | Somente no servidor. Nenhum `NEXT_PUBLIC_` carrega secret (verificado por varredura). `.env*` ignorado no git. |
| Logs | Sem conteúdo de ficha, texto de mensagens, telefone ou token. |

**Decisão sobre CSP:** `script-src` e `style-src` usam `'unsafe-inline'` porque o Next.js injeta scripts inline e um CSP com nonce forçaria renderização dinâmica em todas as páginas. Todo o resto é restrito. Endurecer com nonce é uma melhoria possível.

**Limitações conhecidas:** não houve pentest nem auditoria externa; `npm audit` ainda não foi executado (ver [TESTING.md](TESTING.md)).
