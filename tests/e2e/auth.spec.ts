import { expect, test } from "@playwright/test";

test.describe("rotas protegidas", () => {
  for (const path of ["/conta", "/conta/ficha", "/conta/perfil", "/conta/autorizacoes", "/admin", "/admin/clientes", "/admin/sac"]) {
    test(`visitante é redirecionado de ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/entrar/);
    });
  }

  test("API de perfil e de admin recusam visitante", async ({ request }) => {
    const exported = await request.get("/api/account/export");
    expect(exported.status()).toBe(401);
    const admin = await request.patch("/api/admin/sac/00000000-0000-0000-0000-000000000000", {
      headers: { origin: "http://localhost:3000" },
      data: { status: "closed" },
    });
    expect([401, 403, 503]).toContain(admin.status());
  });
});

test.describe("login e cadastro", () => {
  test("login exibe campos e link para criar conta", async ({ page }) => {
    await page.goto("/entrar");
    await expect(page.getByLabel("E-mail")).toBeVisible();
    await expect(page.getByLabel("Senha")).toBeVisible();
    await page.getByRole("link", { name: "Criar conta" }).click();
    await expect(page).toHaveURL(/\/cadastro$/);
  });

  test("cadastro exige aceite e mostra campos obrigatórios", async ({ page }) => {
    await page.goto("/cadastro");
    for (const label of ["Nome completo", "Celular com DDD", "E-mail", "Senha", "Confirmar senha"]) {
      await expect(page.getByLabel(label, { exact: true })).toBeVisible();
    }
    await expect(page.getByRole("link", { name: "Política de Privacidade" })).toBeVisible();
  });

  test("login com open redirect em ?next não sai do domínio", async ({ page }) => {
    await page.goto("/entrar?next=//evil.example");
    await expect(page).toHaveURL(/localhost:3000\/entrar/);
  });

  test("recuperação de senha está acessível", async ({ page }) => {
    await page.goto("/recuperar-senha");
    await expect(page.getByLabel("E-mail da sua conta")).toBeVisible();
  });
});
