import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/server/policies/authz";
import { Stars } from "@/components/shared/Stars";
import { LinkButton } from "@/components/ui/Button";
import { getT } from "@/i18n/server";
import { formatDate } from "@/i18n/format";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("account.feedbacks.title") };
}

const statuses = ["pending", "approved", "rejected"] as const;

export default async function MyFeedbackPage() {
  const t = await getT();
  const user = await getSessionUser();
  const supabase = await createSupabaseServerClient();
  if (!user || !supabase) return null;
  const { data } = await supabase
    .from("feedback").select("id, rating, comment, status, publish_consent, created_at")
    .eq("user_id", user.id).order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-rose-deep">{t("account.eyebrow")}</p>
          <h1 className="mt-3 text-4xl sm:text-5xl">{t("account.feedbacks.title")}</h1>
        </div>
        <LinkButton href="/feedback/enviar" variant="outline">{t("account.feedbacks.send")}</LinkButton>
      </header>
      {!data?.length ? (
        <p className="rounded-card border border-dashed border-stroke/60 p-10 text-center text-cocoa">{t("account.feedbacks.empty")}</p>
      ) : (
        <ul className="space-y-4">
          {data.map((f) => (
            <li key={f.id} className="space-y-3 rounded-card bg-ivory shadow-soft p-6">
              <div className="flex items-center justify-between gap-3">
                <Stars value={f.rating} />
                <span className="text-xs uppercase tracking-[0.15em] text-rose-deep">{statuses.includes(f.status as (typeof statuses)[number]) ? t(`account.feedbacks.${f.status}`) : f.status}{!f.publish_consent && ` · ${t("account.feedbacks.private")}`}</span>
              </div>
              <p className="text-cocoa">{f.comment}</p>
              <p className="text-xs text-cocoa/85">{formatDate(f.created_at, t.locale)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
