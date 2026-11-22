const labels: Record<string, string> = {
  open: "Aberto",
  in_progress: "Em andamento",
  answered: "Respondido",
  closed: "Encerrado",
};

export function TicketStatusBadge({ status }: { status: string }) {
  const tone = status === "closed" ? "bg-nude text-cocoa" : status === "answered" ? "bg-cocoa text-ivory" : "bg-rose/20 text-espresso";
  return <span className={`inline-block px-3 py-1 text-xs uppercase tracking-[0.15em] ${tone}`}>{labels[status] ?? status}</span>;
}

export const ticketStatusLabels = labels;
