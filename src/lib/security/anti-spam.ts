/**
 * Anti-spam leve, sem serviço externo:
 *  - honeypot: campo "website" invisível; bots preenchem, humanos não.
 *  - tempo mínimo: formulários enviados em < 3s após renderizar são suspeitos.
 *  - limite de links: spam costuma trazer URLs.
 */
export const MIN_FILL_MS = 3000;

export interface SpamSignals {
  honeypot?: string;
  renderedAt?: number;
  text?: string;
  now?: number;
}

export function looksLikeSpam({
  honeypot,
  renderedAt,
  text,
  now = Date.now(),
}: SpamSignals): boolean {
  if (honeypot && honeypot.trim().length > 0) return true;
  if (typeof renderedAt === "number" && now - renderedAt < MIN_FILL_MS) return true;
  if (text && (text.match(/https?:\/\//gi)?.length ?? 0) > 2) return true;
  return false;
}
