"use client";

import { useT } from "@/i18n/client";

const known = ["open", "in_progress", "answered", "closed"];

export function TicketStatusBadge({ status }: { status: string }) {
  const t = useT();
  const tone = status === "closed" ? "bg-nude text-cocoa" : status === "answered" ? "bg-cocoa text-ivory" : "bg-rose/20 text-espresso";
  return <span className={`inline-block px-3 py-1 text-xs uppercase tracking-[0.15em] ${tone}`}>{known.includes(status) ? t(`account.status.${status}`) : status}</span>;
}
