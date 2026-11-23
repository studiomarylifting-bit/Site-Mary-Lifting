"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MediaPlaceholder, mediaAspects, mediaShapes, type MediaRatio, type MediaShape } from "./MediaPlaceholder";

/**
 * Foto do Supabase Storage. Se o arquivo não existir ou falhar ao carregar
 * (ex.: image_path preenchido antes do upload), troca pelo placeholder em vez
 * de mostrar uma imagem quebrada.
 */
/** Só em desenvolvimento: avisa no console qual URL falhou (em vez de sumir em silêncio). */
function reportFailure(src: string) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[MediaImage] não carregou, mostrando o placeholder: ${src}`);
  }
}

export function MediaImage({
  src,
  alt,
  caption,
  ratio,
  shape,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  ratio: MediaRatio;
  shape: MediaShape;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // Se a imagem falhou antes da hidratação, o evento onError já passou: confere aqui.
  // `currentSrc` vazio = carregamento (lazy) ainda não começou; não é falha.
  useEffect(() => {
    const img = box.current?.querySelector("img");
    if (img && img.currentSrc && img.complete && img.naturalWidth === 0) {
      reportFailure(src);
      setFailed(true);
    }
  }, [src]);

  if (failed) return <MediaPlaceholder alt={alt} caption={caption} ratio={ratio} shape={shape} className={className} />;
  return (
    <div ref={box} className={`relative overflow-hidden bg-nude ${mediaShapes[shape]} ${mediaAspects[ratio]} ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 40vw, 90vw"
        priority={priority}
        className="object-cover"
        onError={() => {
          reportFailure(src);
          setFailed(true);
        }}
      />
    </div>
  );
}
