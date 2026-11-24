import { createSupabaseServerClient } from "@/lib/supabase/server";
import { findServiceBySlug } from "@/features/catalog/catalog-core";
import { getCatalog } from "@/features/catalog/queries";
import { Stars } from "@/components/shared/Stars";
import { FeedbackModeration } from "@/features/feedback/FeedbackModeration";
import { getT } from "@/i18n/server";
import { formatDate } from "@/i18n/format";

export default async function AdminFeedback() {
  const [catalog, t] = await Promise.all([getCatalog(), getT()]);
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase.from("feedback")
    .select("id, rating, comment, procedure_slug, display_name, anonymize, publish_consent, status, created_at, user_id")
    .order("status", { ascending: true }).order("created_at", { ascending: false }).limit(100);

  return (
    <div className="space-y-8">
      <h1 className="text-4xl sm:text-5xl">{t("admin.feedback.title")}</h1>
      <p className="max-w-2xl text-sm text-cocoa">{t("admin.feedback.note")}</p>
      {!data?.length ? <p className="text-cocoa">{t("admin.feedback.none")}</p> : (
        <ul className="space-y-4">
          {data.map((f) => (
            <li key={f.id} className="space-y-4 rounded-card bg-ivory shadow-soft p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Stars value={f.rating} />
                <p className="text-xs uppercase tracking-[0.15em] text-rose-deep">
                  {f.user_id ? t("admin.feedback.withAccount") : t("admin.feedback.noAccount")} · {f.publish_consent ? t("admin.feedback.allows") : t("admin.feedback.denies")}
                </p>
              </div>
              <p className="whitespace-pre-wrap text-cocoa">{f.comment}</p>
              <p className="text-xs text-cocoa/85">
                {f.anonymize ? t("admin.feedback.showAnon") : t("admin.feedback.showName", { name: f.display_name ?? "" })}
                {f.procedure_slug && findServiceBySlug(catalog, f.procedure_slug) ? ` · ${findServiceBySlug(catalog, f.procedure_slug)?.name}` : ""}
                {" · "}{formatDate(f.created_at, t.locale)}
              </p>
              <FeedbackModeration id={f.id} status={f.status} anonymize={f.anonymize} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
