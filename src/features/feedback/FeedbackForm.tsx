"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { buttonClass } from "@/components/ui/Button";
import { CheckField, SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { sendJson } from "@/lib/client/post-json";

interface Values {
  rating: string; comment: string; procedureSlug: string; displayName: string;
  anonymize: boolean; publishConsent: boolean; website: string;
}

export function FeedbackForm({ procedures }: { procedures: { slug: string; name: string }[] }) {
  const renderedAt = useRef(Date.now());
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, watch, setError: setFieldError, formState: { errors, isSubmitting } } =
    useForm<Values>({ defaultValues: { rating: "", anonymize: true, publishConsent: false, website: "" } });
  const anonymize = watch("anonymize");

  async function onSubmit(v: Values) {
    setError(null);
    const result = await sendJson("/api/feedback", {
      ...v, rating: Number(v.rating), renderedAt: renderedAt.current,
      displayName: v.anonymize ? undefined : v.displayName,
    });
    if (result.ok) return setDone(true);
    if (result.fields) for (const [k, m] of Object.entries(result.fields)) setFieldError(k as keyof Values, { message: m });
    setError(result.message ?? "Não foi possível enviar.");
  }

  if (done) {
    return (
      <Alert tone="success" title="Obrigada pelo seu feedback">
        Ele será analisado pelo Studio. Só será publicado se for aprovado e se você tiver autorizado a publicação.
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6" aria-busy={isSubmitting}>
      {error && <Alert tone="error">{error}</Alert>}

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-cocoa">Nota <span aria-hidden className="text-rose-deep">*</span></legend>
        <div className="flex gap-2" role="radiogroup" aria-label="Nota de 1 a 5">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer">
              <input type="radio" value={n} className="peer sr-only" {...register("rating", { required: "Selecione uma nota" })} />
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-stroke bg-ivory font-display text-xl transition-colors hover:border-espresso peer-checked:border-espresso peer-checked:bg-espresso peer-checked:text-ivory peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-rose-deep motion-reduce:transition-none">{n}</span>
            </label>
          ))}
        </div>
        {errors.rating && <p className="text-xs text-rose-deep">{errors.rating.message}</p>}
      </fieldset>

      <SelectField id="procedureSlug" label="Procedimento (opcional)" placeholder="Prefiro não informar"
        options={procedures.map((p) => ({ value: p.slug, label: p.name }))} {...register("procedureSlug")} />
      <TextAreaField id="comment" label="Seu comentário" rows={5} required error={errors.comment?.message}
        {...register("comment", { required: "Escreva seu comentário" })} />

      <div className="space-y-4 rounded-card bg-ivory p-5 shadow-soft">
        <CheckField id="anonymize" label="Publicar de forma anônima (como “Cliente”)" {...register("anonymize")} />
        {!anonymize && (
          <TextField id="displayName" label="Nome para exibição" autoComplete="given-name" error={errors.displayName?.message}
            hint="Use apenas o primeiro nome, se preferir." {...register("displayName")} />
        )}
        <CheckField id="publishConsent" label="Autorizo a publicação do meu feedback no site do Studio, após aprovação." {...register("publishConsent")} />
        <p className="text-xs text-cocoa/85">Sem esta autorização, seu feedback fica privado e não é publicado.</p>
      </div>

      <div className="hp-field" aria-hidden="true">
        <label htmlFor="website">Não preencha este campo</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <button type="submit" disabled={isSubmitting} className={buttonClass("primary")}>
        {isSubmitting && <Loader2 size={16} className="animate-spin" aria-hidden />}
        {isSubmitting ? "Enviando..." : "Enviar feedback"}
      </button>
    </form>
  );
}
