"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/server/policies/authz";
import { CATALOG_BUCKET, isValidImagePath } from "@/features/catalog/storage";
import { MAX_UPLOAD_BYTES, MIME_BY_EXT, buildImagePath, getSlot, sniffImage } from "./slots";

/** Estado devolvido ao formulário. `code` é traduzido na tela (admin.images.err.*). */
export interface ImageFormState {
  ok?: boolean;
  code?: "forbidden" | "unavailable" | "invalidSlot" | "noFile" | "tooBig" | "badFormat" | "uploadFailed" | "saveFailed";
  /** Quem foi alterado (para o formulário certo mostrar o resultado). */
  target?: string;
}

async function readUpload(formData: FormData): Promise<
  { bytes: Uint8Array; ext: NonNullable<ReturnType<typeof sniffImage>> } | { code: NonNullable<ImageFormState["code"]> }
> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { code: "noFile" };
  if (file.size > MAX_UPLOAD_BYTES) return { code: "tooBig" };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = sniffImage(bytes); // formato real pelos bytes, não pelo nome/Content-Type
  if (!ext) return { code: "badFormat" };
  return { bytes, ext };
}

async function removeObject(supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>, path: string | null | undefined) {
  if (path && isValidImagePath(path)) await supabase.storage.from(CATALOG_BUCKET).remove([path]);
}

/** Troca a imagem de um slot (favicon, logo, fotos da home). Só admin; o RLS do banco confere de novo. */
export async function uploadSiteImageAction(_prev: ImageFormState, formData: FormData): Promise<ImageFormState> {
  const slot = getSlot(formData.get("slot"));
  if (!slot) return { code: "invalidSlot" };
  const target = slot.key;
  if (!(await requireAdmin())) return { code: "forbidden", target };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { code: "unavailable", target };

  const up = await readUpload(formData);
  if ("code" in up) return { code: up.code, target };

  const path = buildImagePath(slot.folder, slot.key, up.ext);
  const { error: upErr } = await supabase.storage
    .from(CATALOG_BUCKET)
    .upload(path, up.bytes, { contentType: MIME_BY_EXT[up.ext], cacheControl: "31536000", upsert: false });
  if (upErr) return { code: "uploadFailed", target };

  const { data: prev } = await supabase.from("site_images").select("image_path").eq("slot", slot.key).maybeSingle();
  const user = await requireAdmin();
  const { error } = await supabase
    .from("site_images")
    .upsert({ slot: slot.key, image_path: path, updated_by: user?.id ?? null }, { onConflict: "slot" });
  if (error) {
    await removeObject(supabase, path); // não deixa arquivo órfão
    return { code: "saveFailed", target };
  }
  await removeObject(supabase, prev?.image_path);
  revalidatePath("/", "layout");
  return { ok: true, target };
}

/** Volta o slot para a imagem padrão do código e apaga o arquivo enviado. */
export async function resetSiteImageAction(_prev: ImageFormState, formData: FormData): Promise<ImageFormState> {
  const slot = getSlot(formData.get("slot"));
  if (!slot) return { code: "invalidSlot" };
  const target = slot.key;
  if (!(await requireAdmin())) return { code: "forbidden", target };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { code: "unavailable", target };

  const { data: prev } = await supabase.from("site_images").select("image_path").eq("slot", slot.key).maybeSingle();
  const { error } = await supabase.from("site_images").delete().eq("slot", slot.key);
  if (error) return { code: "saveFailed", target };
  await removeObject(supabase, prev?.image_path);
  revalidatePath("/", "layout");
  return { ok: true, target };
}

/** Foto de um serviço ou categoria do catálogo (grava só image_path; o grant do banco é por coluna). */
export async function uploadCatalogImageAction(_prev: ImageFormState, formData: FormData): Promise<ImageFormState> {
  const kind = formData.get("kind");
  const slugRaw = String(formData.get("slug") ?? "");
  if ((kind !== "service" && kind !== "category") || !/^[a-z0-9-]{1,80}$/.test(slugRaw)) return { code: "invalidSlot" };
  const target = `${kind}:${slugRaw}`;
  if (!(await requireAdmin())) return { code: "forbidden", target };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { code: "unavailable", target };

  const up = await readUpload(formData);
  if ("code" in up) return { code: up.code, target };

  const table = kind === "service" ? "services" : "service_categories";
  const folder = kind === "service" ? "servicos" : "categorias";
  const { data: prev } = await supabase.from(table).select("image_path").eq("slug", slugRaw).maybeSingle();
  const path = buildImagePath(folder, slugRaw, up.ext);

  const { error: upErr } = await supabase.storage
    .from(CATALOG_BUCKET)
    .upload(path, up.bytes, { contentType: MIME_BY_EXT[up.ext], cacheControl: "31536000", upsert: false });
  if (upErr) return { code: "uploadFailed", target };

  const { error } = await supabase.from(table).update({ image_path: path }).eq("slug", slugRaw);
  if (error) {
    await removeObject(supabase, path);
    return { code: "saveFailed", target };
  }
  await removeObject(supabase, prev?.image_path);
  revalidatePath("/", "layout");
  return { ok: true, target };
}
