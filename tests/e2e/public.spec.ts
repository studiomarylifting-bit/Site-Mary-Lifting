import { expect, test } from "@playwright/test";

// Estes testes não dependem de secrets: validam páginas públicas e a
// degradação segura quando Supabase/Google/Uazapi não estão configurados.

test.describe("home e navegação", () => {
  test("home exibe a identidade e leva ao catálogo", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Beleza que respeita");
    await page.getByRole("link", { name: "Ver catálogo" }).first().click();
    await expect(page).toHaveURL(/\/catalogo$/);
  });

  test("páginas públicas principais respondem e têm h1", async ({ page }) => {
    for (const path of ["/catalogo", "/studio", "/pagamentos", "/avaliacoes", "/feedback", "/sac", "/privacidade", "/termos", "/quem-sou"]) {
      const res = await page.goto(path);
      expect(res?.status(), path).toBe(200);
      await expect(page.getByRole("heading", { level: 1 }).first(), path).toBeVisible();
    }
  });

  test("rota inexistente mostra 404 amigável", async ({ page }) => {
    const res = await page.goto("/nao-existe-xyz");
    expect(res?.status()).toBe(404);
  });
});

test.describe("catálogo", () => {
  test("categoria de cílios lista serviços e abre o detalhe com preço", async ({ page }) => {
    await page.goto("/catalogo/cilios");
    await expect(page.getByText("Volume brasileiro", { exact: true }).first()).toBeVisible();
    await page.getByRole("link", { name: /6D Volume Glamour/ }).first().click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("6D Volume Glamour");
    await expect(page.getByText(/170,00/)).toBeVisible();
    await expect(page.getByText(/130,00/)).toBeVisible();
  });

  test("categoria inexistente retorna 404", async ({ page }) => {
    const res = await page.goto("/catalogo/inexistente");
    expect(res?.status()).toBe(404);
  });
});

test.describe("avaliações do Google sem configuração", () => {
  test("não exibe dados falsos e indica aguardando configuração", async ({ page }) => {
    // Só é determinístico quando GOOGLE_PLACES_API_KEY/GOOGLE_PLACE_ID não estão definidos.
    test.skip(Boolean(process.env.GOOGLE_PLACES_API_KEY), "chave real configurada");
    await page.goto("/avaliacoes");
    await expect(page.getByRole("heading", { name: "Avaliações do Google" })).toBeVisible();
    await expect(page.getByText(/configura/i).first()).toBeVisible();
  });
});

test.describe("cabeçalhos de segurança", () => {
  test("envia CSP, nosniff e frame-ancestors", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-powered-by"]).toBeUndefined();
  });
});
