"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/server/policies/authz";
import { validateCategory, validateService, type FieldCode } from "./validate";

/** Estado do formulário. Códigos são traduzidos na tela (admin.catalog.err.* / admin.catalog.field.*). */
export interface CatalogFormState {
  ok?: boolean;
  code?: "forbidden" | "unavailable" | "validation" | "duplicate" | "badCategory" | "saveFailed";
  errors?: Record<string, FieldCode>;
  /** Em caso de erro, o que foi digitado (o React 19 limpa o formulário após a ação). */
  values?: Record<string, string>;
  rev?: number;
}

type Client = NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;

async function guard(): Promise<{ supabase: Client } | { code: NonNullable<CatalogFormState["code"]> }> {
  if (!(await requireAdmin())) return { code: "forbidden" };
  const supabase = await createSupabaseServerClient();
  return supabase ? { supabase } : { code: "unavailable" };
}

const toObject = (fd: FormData) => Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === "string"));

function failure(error: { code?: string } | null): CatalogFormState {
  if (error?.code === "23505") return { code: "duplicate" };
  if (error?.code === "23503") return { code: "badCategory" };
  return { code: "saveFailed" };
}

function refresh() {
  revalidatePath("/", "layout");
}

/** Cria ou edita uma categoria (catálogo). `mode=create|edit`; o slug nunca muda depois de criado. */
async function saveCategoryInner(formData: FormData): Promise<CatalogFormState> {
  const g = await guard();
  if ("code" in g) return { code: g.code };
  const creating = formData.get("mode") === "create";
  const v = validateCategory(toObject(formData), { creating });
  if (!v.ok) return { code: "validation", errors: v.errors };
  const { slug, ...rest } = v.value;

  if (creating) {
    const { error } = await g.supabase.from("service_categories").insert({ slug, ...rest });
    if (error) return failure(error);
    refresh();
    redirect(`/admin/catalogo/${slug}`);
  }
  const target = String(formData.get("slug") ?? "");
  if (!/^[a-z0-9-]{1,80}$/.test(target)) return { code: "saveFailed" };
  const { data, error } = await g.supabase.from("service_categories").update(rest).eq("slug", target).select("slug");
  if (error) return failure(error);
  if (!data?.length) return { code: "forbidden" }; // RLS: nenhuma linha afetada
  refresh();
  return { ok: true };
}

/** Cria ou edita um procedimento. Ao criar, mantém "opções declaradas" da categoria coerente (nunca diminui). */
async function saveServiceInner(formData: FormData): Promise<CatalogFormState> {
  const g = await guard();
  if ("code" in g) return { code: g.code };
  const creating = formData.get("mode") === "create";
  const v = validateService(toObject(formData), { creating });
  if (!v.ok) return { code: "validation", errors: v.errors };
  const { slug, ...rest } = v.value;

  if (creating) {
    const { error } = await g.supabase.from("services").insert({ slug, ...rest });
    if (error) return failure(error);

    const [{ count }, { data: cat }] = await Promise.all([
      g.supabase.from("services").select("slug", { count: "exact", head: true }).eq("category_slug", rest.category_slug).eq("active", true),
      g.supabase.from("service_categories").select("declared_option_count").eq("slug", rest.category_slug).maybeSingle(),
    ]);
    if (cat && count !== null && count > cat.declared_option_count) {
      await g.supabase.from("service_categories").update({ declared_option_count: count }).eq("slug", rest.category_slug);
    }
    refresh();
    redirect(`/admin/catalogo/${rest.category_slug}/${slug}`);
  }
  const target = String(formData.get("slug") ?? "");
  if (!/^[a-z0-9-]{1,80}$/.test(target)) return { code: "saveFailed" };
  const { data, error } = await g.supabase.from("services").update(rest).eq("slug", target).select("slug");
  if (error) return failure(error);
  if (!data?.length) return { code: "forbidden" };
  refresh();
  return { ok: true };
}

/** Arquivar/reativar (não existe exclusão: preserva links, feedbacks e histórico). */
export async function setActiveAction(_prev: CatalogFormState, formData: FormData): Promise<CatalogFormState> {
  const g = await guard();
  if ("code" in g) return { code: g.code };
  const kind = formData.get("kind");
  const slug = String(formData.get("slug") ?? "");
  if ((kind !== "service" && kind !== "category") || !/^[a-z0-9-]{1,80}$/.test(slug)) return { code: "saveFailed" };
  const active = formData.get("active") === "true";
  const { data, error } = await g.supabase.from(kind === "service" ? "services" : "service_categories").update({ active }).eq("slug", slug).select("slug");
  if (error) return failure(error);
  if (!data?.length) return { code: "forbidden" };
  refresh();
  return { ok: true };
}

/** Mantém o que a admin digitou quando algo falha (senão o formulário volta vazio). */
async function keepValues(formData: FormData, run: () => Promise<CatalogFormState>): Promise<CatalogFormState> {
  const state = await run();
  return state.ok ? state : { ...state, values: toObject(formData) as Record<string, string>, rev: Date.now() };
}
export async function saveCategoryAction(_prev: CatalogFormState, formData: FormData): Promise<CatalogFormState> {
  return keepValues(formData, () => saveCategoryInner(formData));
}
export async function saveServiceAction(_prev: CatalogFormState, formData: FormData): Promise<CatalogFormState> {
  return keepValues(formData, () => saveServiceInner(formData));
}
