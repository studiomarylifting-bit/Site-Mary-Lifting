"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { buttonClass } from "@/components/ui/Button";
import { CheckField, SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { sendJson } from "@/lib/client/post-json";
import { sacConsent } from "@/features/privacy/consents";

const types = [
  ["duvida", "Dúvida"], ["agendamento", "Agendamento"], ["procedimento", "Procedimento"],
  ["pos_atendimento", "Pós-atendimento"], ["financeiro", "Financeiro"],
  ["privacidade", "Privacidade e dados"], ["reclamacao", "Reclamação"],
  ["sugestao", "Sugestão"], ["outro", "Outro"],
] as const;

interface Values {
  name: string; email: string; phone: string; subject: string; type: string;
  message: string; contactConsent: boolean; website: string;
}

export function SacForm({
  defaults,
  signedIn,
}: {
  defaults?: Partial<Pick<Values, "name" | "email" | "phone" | "subject" | "type">>;
  signedIn: boolean;
}) {
  const renderedAt = useRef(Date.now());
  const [protocol, setProtocol] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register, handleSubmit, setError: setFieldError, reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ defaultValues: { ...defaults, contactConsent: false, website: "" } });

  async function onSubmit(values: Values) {
    setError(null);
    const result = await sendJson("/api/sac", { ...values, renderedAt: renderedAt.current });
    if (result.ok) {
      setProtocol(String(result.protocol ?? ""));
      reset();
      return;
    }
    if (result.fields) {
      for (const [k, msg] of Object.entries(result.fields)) setFieldError(k as keyof Values, { message: msg });
    }
    setError(result.message ?? "Não foi possível enviar.");
  }

  if (protocol) {
    return (
      <Alert tone="success" title="Solicitação recebida">
        Guarde o número do seu protocolo: <strong className="font-medium">{protocol}</strong>.
        {signedIn ? " Você pode acompanhar o andamento em Minha conta > SAC." : " Responderemos pelos dados de contato informados."}
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6" aria-busy={isSubmitting}>
      {error && <Alert tone="error">{error}</Alert>}
      <div className="grid gap-6 md:grid-cols-2">
        <TextField id="name" label="Nome" autoComplete="name" required error={errors.name?.message} {...register("name", { required: "Informe seu nome" })} />
        <TextField id="email" type="email" label="E-mail" autoComplete="email" required error={errors.email?.message} {...register("email", { required: "Informe seu e-mail" })} />
        <TextField id="phone" type="tel" label="Celular com DDD" autoComplete="tel" placeholder="(11) 99999-9999" required error={errors.phone?.message} {...register("phone", { required: "Informe seu celular" })} />
        <SelectField id="type" label="Tipo de solicitação" required placeholder="Selecione" options={types.map(([value, label]) => ({ value, label }))} error={errors.type?.message} {...register("type", { required: "Selecione o tipo" })} />
      </div>
      <TextField id="subject" label="Assunto" required error={errors.subject?.message} {...register("subject", { required: "Informe o assunto" })} />
      <TextAreaField id="message" label="Mensagem" rows={6} required hint="Não envie dados de saúde por aqui. Eles são tratados na ficha de atendimento." error={errors.message?.message} {...register("message", { required: "Escreva sua mensagem" })} />
      <CheckField id="contactConsent" label={sacConsent.text} error={errors.contactConsent?.message} {...register("contactConsent", { required: "O consentimento é necessário para responder" })} />
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="website">Não preencha este campo</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
      <button type="submit" disabled={isSubmitting} className={buttonClass("primary")}>
        {isSubmitting && <Loader2 size={16} className="animate-spin" aria-hidden />}
        {isSubmitting ? "Enviando..." : "Enviar solicitação"}
      </button>
    </form>
  );
}
