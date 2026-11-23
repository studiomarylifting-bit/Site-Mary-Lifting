"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MediaPlaceholder, mediaAspects, mediaShapes, type MediaRatio, type MediaShape } from "./MediaPlaceholder";

/**
 * Foto do Supabase Storage. Se o arquivo não existir ou falhar ao carregar
 * (ex.: image_path preenchido antes do upload), troca pelo placeholder em vez
 * de mostrar uma imagem quebrada.
 */
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
  useEffect(() => {
    const img = box.current?.querySelector("img");
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
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
        onError={() => setFailed(true)}
      />
    </div>
  );
}
