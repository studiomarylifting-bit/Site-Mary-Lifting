import { expect, test } from "@playwright/test";

// Precisam de um admin real e do Supabase configurado (migration 20261124000001 aplicada):
//   E2E_ADMIN_EMAIL=... E2E_ADMIN_PASSWORD=... npm run test:e2e
const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

test.describe("ambiente separado e imagens do admin", () => {
  test("visitante não entra em /admin nem em /admin/imagens", async ({ page }) => {
    for (const path of ["/admin", "/admin/imagens"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/entrar/);
    }
  });

  test.describe("com admin", () => {
    test.skip(!email || !password, "defina E2E_ADMIN_EMAIL e E2E_ADMIN_PASSWORD");

    test("admin cai em /admin, não vê /conta e abre a tela de imagens", async ({ page }) => {
      await page.goto("/entrar");
      await page.getByLabel(/e-mail/i).fill(email!);
      await page.getByLabel(/senha/i).fill(password!);
      await page.getByRole("button", { name: /entrar/i }).click();
      await expect(page).toHaveURL(/\/admin$/);
      await page.goto("/conta");
      await expect(page).toHaveURL(/\/admin$/);
      await page.getByRole("link", { name: /^imagens$/i }).click();
      await expect(page.getByRole("heading", { level: 1, name: /imagens do site/i })).toBeVisible();
      await expect(page.getByText(/Logo do menu — tema claro/)).toBeVisible();
      await expect(page.getByText(/Favicon — navegador escuro/)).toBeVisible();
    });
  });
});
