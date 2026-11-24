import { describe, expect, it } from "vitest";
import { MAX_UPLOAD_BYTES, SITE_IMAGE_SLOTS, buildImagePath, getSlot, sniffImage } from "@/features/site-images/slots";
import { isValidImagePath, publicImageUrl } from "@/features/catalog/storage";
import { dictionary } from "@/i18n/messages";
import { createT } from "@/i18n/translate";

const bytes = (...n: number[]) => new Uint8Array([...n, ...new Array(16).fill(0)]);
const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));

describe("site-images: formato real pelos bytes", () => {
  it("reconhece JPG, PNG, WebP e AVIF", () => {
    expect(sniffImage(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("jpg");
    expect(sniffImage(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe("png");
    expect(sniffImage(bytes(...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WEBP")))).toBe("webp");
    expect(sniffImage(bytes(0, 0, 0, 0x20, ...ascii("ftypavif")))).toBe("avif");
  });
  it("recusa SVG, HTML, executável e arquivo vazio mesmo com extensão de imagem", () => {
    expect(sniffImage(new Uint8Array(ascii("<svg xmlns='http://www.w3.org/2000/svg'/>")))).toBeNull();
    expect(sniffImage(new Uint8Array(ascii("<html><script>alert(1)</script>")))).toBeNull();
    expect(sniffImage(bytes(0x4d, 0x5a, 0x90, 0x00))).toBeNull();
    expect(sniffImage(new Uint8Array())).toBeNull();
  });
  it("limite de envio é menor que o do bucket (5 MB)", () => {
    expect(MAX_UPLOAD_BYTES < 5 * 1024 * 1024).toBe(true);
  });
});

describe("site-images: caminhos", () => {
  it("o caminho gerado passa na validação do bucket e vira URL pública", () => {
    for (const slot of SITE_IMAGE_SLOTS) {
      const p = buildImagePath(slot.folder, slot.key, "png");
      expect(isValidImagePath(p), p).toBe(true);
      expect(p.startsWith(`${slot.folder}/`)).toBe(true);
      expect((publicImageUrl(p, "https://abc.supabase.co") ?? "").includes("/storage/v1/object/public/site-media/")).toBe(true);
    }
  });
  it("nome hostil é saneado e caminhos distintos não colidem", () => {
    const evil = buildImagePath("brand", "../../Etc/Passwd?x", "jpg", 1, 0.1);
    expect(/^brand\/[a-z0-9-]+-[a-z0-9]+\.jpg$/.test(evil)).toBe(true);
    expect(evil.includes("..")).toBe(false);
    expect(buildImagePath("home", "a", "png", 1, 0.1)).not.toBe(buildImagePath("home", "a", "png", 2, 0.1));
  });
  it("o banco aceita as pastas brand e home, e a validação do app recusa outras", () => {
    expect(isValidImagePath("brand/logo-abc.png")).toBe(true);
    expect(isValidImagePath("segredos/x.png")).toBe(false);
    expect(isValidImagePath("brand/../x.png")).toBe(false);
  });
});

describe("site-images: slots", () => {
  it("só aceita slots conhecidos", () => {
    expect(getSlot("logoLight")?.folder).toBe("brand");
    expect(getSlot("heroPhoto")?.folder).toBe("home");
    expect(getSlot("../etc")).toBeUndefined();
    expect(getSlot(undefined)).toBeUndefined();
  });
  it("todo slot tem nome e dica nos 4 idiomas", () => {
    for (const loc of ["pt", "en", "es", "it"] as const) {
      const t = createT(dictionary[loc] as never, dictionary.pt as never);
      for (const s of SITE_IMAGE_SLOTS) {
        expect(t(`admin.images.slots.${s.key}.label`).includes("admin.images")).toBe(false);
        expect(t(`admin.images.slots.${s.key}.hint`).includes("admin.images")).toBe(false);
      }
    }
  });
});
