/**
 * Mostra o que está configurado, SEM imprimir nenhum valor secreto.
 * Uso: npm run check:env   (lê .env.local, se existir)
 */
import { existsSync, readFileSync } from "node:fs";

function loadDotEnv(file: string) {
  if (!existsSync(file)) return false;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!m || m[1] === undefined) continue;
    const value = (m[2] ?? "").replace(/^["']|["']$/g, "");
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
  return true;
}

const hasFile = loadDotEnv(".env.local");
const set = (k: string) => Boolean(process.env[k]?.trim());

const groups: { name: string; keys: string[]; without: string }[] = [
  {
    name: "Supabase (login, conta, admin)",
    keys: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    without: "login, cadastro, /conta e /admin não funcionam (redirecionam para /entrar)",
  },
  {
    name: "Supabase service role (SAC, feedback, rate limit)",
    keys: ["SUPABASE_SERVICE_ROLE_KEY"],
    without: "SAC e feedback recusam envios (falham fechados de propósito)",
  },
  {
    name: "Uazapi (aviso no WhatsApp do Studio)",
    keys: ["UAZAPI_BASE_URL", "UAZAPI_TOKEN", "UAZAPI_STUDIO_PHONE"],
    without: "nenhum aviso é enviado; o evento fica registrado como 'skipped'",
  },
  {
    name: "Google Places (avaliações)",
    keys: ["GOOGLE_PLACES_API_KEY", "GOOGLE_PLACE_ID"],
    without: "/avaliacoes mostra 'aguardando configuração'",
  },
];

console.log(hasFile ? "Lendo .env.local\n" : "Nenhum .env.local encontrado (tudo abaixo está sem configurar).\n");
for (const g of groups) {
  const missing = g.keys.filter((k) => !set(k));
  if (missing.length === 0) console.log(`OK        ${g.name}`);
  else console.log(`FALTA     ${g.name}\n          faltando: ${missing.join(", ")}\n          sem isso: ${g.without}`);
}
const phone = process.env.UAZAPI_STUDIO_PHONE;
if (phone && !/^55\d{10,11}$/.test(phone)) {
  console.log("\nATENÇÃO   UAZAPI_STUDIO_PHONE deve ser 55 + DDD + número, só dígitos (ex.: 5511999999999).");
}
if (!set("RATE_LIMIT_SALT")) {
  console.log("\nRECOMENDADO RATE_LIMIT_SALT vazio: o hash dos IPs fica sem sal. Defina uma string aleatória longa.");
}
console.log("\nO catálogo e as páginas públicas funcionam sem nenhuma variável.");
