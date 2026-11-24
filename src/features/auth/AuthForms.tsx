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
import { useT } from "@/i18n/client";

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
  const t = useT();
  const [state, action, pending] = useActionState(signInAction, initial);
  return (
    <form action={action} className="space-y-5" noValidate>
      <Feedback state={state} />
      <input type="hidden" name="next" value={next ?? ""} />
      <TextField id="email" name="email" type="email" label={t("auth.email")} autoComplete="email" required error={state.fields?.email} />
      <TextField id="password" name="password" type="password" label={t("auth.password")} autoComplete="current-password" required error={state.fields?.password} />
      <Submit pending={pending}>{pending ? t("auth.signIn.submitting") : t("auth.signIn.submit")}</Submit>
      <p className="flex justify-between text-sm text-cocoa">
        <Link href="/recuperar-senha" className="underline underline-offset-4">{t("auth.signIn.forgot")}</Link>
        <Link href="/cadastro" className="underline underline-offset-4">{t("auth.signIn.create")}</Link>
      </p>
    </form>
  );
}

export function SignUpForm() {
  const t = useT();
  const [state, action, pending] = useActionState(signUpAction, initial);
  if (state.ok) return <Alert tone="success" title={t("auth.signUp.almost")}>{state.message}</Alert>;
  return (
    <form action={action} className="space-y-5" noValidate>
      <Feedback state={state} />
      <TextField id="fullName" name="fullName" label={t("auth.signUp.fullName")} autoComplete="name" required error={state.fields?.fullName} />
      <TextField id="phone" name="phone" type="tel" label={t("auth.signUp.phone")} autoComplete="tel" placeholder="(11) 99999-9999" required error={state.fields?.phone} />
      <TextField id="email" name="email" type="email" label={t("auth.email")} autoComplete="email" required error={state.fields?.email} />
      <TextField id="password" name="password" type="password" label={t("auth.password")} autoComplete="new-password" required hint={t("auth.passwordHint")} error={state.fields?.password} />
      <TextField id="confirmPassword" name="confirmPassword" type="password" label={t("auth.signUp.confirm")} autoComplete="new-password" required error={state.fields?.confirmPassword} />
      <CheckField id="acceptTerms" name="acceptTerms" error={state.fields?.acceptTerms}
        label={<>{t("auth.signUp.termsPre")}<Link className="underline" href="/privacidade" target="_blank">{t("auth.signUp.privacy")}</Link>{t("auth.signUp.termsMid")}<Link className="underline" href="/termos" target="_blank">{t("auth.signUp.terms")}</Link>{t("auth.signUp.termsPost")}</>} />
      <Submit pending={pending}>{pending ? t("auth.signUp.submitting") : t("auth.signUp.submit")}</Submit>
      <p className="text-sm text-cocoa">{t("auth.signUp.have")} <Link href="/entrar" className="underline underline-offset-4">{t("auth.signUp.signIn")}</Link></p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const t = useT();
  const [state, action, pending] = useActionState(forgotPasswordAction, initial);
  return (
    <form action={action} className="space-y-5" noValidate>
      <Feedback state={state} />
      <TextField id="email" name="email" type="email" label={t("auth.forgot.email")} autoComplete="email" required error={state.fields?.email} />
      <Submit pending={pending}>{pending ? t("auth.forgot.submitting") : t("auth.forgot.submit")}</Submit>
    </form>
  );
}

export function ResetPasswordForm() {
  const t = useT();
  const [state, action, pending] = useActionState(resetPasswordAction, initial);
  return (
    <form action={action} className="space-y-5" noValidate>
      <Feedback state={state} />
      <TextField id="password" name="password" type="password" label={t("auth.reset.password")} autoComplete="new-password" required hint={t("auth.passwordHint")} error={state.fields?.password} />
      <TextField id="confirmPassword" name="confirmPassword" type="password" label={t("auth.reset.confirm")} autoComplete="new-password" required error={state.fields?.confirmPassword} />
      <Submit pending={pending}>{pending ? t("auth.reset.submitting") : t("auth.reset.submit")}</Submit>
    </form>
  );
}
