import Image from "next/image";
import { ImageIcon } from "lucide-react";

/**
 * Slot de imagem substituível. Sem `src`, exibe um bloco tonal neutro: NÃO usamos
 * fotos genéricas fingindo serem resultados reais do Studio.
 * Para trocar: coloque o arquivo em public/images/... e informe em
 * src/features/catalog/media.ts (ver public/images/README.md).
 */
export function MediaSlot({
  src,
  alt,
  caption,
  ratio = "4/5",
  className = "",
  priority = false,
}: {
  src?: string;
  alt: string;
  caption?: string;
  ratio?: "4/5" | "1/1" | "16/10" | "3/4";
  className?: string;
  priority?: boolean;
}) {
  const aspect = { "4/5": "aspect-[4/5]", "1/1": "aspect-square", "16/10": "aspect-[16/10]", "3/4": "aspect-[3/4]" }[ratio];
  if (src) {
    return (
      <div className={`relative overflow-hidden bg-nude ${aspect} ${className}`}>
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 40vw, 90vw" priority={priority} className="object-cover" />
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative flex flex-col items-center justify-center gap-3 overflow-hidden bg-gradient-to-br from-nude to-sand/60 text-cocoa/60 ${aspect} ${className}`}
    >
      <ImageIcon size={28} strokeWidth={1.2} aria-hidden />
      {caption && <span className="px-6 text-center text-[0.7rem] uppercase tracking-[0.25em]">{caption}</span>}
    </div>
  );
}
