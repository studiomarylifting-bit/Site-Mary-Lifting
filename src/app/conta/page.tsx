import Link from "next/link";
import { ArrowRight, FileHeart, LifeBuoy, MessageSquareQuote, ShieldCheck } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/server/policies/authz";
import { Alert } from "@/components/ui/Alert";

export default async function AccountHome() {
  const user = await getSessionUser();
  const supabase = await createSupabaseServerClient();
  if (!user || !supabase) return null;

  const [profile, intake, tickets, feedback] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.from("intake_forms").select("status, updated_at").eq("user_id", user.id).maybeSingle(),
    supabase.from("sac_tickets").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("feedback").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);
  const firstName = profile.data?.full_name?.split(" ")[0] ?? "";
  const intakeLabel = intake.data
    ? `Enviada em ${new Date(intake.data.updated_at).toLocaleDateString("pt-BR")}`
    : "Ainda não preenchida";

  const cards = [
    { href: "/conta/ficha", icon: FileHeart, title: "Ficha de atendimento", info: intakeLabel },
    { href: "/conta/sac", icon: LifeBuoy, title: "Meus SAC", info: `${tickets.count ?? 0} solicitações` },
    { href: "/conta/feedbacks", icon: MessageSquareQuote, title: "Meus feedbacks", info: `${feedback.count ?? 0} enviados` },
    { href: "/conta/autorizacoes", icon: ShieldCheck, title: "Autorizações", info: "Gerencie seus consentimentos" },
  ];

  return (
    <div className="space-y-10">
      <header>
        <p className="text-[0.7rem] uppercase tracking-[0.3em] text-rose-deep">Minha conta</p>
        <h1 className="mt-3 text-5xl md:text-6xl">Olá{firstName ? `, ${firstName}` : ""}.</h1>
      </header>
      {!intake.data && (
        <Alert tone="info" title="Preencha sua ficha de atendimento">
          A ficha organiza seu atendimento. <Link className="underline" href="/conta/ficha">Preencher agora</Link>.
        </Alert>
      )}
      <ul className="grid gap-4 sm:grid-cols-2">
        {cards.map(({ href, icon: Icon, title, info }) => (
          <li key={href}>
            <Link href={href} className="group flex h-full items-start justify-between gap-4 rounded-card bg-ivory shadow-soft p-6 transition duration-300 hover:-translate-y-0.5 hover:shadow-lift motion-reduce:transition-none motion-reduce:hover:translate-y-0">
              <span className="flex gap-4">
                <Icon size={24} strokeWidth={1.3} className="mt-1 text-rose-deep" aria-hidden />
                <span><span className="block font-display text-2xl text-espresso">{title}</span><span className="text-sm text-cocoa">{info}</span></span>
              </span>
              <ArrowRight size={18} className="mt-2 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
