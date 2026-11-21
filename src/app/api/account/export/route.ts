import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { jsonError } from "@/server/http";
import { getSessionUser } from "@/server/policies/authz";

/** Exportação dos dados da PRÓPRIA cliente (portabilidade/acesso). Escopo garantido por RLS. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return jsonError(401, "unauthenticated", "Entre na sua conta.");
  const supabase = await createSupabaseServerClient();
  if (!supabase) return jsonError(503, "unavailable", "Serviço indisponível.");

  const [profile, intake, consents, tickets, feedback] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("intake_forms").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("intake_consents").select("*").eq("user_id", user.id).order("created_at"),
    supabase.from("sac_tickets").select("*").eq("user_id", user.id).order("created_at"),
    supabase.from("feedback").select("*").eq("user_id", user.id).order("created_at"),
  ]);

  const body = {
    exportedAt: new Date().toISOString(),
    email: user.email,
    profile: profile.data,
    intakeForm: intake.data,
    consents: consents.data ?? [],
    sacTickets: tickets.data ?? [],
    feedback: feedback.data ?? [],
  };
  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="meus-dados-mary-lifting.json"',
      "Cache-Control": "no-store",
    },
  });
}
