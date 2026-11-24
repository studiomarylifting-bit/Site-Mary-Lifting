import type { Locale } from "@/i18n/config";
import type { Catalog } from "./catalog-core";

/**
 * Traduções dos textos do catálogo (nome e descrição), por slug. O banco continua sendo a
 * fonte da verdade em português; aqui ficam só as versões para en/es/it.
 *
 * Regra de segurança: uma tradução só é aplicada se o texto atual do serviço ainda for o
 * texto original em português deste arquivo. Se o admin editar o nome/descrição no banco,
 * o texto editado aparece como está (nunca sobrescrevemos edição humana por tradução antiga).
 *
 * São traduções feitas por IA a partir do texto do Studio: peça a uma pessoa fluente para revisar.
 * Nomes de técnica/marca (Fox Easy, Kim Kardashian, Hidra Gloss Color...) não são traduzidos.
 */
type Pair = readonly [name: string, description: string];
type Lang = Exclude<Locale, "pt">;

const services: Record<string, { pt: Pair } & Record<Lang, Pair>> = {
  "6d-volume-glamour": { pt: ["6D Volume Glamour", "Volume leve e marcante."], en: ["6D Volume Glamour", "Light, striking volume."], es: ["6D Volume Glamour", "Volumen ligero y llamativo."], it: ["6D Volume Glamour", "Volume leggero e deciso."] },
  "efeito-rimel-jade-picon": { pt: ["Efeito rímel Jade Picon", "Técnica leve, com efeito natural e marcante. Veja também a opção no castanho."], en: ["Jade Picon mascara effect", "Light technique with a natural yet striking effect. See also the brown option."], es: ["Efecto rímel Jade Picon", "Técnica ligera, con efecto natural y llamativo. Mira también la opción en castaño."], it: ["Effetto mascara Jade Picon", "Tecnica leggera, con effetto naturale e deciso. Scopri anche l'opzione castana."] },
  "fio-a-fio-classico": { pt: ["Fio a fio clássico", "Método natural e discreto, disponível em preto e castanho."], en: ["Classic lash-by-lash", "Natural, discreet method, available in black and brown."], es: ["Pelo a pelo clásico", "Método natural y discreto, disponible en negro y castaño."], it: ["Ciglia classiche una a una", "Metodo naturale e discreto, disponibile in nero e castano."] },
  "fox-easy": { pt: ["Fox Easy", "Efeito delineado natural, com proposta de olhar de raposa."], en: ["Fox Easy", "Natural eyeliner effect, with a fox-eye look."], es: ["Fox Easy", "Efecto delineado natural, con propuesta de mirada de zorro."], it: ["Fox Easy", "Effetto eyeliner naturale, con sguardo da volpe."] },
  "jade-picon-no-castanho": { pt: ["Jade Picon no castanho", "Efeito rímel Jade Picon com fios castanhos."], en: ["Jade Picon in brown", "Jade Picon mascara effect with brown lashes."], es: ["Jade Picon en castaño", "Efecto rímel Jade Picon con pestañas castañas."], it: ["Jade Picon castano", "Effetto mascara Jade Picon con ciglia castane."] },
  "kim-kardashian": { pt: ["Kim Kardashian", "Efeito marcante para quem busca destacar o olhar."], en: ["Kim Kardashian", "Striking effect for those who want to make their eyes stand out."], es: ["Kim Kardashian", "Efecto llamativo para quien busca destacar la mirada."], it: ["Kim Kardashian", "Effetto deciso per chi vuole mettere in risalto lo sguardo."] },
  "mega-brasileiro": { pt: ["Mega brasileiro", "Efeito mega 2D duplo para quem busca mais preenchimento."], en: ["Mega Brazilian", "Double 2D mega effect for those who want more fullness."], es: ["Mega brasileño", "Efecto mega 2D doble para quien busca más relleno."], it: ["Mega brasiliano", "Effetto mega 2D doppio per chi cerca più pienezza."] },
  "mega-volume": { pt: ["Mega volume", "Fios bem preenchidos para um olhar ousado."], en: ["Mega volume", "Well-filled lashes for a bold look."], es: ["Mega volumen", "Pestañas bien rellenas para una mirada atrevida."], it: ["Mega volume", "Ciglia ben piene per uno sguardo audace."] },
  "remocao-de-extensao": { pt: ["Remoção de extensão", "Remoção da extensão com produto e técnica apropriados. Não remova os fios em casa."], en: ["Extension removal", "Extension removal with the appropriate product and technique. Do not remove the lashes at home."], es: ["Retiro de extensiones", "Retiro de las extensiones con producto y técnica adecuados. No retires las pestañas en casa."], it: ["Rimozione extension", "Rimozione delle extension con prodotto e tecnica adeguati. Non rimuovere le ciglia a casa."] },
  "volume-brasileiro": { pt: ["Volume brasileiro", "Efeito Y 2D natural. Veja também a opção no castanho."], en: ["Brazilian volume", "Natural Y 2D effect. See also the brown option."], es: ["Volumen brasileño", "Efecto Y 2D natural. Mira también la opción en castaño."], it: ["Volume brasiliano", "Effetto Y 2D naturale. Scopri anche l'opzione castana."] },
  "volume-brasileiro-no-castanho": { pt: ["Volume brasileiro no castanho", "Efeito Y 2D natural com fios castanhos."], en: ["Brazilian volume in brown", "Natural Y 2D effect with brown lashes."], es: ["Volumen brasileño en castaño", "Efecto Y 2D natural con pestañas castañas."], it: ["Volume brasiliano castano", "Effetto Y 2D naturale con ciglia castane."] },
  "volume-egipcio": { pt: ["Volume egípcio", "Efeito de olhar marcado e leve. Método disponível em preto; veja também a opção no castanho."], en: ["Egyptian volume", "Defined yet light eye effect. Method available in black; see also the brown option."], es: ["Volumen egipcio", "Efecto de mirada marcada y ligera. Método disponible en negro; mira también la opción en castaño."], it: ["Volume egiziano", "Effetto sguardo definito e leggero. Metodo disponibile in nero; scopri anche l'opzione castana."] },
  "volume-egipcio-no-castanho": { pt: ["Volume egípcio no castanho", "Versão do método egípcio com fios castanhos para um efeito de olhar marcado e leve."], en: ["Egyptian volume in brown", "Egyptian method version with brown lashes for a defined yet light eye effect."], es: ["Volumen egipcio en castaño", "Versión del método egipcio con pestañas castañas para un efecto de mirada marcada y ligera."], it: ["Volume egiziano castano", "Versione del metodo egiziano con ciglia castane per un effetto sguardo definito e leggero."] },
  "volume-hibrido": { pt: ["Volume híbrido", "Fans preenchidos para um olhar impactante."], en: ["Hybrid volume", "Full fans for an impactful look."], es: ["Volumen híbrido", "Fans rellenos para una mirada impactante."], it: ["Volume ibrido", "Fan pieni per uno sguardo d'impatto."] },
  "volume-moderado": { pt: ["Volume moderado", "Fios 3D para um resultado leve e sutil."], en: ["Moderate volume", "3D lashes for a light, subtle result."], es: ["Volumen moderado", "Pestañas 3D para un resultado ligero y sutil."], it: ["Volume moderato", "Ciglia 3D per un risultato leggero e sottile."] },
  "brow-lamination": { pt: ["Brow lamination", "Técnica para alinhar os fios e criar um efeito de sobrancelhas mais volumosas e preenchidas."], en: ["Brow lamination", "Technique to align the hairs and create fuller, more filled-in brows."], es: ["Brow lamination", "Técnica para alinear los pelos y crear un efecto de cejas más voluminosas y rellenas."], it: ["Brow lamination", "Tecnica per allineare i peli e creare un effetto sopracciglia più voluminose e piene."] },
  "design-com-henna": { pt: ["Design com henna", "Design personalizado associado à aplicação de henna para realçar as sobrancelhas."], en: ["Design with henna", "Personalized design combined with henna application to enhance the brows."], es: ["Diseño con henna", "Diseño personalizado asociado a la aplicación de henna para realzar las cejas."], it: ["Design con henné", "Design personalizzato abbinato all'applicazione di henné per valorizzare le sopracciglia."] },
  "design-de-sobrancelhas-com-cera": { pt: ["Design de sobrancelhas com cera", "Design personalizado de acordo com o rosto, realizado com cera fria."], en: ["Brow design with wax", "Personalized design to suit your face, done with cold wax."], es: ["Diseño de cejas con cera", "Diseño personalizado según el rostro, realizado con cera fría."], it: ["Design sopracciglia con cera", "Design personalizzato in base al viso, eseguito con cera fredda."] },
  "henna-nas-sobrancelhas": { pt: ["Henna nas sobrancelhas", "Pigmentação com henna para realçar o desenho e preencher visualmente pequenas falhas."], en: ["Henna brows", "Henna tinting to enhance the shape and visually fill in small gaps."], es: ["Henna en las cejas", "Pigmentación con henna para realzar el diseño y rellenar visualmente pequeños huecos."], it: ["Henné sulle sopracciglia", "Pigmentazione con henné per valorizzare il disegno e riempire otticamente piccole lacune."] },
  "buco-com-cera-fria": { pt: ["Buço com cera fria", "Remoção dos pelos do buço com cera fria."], en: ["Upper lip with cold wax", "Upper lip hair removal with cold wax."], es: ["Bozo con cera fría", "Eliminación del vello del bozo con cera fría."], it: ["Baffetti con cera fredda", "Rimozione dei peli dei baffetti con cera fredda."] },
  "depilacao-facial-completa-com-navalha": { pt: ["Depilação facial completa com navalha", "Procedimento facial completo com navalha, apresentado como dermapiling no catálogo do Studio."], en: ["Full facial hair removal with razor", "Complete facial procedure with a razor, presented as dermapiling in the Studio's catalog."], es: ["Depilación facial completa con cuchilla", "Procedimiento facial completo con cuchilla, presentado como dermapiling en el catálogo del Studio."], it: ["Depilazione completa del viso con rasoio", "Trattamento completo del viso con rasoio, presentato come dermapiling nel catalogo dello Studio."] },
  "hidra-gloss-color": { pt: ["Hidra Gloss Color", "Regeneração, hidratação e efeito lip tint, com durabilidade de até 30 dias."], en: ["Hidra Gloss Color", "Regeneration, hydration and lip tint effect, lasting up to 30 days."], es: ["Hidra Gloss Color", "Regeneración, hidratación y efecto lip tint, con duración de hasta 30 días."], it: ["Hidra Gloss Color", "Rigenerazione, idratazione ed effetto lip tint, con durata fino a 30 giorni."] },
  "nano-lips-gloss": { pt: ["Nano Lips Gloss", "Efeito marcante."], en: ["Nano Lips Gloss", "Striking effect."], es: ["Nano Lips Gloss", "Efecto llamativo."], it: ["Nano Lips Gloss", "Effetto deciso."] },
};

