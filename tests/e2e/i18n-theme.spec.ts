import { expect, test } from "@playwright/test";

test.describe("idioma", () => {
  test("troca para inglês, espanhol e italiano e lembra a escolha", async ({ page }) => {
    await page.goto("/");
    const expectations: [string, RegExp, string][] = [
      ["en", /View catalog/i, "en"],
      ["es", /Ver catálogo/i, "es"],
      ["it", /Vedi il catalogo/i, "it"],
      ["pt", /Ver catálogo/i, "pt-BR"],
    ];
    for (const [value, text, lang] of expectations) {
      // O seletor existe no cabeçalho (desktop) ou dentro do menu (celular).
      const menu = page.getByRole("button", { name: /abrir menu|open menu|abrir menú|apri il menu|fechar menu|close menu/i });
      if (await menu.isVisible()) await menu.click();
      await page.getByRole("button", { name: /idioma|language|lingua/i }).first().click();
      await page.getByRole("menuitem", { name: new RegExp(`^${{ pt: "Português", en: "English", es: "Español", it: "Italiano" }[value]}`) }).click();
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.getByRole("link", { name: text }).first()).toBeVisible();
    }
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  });

  test("Accept-Language define o idioma da primeira visita", async ({ browser }) => {
    const ctx = await browser.newContext({ locale: "it-IT", extraHTTPHeaders: { "Accept-Language": "it-IT,it;q=0.9" } });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "it");
    await ctx.close();
  });

  test("páginas internas e catálogo respondem ao idioma", async ({ page, context }) => {
    await context.addCookies([{ name: "ml-locale", value: "en", url: "http://localhost:3000" }]);
    for (const path of ["/catalogo", "/studio", "/pagamentos", "/sac", "/entrar", "/feedback", "/privacidade"]) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
    }
    await page.goto("/catalogo/sobrancelhas/brow-lamination");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Brow lamination");
    await expect(page.getByText(/Technique to align the hairs/i)).toBeVisible();
  });
});

test.describe("marca", () => {
  test("logo ao lado do nome troca com o tema e o favicon tem versão clara e escura", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await expect(page.locator("header .brand-light")).toBeVisible();
    await expect(page.locator("header .brand-dark")).toBeHidden();
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("header .brand-dark")).toBeVisible();
    await expect(page.locator("header .brand-light")).toBeHidden();
    await expect(page.locator('link[rel="icon"][media*="dark"]')).toHaveAttribute("href", /icon-dark\.png/);
  });

  test("bandeiras no seletor de idioma", async ({ page }) => {
    await page.goto("/");
    const menu = page.getByRole("button", { name: /abrir menu/i });
    if (await menu.isVisible()) await menu.click();
    await page.getByRole("button", { name: /idioma/i }).first().click();
    await expect(page.getByRole("menuitem")).toHaveCount(3); // só as outras bandeiras
    await expect(page.getByRole("menuitem").first().locator("svg")).toBeVisible();
  });
});

test.describe("tema", () => {
  test("alterna e persiste claro/escuro e aplica em páginas internas", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const light = await bg();
    const toggle = page.getByRole("button", { name: /tema|theme|tema|tema/i }).first();
    await toggle.click(); // automático -> claro
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await toggle.click(); // claro -> escuro
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await bg()).not.toBe(light);
    await page.goto("/catalogo");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.goto("/entrar");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("sem escolha, segue o tema do sistema", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    const rgb = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(rgb).toBe("rgb(22, 16, 13)");
  });
});

test.describe("menu móvel", () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test("abre cobrindo a tela, navega, fecha com Esc e não gera rolagem horizontal", async ({ page }) => {
    await page.goto("/");
    const open = page.getByRole("button", { name: /abrir menu/i });
    await expect(open).toBeVisible();
    await open.click();
    const panel = page.locator("#menu-mobile");
    await expect(panel).toBeVisible();
    const box = await panel.boundingBox();
    expect(box!.height).toBeGreaterThan(500); // regressão: o desfoque do header encolhia o painel fixo
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await open.click();
    await panel.getByRole("link", { name: /catálogo/i }).click();
    await expect(page).toHaveURL(/\/catalogo$/);
    await expect(panel).toBeHidden();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  });

  for (const lang of ["en", "es", "it"]) {
    test(`sem rolagem horizontal em 360px (${lang})`, async ({ page, context }) => {
      await context.addCookies([{ name: "ml-locale", value: lang, url: "http://localhost:3000" }]);
      for (const path of ["/", "/catalogo", "/catalogo/cilios", "/sac", "/entrar", "/cadastro", "/feedback"]) {
        await page.goto(path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
        expect(overflow, `${path} (${lang})`).toBe(false);
      }
    });
  }
});
