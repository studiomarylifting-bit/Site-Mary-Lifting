"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Loader2, RotateCcw, Upload } from "lucide-react";
import { useT } from "@/i18n/client";
import { buttonClass } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { resetSiteImageAction, uploadCatalogImageAction, uploadSiteImageAction, type ImageFormState } from "./actions";
import { MAX_UPLOAD_BYTES } from "./slots";

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const initial: ImageFormState = {};

// A prévia usa as cores reais de cada tema (não os tokens), para o admin ver como a imagem fica.
const SURFACE: Record<string, string> = {
  light: "bg-[#faf6f0]",
  dark: "bg-[#16100d]",
  photo: "bg-nude",
};

function Status({ state }: { state: ImageFormState }) {
  const t = useT();
  if (state.ok) return <Alert tone="success">{t("admin.images.saved")}</Alert>;
  if (state.code) return <Alert tone="error">{t(`admin.images.err.${state.code}`)}</Alert>;
  return null;
}

/** Cartão de uma imagem: prévia atual, escolha de arquivo com prévia da nova, salvar e (opcional) restaurar. */
function ImageCard({
  title, hint, hiddenFields, currentUrl, custom, surface, ratioClass, uploadAction, resetAction, rules, noPhoto,
}: {
  title: string;
  hint?: string;
  hiddenFields: Record<string, string>;
  currentUrl?: string;
  custom: boolean;
  surface: string;
  ratioClass: string;
  uploadAction: (s: ImageFormState, f: FormData) => Promise<ImageFormState>;
  resetAction?: (s: ImageFormState, f: FormData) => Promise<ImageFormState>;
  rules?: string;
  noPhoto?: boolean;
}) {
  const t = useT();
  const [up, upForm, upPending] = useActionState(uploadAction, initial);
  const [rs, rsForm, rsPending] = useActionState(resetAction ?? uploadAction, initial);
  const [preview, setPreview] = useState<string | null>(null);
  const [clientError, setClientError] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (up.ok) {
      formRef.current?.reset();
      setPreview(null);
    }
  }, [up]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setClientError(false);
    setPreview(null);
    if (!f) return;
    if (f.size > MAX_UPLOAD_BYTES) {
      setClientError(true);
      e.target.value = "";
      return;
    }
    setPreview(URL.createObjectURL(f));
  }

  const shown = preview ?? currentUrl;
  return (
    <li className="flex flex-col gap-4 rounded-card bg-ivory p-5 shadow-soft">
      <div>
        <h3 className="font-display text-2xl text-espresso">{title}</h3>
        {hint && <p className="mt-1 text-sm text-cocoa">{hint}</p>}
      </div>

      <div className={`relative flex ${ratioClass} items-center justify-center overflow-hidden rounded-2xl border border-line ${SURFACE[surface] ?? SURFACE.photo}`}>
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element -- prévia de arquivo local (blob:) e de URL externa
          <img src={shown} alt={preview ? t("admin.images.preview") : title} className={surface === "photo" ? "h-full w-full object-cover" : "max-h-full max-w-full object-contain p-3"} />
        ) : (
          <span className="text-sm text-taupe">{noPhoto ? t("admin.images.noPhoto") : ""}</span>
        )}
      </div>
      {!preview && (
        <p className="-mt-2 text-xs uppercase tracking-[0.14em] text-rose-deep">
          {custom ? t("admin.images.inUseCustom") : t("admin.images.inUseDefault")}
        </p>
      )}
      {preview && <p className="-mt-2 text-xs uppercase tracking-[0.14em] text-rose-deep">{t("admin.images.preview")}</p>}

      <form ref={formRef} action={upForm} className="space-y-3">
        {Object.entries(hiddenFields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        <label className="block">
          <span className="sr-only">{t("admin.images.choose")}</span>
          <input
            type="file"
            name="file"
            accept={ACCEPT}
            required
            onChange={onPick}
            className="block w-full min-w-0 cursor-pointer rounded-xl border border-stroke bg-cream text-sm text-cocoa file:mr-3 file:min-h-11 file:cursor-pointer file:border-0 file:bg-nude file:px-4 file:text-sm file:text-espresso"
          />
        </label>
        {rules && <p className="text-xs text-cocoa">{rules}</p>}
        {clientError && <Alert tone="error">{t("admin.images.tooBigClient")}</Alert>}
        <button type="submit" disabled={upPending || !preview} className={buttonClass("primary", "w-full")}>
          {upPending ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Upload size={16} aria-hidden />}
          {upPending ? t("admin.images.saving") : t("admin.images.save")}
        </button>
        <Status state={up} />
      </form>

      {resetAction && custom && (
        <form action={rsForm}>
          {Object.entries(hiddenFields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
          <button type="submit" disabled={rsPending} className={buttonClass("outline", "w-full")}>
            {rsPending ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <RotateCcw size={16} aria-hidden />}
            {rsPending ? t("admin.images.resetting") : t("admin.images.reset")}
          </button>
          <div className="mt-3"><Status state={rs} /></div>
        </form>
      )}
    </li>
  );
}

export interface SlotView {
  key: string;
  group: "brand" | "home";
  surface: "light" | "dark" | "photo";
  ratio: string;
  transparent: boolean;
  url: string;
  custom: boolean;
}
export interface CatalogItemView {
  kind: "service" | "category";
  slug: string;
  title: string;
  url?: string;
}

const RATIO_CLASS: Record<string, string> = { "1:1": "aspect-square", "2:3": "aspect-[2/3] max-h-72", "4:5": "aspect-[4/5]", "3:4": "aspect-[3/4]" };

export function SlotGrid({ slots }: { slots: SlotView[] }) {
  const t = useT();
  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {slots.map((s) => (
        <ImageCard
          key={s.key}
          title={t(`admin.images.slots.${s.key}.label`)}
          hint={t(`admin.images.slots.${s.key}.hint`)}
          hiddenFields={{ slot: s.key }}
          currentUrl={s.url}
          custom={s.custom}
          surface={s.surface}
          ratioClass={RATIO_CLASS[s.ratio] ?? "aspect-square"}
          uploadAction={uploadSiteImageAction}
          resetAction={resetSiteImageAction}
          rules={`${t("admin.images.rules", { ratio: s.ratio })}${s.transparent ? ` ${t("admin.images.transparent")}` : ""}`}
        />
      ))}
    </ul>
  );
}

export function CatalogGrid({ items }: { items: CatalogItemView[] }) {
  const t = useT();
  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((i) => (
        <ImageCard
          key={`${i.kind}:${i.slug}`}
          title={i.title}
          hiddenFields={{ kind: i.kind, slug: i.slug }}
          currentUrl={i.url}
          custom={!!i.url}
          surface="photo"
          ratioClass="aspect-[4/3]"
          uploadAction={uploadCatalogImageAction}
          rules={t("admin.images.rules", { ratio: "4:3" })}
          noPhoto
        />
      ))}
    </ul>
  );
}
