"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { buttonClass } from "@/components/ui/Button";
import { CheckField, TextField } from "@/components/ui/Field";
import {
  forgotPasswordAction, resetPasswordAction, signInAction, signUpAction, type FormState,
} from "./actions";
import Link from "next/link";

const initial: FormState = {};

function Submit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={pending} className={buttonClass("primary", "w-full")}>
      {pending && <Loader2 size={16} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

function Feedback({ state }: { state: FormState }) {
  if (!state.message) return null;
  return <Alert tone={state.ok ? "success" : "error"}>{state.message}</Alert>;
}

export function SignInForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signInAction, initial);
  return (
    <form action={action} className="space-y-5" noValidate>
      <Feedback state={state} />
      <input type="hidden" name="next" value={next ?? ""} />
      <TextField id="email" name="email" type="email" label="E-mail" autoComplete="email" required error={state.fields?.email} />
      <TextField id="password" name="password" type="password" label="Senha" autoComplete="current-password" required error={state.fields?.password} />
      <Submit pending={pending}>{pending ? "Entrando..." : "Entrar"}</Submit>
      <p className="flex justify-between text-sm text-cocoa">
        <Link href="/recuperar-senha" className="underline underline-offset-4">Esqueci minha senha</Link>
        <Link href="/cadastro" className="underline underline-offset-4">Criar conta</Link>
      </p>
    </form>
  );
}

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUpAction, initial);
  if (state.ok) return <Alert tone="success" title="Quase lá">{state.message}</Alert>;
  return (
    <form action={action} className="space-y-5" noValidate>
      <Feedback state={state} />
      <TextField id="fullName" name="fullName" label="Nome completo" autoComplete="name" required error={state.fields?.fullName} />
      <TextField id="phone" name="phone" type="tel" label="Celular com DDD" autoComplete="tel" placeholder="(11) 99999-9999" required error={state.fields?.phone} />
      <TextField id="email" name="email" type="email" label="E-mail" autoComplete="email" required error={state.fields?.email} />
      <TextField id="password" name="password" type="password" label="Senha" autoComplete="new-password" required hint="Mínimo de 10 caracteres, com maiúscula, minúscula e número." error={state.fields?.password} />
      <TextField id="confirmPassword" name="confirmPassword" type="password" label="Confirmar senha" autoComplete="new-password" required error={state.fields?.confirmPassword} />
      <CheckField id="acceptTerms" name="acceptTerms" error={state.fields?.acceptTerms}
        label={<>Li e aceito a <Link className="underline" href="/privacidade" target="_blank">Política de Privacidade</Link> e os <Link className="underline" href="/termos" target="_blank">Termos de Uso</Link>.</>} />
      <Submit pending={pending}>{pending ? "Criando conta..." : "Criar conta"}</Submit>
      <p className="text-sm text-cocoa">Já tem conta? <Link href="/entrar" className="underline underline-offset-4">Entrar</Link></p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, initial);
  return (
    <form action={action} className="space-y-5" noValidate>
      <Feedback state={state} />
      <TextField id="email" name="email" type="email" label="E-mail da sua conta" autoComplete="email" required error={state.fields?.email} />
      <Submit pending={pending}>{pending ? "Enviando..." : "Enviar instruções"}</Submit>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);
  return (
    <form action={action} className="space-y-5" noValidate>
      <Feedback state={state} />
      <TextField id="password" name="password" type="password" label="Nova senha" autoComplete="new-password" required hint="Mínimo de 10 caracteres, com maiúscula, minúscula e número." error={state.fields?.password} />
      <TextField id="confirmPassword" name="confirmPassword" type="password" label="Confirmar nova senha" autoComplete="new-password" required error={state.fields?.confirmPassword} />
      <Submit pending={pending}>{pending ? "Salvando..." : "Redefinir senha"}</Submit>
    </form>
  );
}
