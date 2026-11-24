/**
 * Imagens do site que o admin pode trocar. Módulo PURO (sem env/rede): testável e usável
 * em qualquer lado. O banco guarda só o caminho no bucket `site-media`; sem linha, vale o `fallback`.
 */
export const HERO_FALLBACK =
  "https://res.cloudinary.com/izm2j4iu/image/upload/v1795401027/Studio_Mary_Lifting_Balloon-Decorated_Salon.png";

export interface SiteImageSlot {
  key: string;
  group: "brand" | "home";
  /** Pasta no bucket. */
  folder: "brand" | "home";
  fallback: string;
  /** Fundo sobre o qual a imagem aparece (a prévia usa o mesmo). */
  surface: "light" | "dark" | "photo";
  /** Proporção sugerida (texto para o admin). */
  ratio: string;
  /** Logos/favicons precisam de fundo transparente → PNG/WebP. */
  transparent: boolean;
}

export const SITE_IMAGE_SLOTS = [
  { key: "logoLight", group: "brand", folder: "brand", fallback: "/brand/logo-light.png", surface: "light", ratio: "2:3", transparent: true },
  { key: "logoDark", group: "brand", folder: "brand", fallback: "/brand/logo-dark.png", surface: "dark", ratio: "2:3", transparent: true },
  { key: "faviconLight", group: "brand", folder: "brand", fallback: "/brand/icon-light.png", surface: "light", ratio: "1:1", transparent: true },
  { key: "faviconDark", group: "brand", folder: "brand", fallback: "/brand/icon-dark.png", surface: "dark", ratio: "1:1", transparent: true },
  { key: "heroPhoto", group: "home", folder: "home", fallback: HERO_FALLBACK, surface: "photo", ratio: "4:5", transparent: false },
  { key: "heroDetail", group: "home", folder: "home", fallback: HERO_FALLBACK, surface: "photo", ratio: "1:1", transparent: false },
  { key: "studioAmbience", group: "home", folder: "home", fallback: HERO_FALLBACK, surface: "photo", ratio: "4:5", transparent: false },
  { key: "studioDetail", group: "home", folder: "home", fallback: HERO_FALLBACK, surface: "photo", ratio: "3:4", transparent: false },
] as const satisfies readonly SiteImageSlot[];

export type SiteImageKey = (typeof SITE_IMAGE_SLOTS)[number]["key"];
export const SLOT_KEYS = SITE_IMAGE_SLOTS.map((s) => s.key) as SiteImageKey[];

export function getSlot(key: unknown): SiteImageSlot | undefined {
  return SITE_IMAGE_SLOTS.find((s) => s.key === key);
}

/** Limite do envio pelo painel (abaixo dos 5 MB do bucket e do teto de corpo de hospedagens comuns). */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export type ImageExt = "jpg" | "png" | "webp" | "avif";
export const MIME_BY_EXT: Record<ImageExt, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

/** Descobre o formato pelos primeiros bytes (não confia no nome nem no Content-Type enviado). */
export function sniffImage(bytes: Uint8Array): ImageExt | null {
  const b = bytes;
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return "png";
  const ascii = (from: number, len: number) => String.fromCharCode(...b.slice(from, from + len));
  if (b.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return "webp";
  if (b.length >= 12 && ascii(4, 4) === "ftyp" && (ascii(8, 4) === "avif" || ascii(8, 4) === "avis")) return "avif";
  return null;
}

/** Caminho novo e único (a troca nunca reaproveita a URL antiga → sem cache velho). */
export function buildImagePath(folder: string, name: string, ext: ImageExt, now = Date.now(), rand = Math.random()): string {
  const safe = name.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "img";
  const stamp = now.toString(36) + Math.floor(rand * 36 ** 3).toString(36).padStart(3, "0");
  return `${folder}/${safe}-${stamp}.${ext}`;
}
