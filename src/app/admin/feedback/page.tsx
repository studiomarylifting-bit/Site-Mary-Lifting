import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getServiceBySlug } from "@/features/catalog/queries";
import { Stars } from "@/components/shared/Stars";
import { FeedbackModeration } from "@/features/feedback/FeedbackModeration";

export default async function AdminFeedback() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase.from("feedback")
    .select("id, rating, comment, procedure_slug, display_name, anonymize, publish_consent, status, created_at, user_id")
    .order("status", { ascending: true }).order("created_at", { ascending: false }).limit(100);

  return (
    <div className="space-y-8">
      <h1 className="text-5xl">Feedback</h1>
      <p className="max-w-2xl text-sm text-cocoa">Só aparecem no site os feedbacks <strong>aprovados</strong> e com <strong>autorização de publicação</strong>. Sem autorização, o feedback permanece privado mesmo se aprovado.</p>
      {!data?.length ? <p className="text-cocoa">Nenhum feedback recebido.</p> : (
        <ul className="space-y-4">
          {data.map((f) => (
            <li key={f.id} className="space-y-4 rounded-card bg-ivory shadow-soft p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Stars value={f.rating} />
                <p className="text-xs uppercase tracking-[0.15em] text-rose-deep">
                  {f.user_id ? "Cliente com conta" : "Sem conta"} · {f.publish_consent ? "Autoriza publicar" : "Não autoriza publicar"}
                </p>
              </div>
              <p className="whitespace-pre-wrap text-cocoa">{f.comment}</p>
              <p className="text-xs text-cocoa/85">
                {f.anonymize ? "Exibição: Cliente (anônimo)" : `Exibição: ${f.display_name}`}
                {f.procedure_slug && getServiceBySlug(f.procedure_slug) ? ` · ${getServiceBySlug(f.procedure_slug)?.name}` : ""}
                {" · "}{new Date(f.created_at).toLocaleDateString("pt-BR")}
              </p>
              <FeedbackModeration id={f.id} status={f.status} anonymize={f.anonymize} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
