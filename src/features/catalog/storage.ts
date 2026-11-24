/**
 * Imagens do site ficam no bucket PÚBLICO `site-media` do Supabase Storage.
 * O banco guarda só o CAMINHO dentro do bucket (image_path), nunca a URL:
 * assim a URL base pode mudar (outro projeto, domínio próprio) sem migrar dados.
 *
 * Convenção de pastas: servicos/ · categorias/ · studio/ · home/ · brand/
 * Este módulo é puro (sem env, sem rede) para ser testável e usável em qualquer lado.
 */
export const CATALOG_BUCKET = "site-media";
export const IMAGE_FOLDERS = ["servicos", "categorias", "studio", "home", "brand"] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;

// Espelha o CHECK do banco (services_image_path_chk / service_categories_image_path_chk).
// Aceita espaços e maiúsculas (ex.: "Brow lamination.jpg"); a URL é montada com encodeURIComponent.
const IMAGE_PATH = /^(servicos|categorias|studio|home|brand)\/[a-z0-9][a-z0-9 ._/-]*\.(jpe?g|png|webp|avif)$/i;

export function isValidImagePath(path: unknown): path is string {
  return typeof path === "string" && path.length <= 200 && IMAGE_PATH.test(path) && !path.includes("..");
}

/** URL pública de um objeto do bucket. Retorna undefined se não houver caminho válido. */
export function publicImageUrl(path: string | null | undefined, supabaseUrl: string | null | undefined): string | undefined {
  if (!path || !supabaseUrl || !isValidImagePath(path)) return undefined;
  const base = supabaseUrl.replace(/\/+$/, "");
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/public/${CATALOG_BUCKET}/${encoded}`;
}