const categories: Record<string, { pt: Pair } & Record<Lang, Pair>> = {
  cilios: { pt: ["Extensão de cílios", "Métodos, efeitos e manutenções."], en: ["Eyelash extensions", "Methods, effects and maintenance."], es: ["Extensiones de pestañas", "Métodos, efectos y mantenimientos."], it: ["Extension ciglia", "Metodi, effetti e mantenimenti."] },
  sobrancelhas: { pt: ["Brow lamination e sobrancelhas", "Brow lamination · Design com e sem henna."], en: ["Brow lamination and eyebrows", "Brow lamination · Design with and without henna."], es: ["Brow lamination y cejas", "Brow lamination · Diseño con y sin henna."], it: ["Brow lamination e sopracciglia", "Brow lamination · Design con e senza henné."] },
  depilacao: { pt: ["Depilação de buço e facial", "Cuidados e detalhes de cada procedimento."], en: ["Upper lip and facial hair removal", "Care and details for each procedure."], es: ["Depilación de bozo y facial", "Cuidados y detalles de cada procedimiento."], it: ["Depilazione di baffetti e viso", "Cure e dettagli di ogni trattamento."] },
  labios: { pt: ["Hidra Gloss Color e Nano Lips Color", "Informações, resultados e retornos."], en: ["Hidra Gloss Color and Nano Lips Color", "Information, results and return visits."], es: ["Hidra Gloss Color y Nano Lips Color", "Información, resultados y retornos."], it: ["Hidra Gloss Color e Nano Lips Color", "Informazioni, risultati e ritorni."] },
};

