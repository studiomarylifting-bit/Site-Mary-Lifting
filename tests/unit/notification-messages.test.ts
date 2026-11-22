import { describe, expect, it } from "vitest";
import { buildNotificationText, type NotificationKind } from "@/server/integrations/uazapi/messages";

const kinds: NotificationKind[] = [
  "sac_new",
  "intake_submitted",
  "feedback_new",
  "privacy_request_new",
];

describe("mensagens administrativas (minimização de dados)", () => {
  const ctx = { adminUrl: "https://studio.example", protocol: "SAC-2026-000001", typeLabel: "Dúvida" };

  it("sempre aponta para o painel e começa com a marca", () => {
    for (const k of kinds) {
      const t = buildNotificationText(k, ctx);
      expect(t.startsWith("Mary Lifting")).toBe(true);
      expect(t).toContain("https://studio.example/admin");
    }
  });

  it("SAC inclui apenas protocolo e tipo", () => {
    const t = buildNotificationText("sac_new", ctx);
    expect(t).toContain("SAC-2026-000001");
    expect(t).toContain("Dúvida");
  });

  it("ficha não carrega nenhum dado além do aviso", () => {
    const t = buildNotificationText("intake_submitted", {
      ...ctx,
      // mesmo que um chamador passe dados indevidos, o template os ignora
      ...({ allergies: "látex", email: "a@b.com", phone: "5511999999999" } as object),
    });
    for (const forbidden of ["látex", "a@b.com", "5511999999999", "alerg", "saúde"]) {
      expect(t.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
    expect(t.split("\n")).toHaveLength(2);
  });
});
