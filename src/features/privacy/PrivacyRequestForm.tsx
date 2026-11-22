"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/Alert";
import { buttonClass } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { sendJson } from "@/lib/client/post-json";

const types = [
  { value: "access", label: "Acesso aos meus dados" },
  { value: "correction", label: "Correção de dados" },
  { value: "deletion", label: "Exclusão de dados / conta" },
  { value: "consent_revocation", label: "Revogação de consentimento" },
  { value: "export", label: "Cópia / portabilidade dos dados" },
];

interface Values { email: string; type: string; details: string; website: string }

export function PrivacyRequestForm({ defaultEmail }: { defaultEmail?: string }) {
  const renderedAt = useRef(Date.now());
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, setError: setFieldError, formState: { errors, isSubmitting } } =
    useForm<Values>({ defaultValues: { email: defaultEmail ?? "", website: "" } });

  async function onSubmit(v: Values) {
    setError(null);
    const r = await sendJson("/api/privacy", { ...v, renderedAt: renderedAt.current });
    if (r.ok) return setDone(true);
    if (r.fields) for (const [k, m] of Object.entries(r.fields)) setFieldError(k as keyof Values, { message: m });
    setError(r.message ?? "Não foi possível enviar.");
  }

  if (done) return <Alert tone="success" title="Solicitação registrada">O Studio analisará seu pedido. Pode ser necessário confirmar sua identidade.</Alert>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {error && <Alert tone="error">{error}</Alert>}
      <TextField id="email" type="email" label="E-mail de contato" autoComplete="email" required error={errors.email?.message} {...register("email", { required: "Informe seu e-mail" })} />
      <SelectField id="type" label="Tipo de solicitação" required placeholder="Selecione" options={types} error={errors.type?.message} {...register("type", { required: "Selecione o tipo" })} />
      <TextAreaField id="details" label="Detalhes (opcional)" rows={4} hint="Não inclua dados de saúde neste campo." error={errors.details?.message} {...register("details")} />
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="website">Não preencha este campo</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
      <button type="submit" disabled={isSubmitting} className={buttonClass("primary")}>{isSubmitting ? "Enviando..." : "Enviar solicitação"}</button>
    </form>
  );
}