const returns: Record<string, Record<Lang, string>> = {
  "Retorno em até 30 dias.": { en: "Return visit within 30 days.", es: "Retorno en hasta 30 días.", it: "Ritorno entro 30 giorni." },
  "Retorno em até 30 dias, consulte as condições.": { en: "Return visit within 30 days; ask about the conditions.", es: "Retorno en hasta 30 días; consulta las condiciones.", it: "Ritorno entro 30 giorni; chiedi le condizioni." },
};

const notes: Record<string, Record<Lang, string>> = {
  "Não remova os fios em casa.": { en: "Do not remove the lashes at home.", es: "No retires las pestañas en casa.", it: "Non rimuovere le ciglia a casa." },
};

const swap = (current: string, original: string, translated: string) => (current === original ? translated : current);

/** Devolve o catálogo no idioma pedido (puro). Textos editados no banco permanecem como estão. */
export function localizeCatalog(catalog: Catalog, locale: Locale): Catalog {
  if (locale === "pt") return catalog;
  return {
    ...catalog,
    categories: catalog.categories.map((c) => {
      const t = categories[c.slug];
      if (!t) return c;
      return { ...c, title: swap(c.title, t.pt[0], t[locale][0]), tagline: swap(c.tagline, t.pt[1], t[locale][1]) };
    }),
    services: catalog.services.map((s) => {
      const t = services[s.slug];
      return {
        ...s,
        ...(t ? { name: swap(s.name, t.pt[0], t[locale][0]), description: swap(s.description, t.pt[1], t[locale][1]) } : {}),
        ...(s.returnInfo ? { returnInfo: returns[s.returnInfo]?.[locale] ?? s.returnInfo } : {}),
        ...(s.notes ? { notes: s.notes.map((n) => notes[n]?.[locale] ?? n) } : {}),
      };
    }),
  };
}

export const catalogTranslationSlugs = { services: Object.keys(services), categories: Object.keys(categories) };
export const catalogOriginalPt = { services, categories };
