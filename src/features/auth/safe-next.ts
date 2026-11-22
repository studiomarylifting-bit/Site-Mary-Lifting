/**
 * Evita open redirect: aceita apenas caminhos internos ("/conta/..."),
 * rejeitando "//host", "/\host", esquemas e caracteres de controle.
 */
export function safeNextPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//") || value.startsWith("/\\")) return null;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f]/.test(value)) return null;
  return value;
}
