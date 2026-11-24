import "server-only";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabasePublicEnv } from "@/lib/env";
import { publicImageUrl } from "@/features/catalog/storage";
import { SITE_IMAGE_SLOTS, type SiteImageKey } from "./slots";

export type SiteImages = Record<SiteImageKey, string>;
export interface SiteImageState {
  /** URL em uso (personalizada ou padrão). */
  url: string;
  /** Caminho no bucket quando personalizada; null = padrão do código. */
  path: string | null;
}

/** Estado de cada slot. Qualquer falha (sem Supabase, tabela ausente) cai no padrão do código. */
export const getSiteImageStates = cache(async (): Promise<Record<SiteImageKey, SiteImageState>> => {
  const out = Object.fromEntries(
    SITE_IMAGE_SLOTS.map((s) => [s.key, { url: s.fallback, path: null }]),
  ) as Record<SiteImageKey, SiteImageState>;
  try {
    const supabase = await createSupabaseServerClient();
    const base = getSupabasePublicEnv()?.url;
    if (!supabase || !base) return out;
    const { data, error } = await supabase.from("site_images").select("slot, image_path");
    if (error || !data) return out;
    for (const row of data) {
      const slot = SITE_IMAGE_SLOTS.find((s) => s.key === row.slot);
      const url = publicImageUrl(row.image_path, base);
      if (slot && url) out[slot.key] = { url, path: row.image_path };
    }
  } catch {
    /* mantém os padrões */
  }
  return out;
});

export async function getSiteImages(): Promise<SiteImages> {
  const states = await getSiteImageStates();
  return Object.fromEntries(Object.entries(states).map(([k, v]) => [k, v.url])) as SiteImages;
}
