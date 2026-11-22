# Privacidade e LGPD

Este documento descreve como a aplicação trata dados. **Não é parecer jurídico** e a aplicação não deve ser tida como em conformidade com a LGPD sem revisão profissional.

## Dados tratados
- Cadastro: nome, celular, e-mail (senha fica com o Supabase Auth).
- Ficha de atendimento: dados de saúde (dado pessoal sensível), nascimento, Instagram opcional.
- SAC, feedback e solicitações de privacidade.
- Consentimentos, com timestamp e versão do texto (`CONSENT_TEXT_VERSION`).

## Consentimentos independentes
Saúde (obrigatório para enviar a ficha), lembretes por WhatsApp, marketing por WhatsApp, ranking, uso de imagem e menção no Instagram. Nenhum condiciona o atendimento nem agrupa outro. A autorização de saúde vale só para avaliar e organizar o atendimento.

## Direitos dos titulares
Acesso e exportação (`/api/account/export`), correção (perfil e ficha editáveis), exclusão da ficha (botão na conta), revogação de consentimentos (`/conta/autorizacoes`) e solicitações formais em `/privacidade`.

## WhatsApp
A ficha **nunca** é enviada por WhatsApp. O Studio recebe só um aviso minimizado (tipo de evento, protocolo do SAC e link do painel).

## Pendências do Studio (não inventadas)
Defina nas variáveis `NEXT_PUBLIC_LEGAL_*`: nome do controlador, CNPJ/CPF, e-mail de privacidade, encarregado (se houver) e **prazo de retenção da ficha**. Enquanto vazias, a página exibe "a definir". Os textos de `/privacidade` e `/termos` devem ser revisados por profissional jurídico antes da publicação.
