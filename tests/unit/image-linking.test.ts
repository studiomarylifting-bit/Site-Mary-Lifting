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
  it("aceita o texto colado do painel do Supabase (com 'actions' e nomes com espaço)", () => {
    const raw = "6D.jpg\n6D.jpg actions\nBrow lamination.jpg\nBrow lamination.jpg actions\n";
    expect(parseFileList(raw).files).toEqual(["servicos/6D.jpg", "servicos/Brow lamination.jpg"]);
  });
  it("ignora pasta vazia e placeholder e remove duplicatas", () => {
    const { files } = parseFileList("servicos/\nservicos/.emptyFolderPlaceholder\nservicos/a.webp\nservicos/a.webp\nhome/x.webp");
    expect(files).toEqual(["servicos/a.webp"]);
  });
});

describe("matchImages", () => {
  it("vincula slug idêntico", () => {
    const r = matchImages(["servicos/mega-volume.webp"], svc);
    expect(r.links).toEqual([{ slug: "mega-volume", imagePath: "servicos/mega-volume.webp", kind: "slug idêntico" }]);
  });

  it("vincula nome equivalente (maiúsculas, espaços, sem acento) mantendo o caminho EXATO do arquivo", () => {
    const r = matchImages(["servicos/Volume egipcio no castanho.jpg", "servicos/Remocao de extensao.JPG"], svc);
    expect(r.links).toEqual([
      { slug: "volume-egipcio-no-castanho", imagePath: "servicos/Volume egipcio no castanho.jpg", kind: "nome equivalente" },
      { slug: "remocao-de-extensao", imagePath: "servicos/Remocao de extensao.JPG", kind: "nome equivalente" },
    ]);
  });

  it("NÃO presume: a foto do 'no castanho' não vai para o serviço base", () => {
    const r = matchImages(["servicos/Volume egipcio no castanho.jpg"], svc);
    expect(r.links.map((l) => l.slug)).toEqual(["volume-egipcio-no-castanho"]);
    expect(r.servicesWithoutImage).toContain("volume-egipcio");
  });

  it("nome parcial vira sugestão e NÃO entra nos vínculos", () => {
    const r = matchImages(["servicos/6D.jpg", "servicos/megavolume.webp"], [...svc, { slug: "6d-volume-glamour", name: "6D Volume Glamour" }]);
    expect(r.links).toEqual([]);
    expect(r.unmatchedFiles).toEqual(["servicos/6D.jpg", "servicos/megavolume.webp"]);
    expect(r.suggestions).toEqual([{ file: "servicos/6D.jpg", slug: "6d-volume-glamour", reason: "nome parcial (parte do nome do serviço)" }]);
  });

  it("confirmação explícita vincula, marcada como confirmada", () => {
    const refs = [...svc, { slug: "6d-volume-glamour", name: "6D Volume Glamour" }];
    const r = matchImages(["servicos/6D.jpg"], refs, [], { "6D.jpg": "6d-volume-glamour" });
    expect(r.links).toEqual([{ slug: "6d-volume-glamour", imagePath: "servicos/6D.jpg", kind: "indicado manualmente - CONFIRA" }]);
  });

  it("confirmação para slug inexistente não vincula nada", () => {
    const r = matchImages(["servicos/6D.jpg"], svc, [], { "6D.jpg": "nao-existe" });
    expect(r.links).toEqual([]);
    expect(r.unmatchedFiles).toEqual(["servicos/6D.jpg"]);
  });

  it("separa nomes que o banco recusaria", () => {
    const r = matchImages(["servicos/mega-volume.gif", "servicos/Vídeo.webp", "servicos/mega;volume.webp"], svc);
    expect(r.links).toEqual([]);
    expect(r.invalidFiles).toHaveLength(3);
  });

  it("dois arquivos do mesmo serviço = conflito, sem vínculo", () => {
    const r = matchImages(["servicos/Mega volume.jpg", "servicos/mega-volume.webp"], svc);
    expect(r.links).toEqual([]);
    expect(r.conflicts).toEqual([{ slug: "mega-volume", files: ["servicos/Mega volume.jpg", "servicos/mega-volume.webp"] }]);
  });

  it("serviço sem arquivo continua sem imagem", () => {
    expect(matchImages([], svc).servicesWithoutImage).toHaveLength(4);
  });
});

describe("normalize", () => {
  it("tira acento, caixa e separadores", () => {
    expect(normalize("Volume_Egípcio  no Castanho!")).toBe("volume-egipcio-no-castanho");
  });
});

describe("SQL gerado", () => {
  const links = [{ slug: "mega-volume", imagePath: "servicos/mega-volume.webp", kind: "slug idêntico" as const }];
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
    expect(buildLinkSql([{ slug: "a'b", imagePath: "servicos/a.webp", kind: "slug idêntico" }])).toContain("'a''b'");
  });
  it("verificação é somente leitura e embute as contagens", () => {
    const sql = buildVerifySql(links, 23);
    expect(sql).toContain("= 22");
    for (const proibido of ["update ", "insert ", "delete ", "drop ", "alter ", "truncate"]) {
      expect(sql.toLowerCase()).not.toContain(proibido);
    }
  });
});
