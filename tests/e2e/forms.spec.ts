import { expect, test } from "@playwright/test";

const ORIGIN = { origin: "http://localhost:3000" };

test.describe("SAC", () => {
  test("mostra o formulário completo e valida campos vazios no cliente", async ({ page }) => {
    await page.goto("/sac");
    for (const label of ["Nome", "E-mail", "Celular com DDD", "Tipo de solicitação", "Assunto", "Mensagem"]) {
      await expect(page.getByLabel(label).first()).toBeVisible();
    }
    await page.getByRole("button", { name: /enviar/i }).click();
    await expect(page.getByText("Informe seu nome")).toBeVisible();
  });

  test("API recusa requisição sem Origin (CSRF)", async ({ request }) => {
    const res = await request.post("/api/sac", { data: { name: "x" } });
    expect(res.status()).toBe(403);
  });

  test("API recusa corpo inválido (422) sem vazar detalhes internos", async ({ request }) => {
    const res = await request.post("/api/sac", { headers: ORIGIN, data: { name: "x" } });
    expect(res.status()).toBe(422);
    const body = await res.text();
    expect(body).not.toMatch(/stack|at .*\(.*:\d+:\d+\)|SUPABASE|service_role/i);
  });

  test("honeypot preenchido recebe sucesso silencioso, sem protocolo real", async ({ request }) => {
    const res = await request.post("/api/sac", {
      headers: ORIGIN,
      data: {
        name: "Bot Teste", email: "bot@example.com", phone: "11999999999",
        subject: "Teste", type: "duvida", message: "Mensagem de teste longa.",
        contactConsent: true, website: "http://spam.example",
      },
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).protocol).toBe("SAC-PENDENTE");
  });
});

test.describe("feedback", () => {
  test("formulário exibe nota, comentário e opção de anonimização", async ({ page }) => {
    await page.goto("/feedback/enviar");
    await expect(page.getByRole("radiogroup", { name: "Nota de 1 a 5" })).toBeVisible();
    await expect(page.getByLabel("Seu comentário")).toBeVisible();
    await expect(page.getByLabel(/anônima/)).toBeVisible();
    await expect(page.getByLabel(/Autorizo a publicação/)).not.toBeChecked();
  });

  test("página pública de feedback carrega sem exigir login", async ({ page }) => {
    const res = await page.goto("/feedback");
    expect(res?.status()).toBe(200);
  });

  test("API de feedback recusa corpo inválido", async ({ request }) => {
    const res = await request.post("/api/feedback", { headers: ORIGIN, data: { rating: 9 } });
    expect(res.status()).toBe(422);
  });
});

test.describe("ficha de anamnese", () => {
  test("API da ficha não aceita visitante", async ({ request }) => {
    const res = await request.post("/api/intake", { headers: ORIGIN, data: {} });
    expect(res.status()).toBe(401);
  });
});
