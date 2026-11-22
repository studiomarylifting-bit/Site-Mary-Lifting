# Integrações

## Uazapi (WhatsApp do Studio)
- Destinatário **único**, definido por `UAZAPI_STUDIO_PHONE` (formato `55DDDNUMERO`). O número da cliente nunca é destinatário.
- Requisição implementada: `POST {UAZAPI_BASE_URL}/send/text`, header `token`, corpo `{ number, text }`, conforme a documentação oficial consultada (https://docs.uazapi.com/docs/getting-started).
- **Não validado:** formato da resposta e códigos de erro (a página remete à referência OpenAPI). O cliente depende apenas do status HTTP. **Falta um teste real com uma instância e token**.
- Timeout de 8 s; até 2 tentativas apenas para erros transitórios (rede, timeout, 429, 5xx), nunca para 4xx.
- Idempotência: `notification_events.idempotency_key = "{kind}:{refId}"` único; um segundo disparo não duplica a mensagem.
- Falha de envio nunca derruba o fluxo principal; o status fica registrado (`sent`, `failed`, `skipped`).
- Sem marketing automático. Mensagens em `src/server/integrations/uazapi/messages.ts`.

## Google Places API (New)
- Chamada somente no servidor: `GET https://places.googleapis.com/v1/places/{PLACE_ID}` com `X-Goog-Api-Key` e `X-Goog-FieldMask`.
- A API devolve **no máximo 5 avaliações** (as mais relevantes); a página direciona ao Google para ver todas e para escrever uma avaliação.
- Cache de 6 h (data cache do Next). Avaliações **não** são gravadas no nosso banco.
- Estados: não configurado, carregando, vazio, erro (limite, chave inválida, lugar inexistente, rede) e sucesso, com atribuição ao Google.
- Para obter o `GOOGLE_PLACE_ID`: Google Maps Platform → Place ID Finder, buscando o Studio. Restrinja a chave por API (Places API New) e por origem de servidor no Google Cloud.
- **Não validado:** nenhuma chamada real foi feita (faltam chave e Place ID).
