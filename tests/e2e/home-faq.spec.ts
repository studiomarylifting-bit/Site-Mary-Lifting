import { expect, test } from "@playwright/test";

test.describe("FAQ da home", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#duvidas");
  });

  test("mostra as 8 perguntas e começa com a primeira aberta", async ({ page }) => {
    const buttons = page.getByTestId("faq-list").getByRole("button");
    await expect(buttons).toHaveCount(8);
    await expect(buttons.first()).toHaveAttribute("aria-expanded", "true");
    await expect(buttons.nth(1)).toHaveAttribute("aria-expanded", "false");
  });

  test("abre e fecha ao clicar, atualizando aria-expanded", async ({ page }) => {
    const q = page.getByRole("button", { name: "Quais são as formas de pagamento?" });
    await q.scrollIntoViewIfNeeded();
    await q.click();
    await expect(q).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("region", { name: "Quais são as formas de pagamento?" })).toContainText("Pix");
    await q.click();
    await expect(q).toHaveAttribute("aria-expanded", "false");
  });

  test("painel fechado não recebe foco (inert) e o aberto é legível", async ({ page }) => {
    const closed = page.getByRole("button", { name: "Onde fica o Studio Mary Lifting?" });
    const panelId = await closed.getAttribute("aria-controls");
    await expect(page.locator(`#${panelId}`)).toHaveAttribute("inert", "");
    await closed.click();
    await expect(page.locator(`#${panelId}`)).not.toHaveAttribute("inert", "");
    await expect(page.locator(`#${panelId}`)).toContainText("Rua Tiradentes, 144");
  });

  test("navegação por teclado: setas, Home e End", async ({ page }) => {
    const buttons = page.getByTestId("faq-list").getByRole("button");
    await buttons.first().focus();
    await page.keyboard.press("ArrowDown");
    await expect(buttons.nth(1)).toBeFocused();
    await page.keyboard.press("End");
    await expect(buttons.nth(7)).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(buttons.first()).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(buttons.nth(7)).toBeFocused();
    await page.keyboard.press("Home");
    await expect(buttons.first()).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(buttons.first()).toHaveAttribute("aria-expanded", "false");
  });

  test("publica FAQPage em JSON-LD válido", async ({ page }) => {
    const json = await page.locator('script[type="application/ld+json"]').first().textContent();
    const data = JSON.parse(json ?? "{}");
    expect(data["@type"]).toBe("FAQPage");
    expect(data.mainEntity).toHaveLength(8);
  });

  test("link do FAQ leva ao SAC com o tipo pré-selecionado", async ({ page }) => {
    await page.getByRole("button", { name: "Como cuidar das extensões após o procedimento?" }).click();
    await page.getByRole("link", { name: "Dúvida pós-atendimento" }).click();
    await expect(page).toHaveURL(/\/sac\?tipo=pos_atendimento/);
  });
});

test.describe("sem rolagem horizontal", () => {
  for (const path of ["/", "/catalogo", "/catalogo/cilios", "/studio", "/sac", "/feedback/enviar", "/entrar", "/cadastro"]) {
    test(`${path} não estoura a largura da tela`, async ({ page }) => {
      await page.goto(path);
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth, `${path}: ${scrollWidth} > ${clientWidth}`).toBeLessThanOrEqual(clientWidth);
    });
  }

  test("menu mobile abre, expõe a navegação e fecha com Escape", async ({ page, isMobile }) => {
    test.skip(!isMobile, "apenas no projeto mobile");
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /menu/i });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#menu-mobile")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});
