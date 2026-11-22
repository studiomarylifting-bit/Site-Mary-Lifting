import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/conta", "/api", "/auth", "/entrar", "/cadastro", "/recuperar-senha", "/redefinir-senha"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
