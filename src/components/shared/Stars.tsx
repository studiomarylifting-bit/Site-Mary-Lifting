"use client";

import { Star } from "lucide-react";
import { useT } from "@/i18n/client";

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const t = useT();
  const rounded = Math.round(value);
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={t("app.stars", { value })}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          aria-hidden
          className={n <= rounded ? "fill-rose-deep text-rose-deep" : "text-sand"}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}
