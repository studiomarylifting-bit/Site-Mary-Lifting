import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/server/policies/authz";
import { Stars } from "@/components/shared/Stars";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Meus feedbacks" };

const statusLabel = { pending: "Em análise", approved: "Aprovado", rejected: "Não publicado" } as const;

export default async function MyFeedbackPage() {
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
          <p className="text-[0.7rem] uppercase tracking-[0.3em] text-rose-deep">Minha conta</p>
          <h1 className="mt-3 text-5xl">Meus feedbacks</h1>
        </div>
        <LinkButton href="/feedback/enviar" variant="outline">Enviar feedback</LinkButton>
      </header>
      {!data?.length ? (
        <p className="rounded-card border border-dashed border-stroke/60 p-10 text-center text-cocoa">Você ainda não enviou feedbacks.</p>
      ) : (
        <ul className="space-y-4">
          {data.map((f) => (
            <li key={f.id} className="space-y-3 rounded-card bg-ivory shadow-soft p-6">
              <div className="flex items-center justify-between gap-3">
                <Stars value={f.rating} />
                <span className="text-xs uppercase tracking-[0.15em] text-rose-deep">{statusLabel[f.status as keyof typeof statusLabel]}{!f.publish_consent && " · privado"}</span>
              </div>
              <p className="text-cocoa">{f.comment}</p>
              <p className="text-xs text-cocoa/85">{new Date(f.created_at).toLocaleDateString("pt-BR")}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
