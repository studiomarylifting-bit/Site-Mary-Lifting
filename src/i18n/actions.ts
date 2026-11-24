"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, isLocale } from "./config";

/** Grava a preferência de idioma (cookie não sensível) e renderiza a página de novo. */
export async function setLocaleAction(value: string): Promise<{ ok: boolean }> {
  if (!isLocale(value)) return { ok: false };
  (await cookies()).set(LOCALE_COOKIE, value, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
