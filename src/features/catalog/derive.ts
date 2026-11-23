/**
 * Prazo de manutenção em dias, extraído do texto de retorno informado pelo
 * Studio (ex.: "Retorno em até 30 dias."). Só existe quando há valor de
 * manutenção; "Remoção de extensão" e demais serviços ficam sem prazo.
 * Usado pelo seed e pelo fallback estático, para nunca divergirem.
 */
export function deriveMaintenanceDays(returnInfo?: string, maintenanceCents?: number): number | undefined {
  if (maintenanceCents === undefined || !returnInfo) return undefined;
  const m = /(\d{1,3})\s*dias/i.exec(returnInfo);
  return m ? Number(m[1]) : undefined;
}
