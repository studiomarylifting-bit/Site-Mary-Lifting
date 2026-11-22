import Image from "next/image";
import { ImageIcon } from "lucide-react";

type Shape = "soft" | "arch" | "circle";

const shapes: Record<Shape, string> = {
  soft: "rounded-media",
  // Arco: motivo recorrente em marcas de beleza. Só faz sentido em retratos (3/4, 4/5).
  arch: "rounded-t-full rounded-b-media",
  circle: "rounded-full",
};

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
  shape = "soft",
  className = "",
  priority = false,
}: {
  src?: string;
  alt: string;
  caption?: string;
  ratio?: "4/5" | "1/1" | "16/10" | "3/4";
  shape?: Shape;
  className?: string;
  priority?: boolean;
}) {
  const aspect = { "4/5": "aspect-[4/5]", "1/1": "aspect-square", "16/10": "aspect-[16/10]", "3/4": "aspect-[3/4]" }[ratio];
  const radius = shapes[shape];
  if (src) {
    return (
      <div className={`relative overflow-hidden bg-nude ${radius} ${aspect} ${className}`}>
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 40vw, 90vw" priority={priority} className="object-cover" />
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative flex flex-col items-center justify-center gap-3 overflow-hidden bg-nude/80 text-taupe ring-1 ring-inset ring-sand/40 ${radius} ${aspect} ${className}`}
    >
      <ImageIcon size={26} strokeWidth={1.2} aria-hidden />
      {caption && <span className="px-6 text-center text-[0.68rem] font-medium uppercase tracking-[0.25em]">{caption}</span>}
    </div>
  );
}
