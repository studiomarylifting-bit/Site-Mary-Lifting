import { describe, expect, it } from "vitest";
import { buildLinkSql, buildVerifySql, matchImages, normalize, parseFileList } from "@/features/catalog/image-linking";

const svc = [
  { slug: "mega-volume", name: "Mega volume" },
  { slug: "volume-egipcio", name: "Volume egípcio" },
  { slug: "volume-egipcio-no-castanho", name: "Volume egípcio no castanho" },
  { slug: "remocao-de-extensao", name: "Remoção de extensão" },
];

describe("parseFileList", () => {
  it("aceita nomes soltos, com pasta, aspas, vírgulas e saída do SQL Editor", () => {
    const raw = ` name\n-----------------------\n servicos/mega-volume.webp \n"volume-egipcio.jpg",\n(2 rows)\n`;
    const { files, ignored } = parseFileList(raw);
    expect(files).toEqual(["servicos/mega-volume.webp", "servicos/volume-egipcio.jpg"]);
    expect(ignored).toHaveLength(3);
  });
  it("ignora pasta vazia e placeholder e remove duplicatas", () => {
    const { files } = parseFileList("servicos/\nservicos/.emptyFolderPlaceholder\nservicos/a.webp\nservicos/a.webp\nhome/x.webp");
    expect(files).toEqual(["servicos/a.webp"]);
  });
});

describe("matchImages (correspondência exata)", () => {
  it("vincula só quando o nome sem extensão é idêntico ao slug", () => {
    const r = matchImages(["servicos/mega-volume.webp", "servicos/volume-egipcio.jpg"], svc);
    expect(r.links).toEqual([
      { slug: "mega-volume", imagePath: "servicos/mega-volume.webp" },
      { slug: "volume-egipcio", imagePath: "servicos/volume-egipcio.jpg" },
    ]);
    expect(r.servicesWithoutImage).toEqual(["volume-egipcio-no-castanho", "remocao-de-extensao"]);
  });

  it("NÃO presume: nome parecido vira sugestão e não entra nos vínculos", () => {
    const r = matchImages(["servicos/Volume_Egipcio.webp", "servicos/megavolume.webp"], svc);
    expect(r.links).toEqual([]);
    expect(r.suggestions.map((s) => s.slug)).toContain("volume-egipcio");
    expect(r.unmatchedFiles).toHaveLength(2);
    // prefixo não é igualdade: volume-egipcio não leva a foto do "no castanho"
    const r2 = matchImages(["servicos/volume-egipcio-castanho.webp"], svc);
    expect(r2.links).toEqual([]);
  });

  it("separa nomes que o banco recusaria", () => {
    const r = matchImages(["servicos/mega volume.webp", "servicos/mega-volume.gif", "servicos/Vídeo.webp"], svc);
    expect(r.links).toEqual([]);
    expect(r.invalidFiles).toHaveLength(3);
  });

  it("dois formatos do mesmo serviço = conflito, sem vínculo", () => {
    const r = matchImages(["servicos/mega-volume.jpg", "servicos/mega-volume.webp"], svc);
    expect(r.links).toEqual([]);
    expect(r.conflicts).toEqual([{ slug: "mega-volume", files: ["servicos/mega-volume.jpg", "servicos/mega-volume.webp"] }]);
  });

  it("serviço sem arquivo continua sem imagem", () => {
    const r = matchImages([], svc);
    expect(r.servicesWithoutImage).toHaveLength(4);
  });
});

describe("normalize", () => {
  it("tira acento, caixa e separadores", () => {
    expect(normalize("Volume_Egípcio  no Castanho!")).toBe("volume-egipcio-no-castanho");
  });
});

describe("SQL gerado", () => {
  const links = [{ slug: "mega-volume", imagePath: "servicos/mega-volume.webp" }];
  it("só toca image_path, é transacional e idempotente", () => {
    const sql = buildLinkSql(links);
    expect(sql).toContain("begin;");
    expect(sql).toContain("commit;");
    expect(sql).toContain("set image_path = v.path");
    expect(sql).toContain("s.image_path is distinct from v.path");
    for (const proibido of ["price", "name =", "description", "position", "active", "category_slug", "delete", "drop ", "truncate"]) {
      expect(sql.toLowerCase()).not.toContain(proibido);
    }
  });
  it("escapa aspas", () => {
    expect(buildLinkSql([{ slug: "a'b", imagePath: "servicos/a.webp" }])).toContain("'a''b'");
  });
  it("verificação é somente leitura e embute as contagens", () => {
    const sql = buildVerifySql(links, 23);
    expect(sql).toContain("= 22");
    for (const proibido of ["update ", "insert ", "delete ", "drop ", "alter ", "truncate"]) {
      expect(sql.toLowerCase()).not.toContain(proibido);
    }
  });
});
