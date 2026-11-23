import { ImageIcon } from "lucide-react";

export type MediaShape = "soft" | "arch" | "circle";
export type MediaRatio = "4/5" | "1/1" | "16/10" | "3/4";

export const mediaShapes: Record<MediaShape, string> = {
  soft: "rounded-media",
  // Arco: motivo recorrente em marcas de beleza. Só faz sentido em retratos (3/4, 4/5).
  arch: "rounded-t-full rounded-b-media",
  circle: "rounded-full",
};

export const mediaAspects: Record<MediaRatio, string> = {
  "4/5": "aspect-[4/5]",
  "1/1": "aspect-square",
  "16/10": "aspect-[16/10]",
  "3/4": "aspect-[3/4]",
};

/**
 * Bloco tonal neutro exibido quando não há foto (ou ela não carregou).
 * Sem imagem genérica: nunca fingimos que é um resultado real do Studio.
 */
export function MediaPlaceholder({
  alt,
  caption,
  ratio,
  shape,
  className = "",
}: {
  alt: string;
  caption?: string;
  ratio: MediaRatio;
  shape: MediaShape;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative flex flex-col items-center justify-center gap-3 overflow-hidden bg-nude/80 text-taupe ring-1 ring-inset ring-sand/40 ${mediaShapes[shape]} ${mediaAspects[ratio]} ${className}`}
    >
      <ImageIcon size={26} strokeWidth={1.2} aria-hidden />
      {caption && <span className="px-6 text-center text-[0.68rem] font-medium uppercase tracking-[0.25em]">{caption}</span>}
    </div>
  );
}
