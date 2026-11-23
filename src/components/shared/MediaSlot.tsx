import { MediaImage } from "./MediaImage";
import { MediaPlaceholder, type MediaRatio, type MediaShape } from "./MediaPlaceholder";

/**
 * Slot de imagem. Com `src` (URL pública do Supabase Storage, vinda do
 * image_path do banco) mostra a foto; sem `src`, o placeholder elegante.
 * Para cadastrar fotos: docs/CATALOGO-IMAGENS.md.
 */
export function MediaSlot({
  src,
  alt,
  caption,
  ratio = "4/5",
  shape = "soft",
  className = "",
  priority = false,
}: {
  src?: string;
  alt: string;
  caption?: string;
  ratio?: MediaRatio;
  shape?: MediaShape;
  className?: string;
  priority?: boolean;
}) {
  if (src) return <MediaImage src={src} alt={alt} caption={caption} ratio={ratio} shape={shape} className={className} priority={priority} />;
  return <MediaPlaceholder alt={alt} caption={caption} ratio={ratio} shape={shape} className={className} />;
}
