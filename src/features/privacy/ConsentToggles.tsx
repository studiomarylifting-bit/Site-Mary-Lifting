"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { CheckField } from "@/components/ui/Field";
import { sendJson } from "@/lib/client/post-json";
import { useI18n } from "@/i18n/client";
import { formatDate } from "@/i18n/format";
import { translateMessage } from "@/i18n/server-messages";


type Kind = "whatsapp_followup" | "whatsapp_marketing" | "ranking_name" | "image_use" | "instagram_mention";
interface Item { kind: Kind; text: string; granted: boolean; at: string | null }

export function ConsentToggles({ items }: { items: Item[] }) {
  const { t, locale } = useI18n();
  const [state, setState] = useState(() => Object.fromEntries(items.map((i) => [i.kind, i.granted])) as Record<Kind, boolean>);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState<Kind | null>(null);

  async function toggle(kind: Kind, granted: boolean) {
    setBusy(kind);
    setMsg(null);
    const r = await sendJson("/api/consents", { kind, granted });
    setBusy(null);
    if (r.ok) {
      setState((s) => ({ ...s, [kind]: granted }));
      setMsg({ tone: "success", text: granted ? t("account.consents.saved") : t("account.consents.revoked") });
    } else {
      setMsg({ tone: "error", text: translateMessage(r.message ?? "Não foi possível salvar.", locale) });
    }
  }

  return (
    <div className="space-y-5">
      {msg && <Alert tone={msg.tone}>{msg.text}</Alert>}
      <ul className="space-y-4">
        {items.map((i) => (
          <li key={i.kind} className="rounded-card bg-ivory shadow-soft p-5">
            <CheckField id={i.kind} label={i.text} checked={state[i.kind]} disabled={busy === i.kind}
              onChange={(e) => toggle(i.kind, e.target.checked)} />
            {i.at && <p className="mt-2 pl-8 text-xs text-cocoa/85">{t("account.consents.last", { date: formatDate(i.at, locale, true) })}</p>}
          </li>
        ))}
      </ul>
      <p className="text-xs text-cocoa/85">{t("account.consents.note")}</p>
      {locale !== "pt" && <p className="text-xs text-cocoa/85">{t("consent.note")}</p>}
    </div>
  );
}
