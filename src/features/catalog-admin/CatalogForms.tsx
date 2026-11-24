"use client";

import { useActionState } from "react";
import { Archive, ArchiveRestore, Loader2, Save } from "lucide-react";
import { useT } from "@/i18n/client";
import { Alert } from "@/components/ui/Alert";
import { buttonClass } from "@/components/ui/Button";
import { CheckField, SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { saveCategoryAction, saveServiceAction, setActiveAction, type CatalogFormState } from "./actions";

const initial: CatalogFormState = {};

export const centsToInput = (cents: number | null | undefined) =>
  cents === null || cents === undefined ? "" : (cents / 100).toFixed(2).replace(".", ",");

function Status({ state }: { state: CatalogFormState }) {
  const t = useT();
  if (state.ok) return <Alert tone="success">{t("admin.catalog.saved")}</Alert>;
  if (state.code) return <Alert tone="error">{t(`admin.catalog.err.${state.code}`)}</Alert>;
  return null;
}

function SaveButton({ pending, label }: { pending: boolean; label: string }) {
  const t = useT();
  return (
    <button type="submit" disabled={pending} className={buttonClass("primary", "w-full sm:w-auto")}>
      {pending ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Save size={16} aria-hidden />}
      {pending ? t("admin.catalog.saving") : label}
    </button>
  );
}

export interface CategoryFormValues {
  slug: string; title: string; tagline: string; index_label: string; position: number;
  declared_option_count: number; active: boolean;
}

export function CategoryForm({ mode, values }: { mode: "create" | "edit"; values: CategoryFormValues }) {
  const t = useT();
  const [state, action, pending] = useActionState(saveCategoryAction, initial);
  const e = (k: string) => (state.errors?.[k] ? t(`admin.catalog.fieldErr.${state.errors[k]}`) : undefined);
  const v = (k: keyof CategoryFormValues) => state.values?.[k] ?? String(values[k]);
  const creating = mode === "create";
  return (
    <form key={state.rev ?? 0} action={action} className="space-y-5 rounded-card bg-ivory p-5 shadow-soft sm:p-7" noValidate>
      <input type="hidden" name="mode" value={mode} />
      {!creating && <input type="hidden" name="slug" value={values.slug} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id="cat-title" name="title" label={t("admin.catalog.field.catTitle")} required defaultValue={v("title")} error={e("title")} maxLength={80} />
        {creating ? (
          <TextField id="cat-slug" name="slug" label={t("admin.catalog.field.slug")} hint={t("admin.catalog.field.slugHint")} defaultValue={state.values?.slug ?? ""} error={e("slug")} maxLength={60} autoCapitalize="none" />
        ) : (
          <TextField id="cat-slug-ro" label={t("admin.catalog.field.slug")} hint={t("admin.catalog.field.slugLocked")} value={values.slug} readOnly />
        )}
      </div>
      <TextAreaField id="cat-tagline" name="tagline" label={t("admin.catalog.field.tagline")} required rows={3} defaultValue={v("tagline")} error={e("tagline")} maxLength={300} />
      <div className="grid gap-5 sm:grid-cols-3">
        <TextField id="cat-pos" name="position" type="number" inputMode="numeric" min={1} max={999} label={t("admin.catalog.field.position")} required defaultValue={v("position")} error={e("position")} />
        <TextField id="cat-idx" name="index_label" label={t("admin.catalog.field.indexLabel")} hint={t("admin.catalog.field.indexHint")} required defaultValue={v("index_label")} error={e("index_label")} maxLength={4} />
        <TextField id="cat-declared" name="declared_option_count" type="number" inputMode="numeric" min={0} max={999} label={t("admin.catalog.field.declared")} hint={t("admin.catalog.field.declaredHint")} required defaultValue={v("declared_option_count")} error={e("declared_option_count")} />
      </div>
      <CheckField id="cat-active" name="active" label={t("admin.catalog.field.active")} defaultChecked={state.values ? state.values.active === "on" : values.active} />
      <div className="flex flex-wrap items-center gap-3">
        <SaveButton pending={pending} label={creating ? t("admin.catalog.createCategory") : t("admin.catalog.save")} />
      </div>
      <Status state={state} />
    </form>
  );
}

export interface ServiceFormValues {
  slug: string; category_slug: string; name: string; description: string; price: string;
  maintenance_price: string; maintenance_days: string; return_info: string; notes: string;
  position: number; active: boolean;
}

export function ServiceForm({
  mode, values, categories,
}: { mode: "create" | "edit"; values: ServiceFormValues; categories: { value: string; label: string }[] }) {
  const t = useT();
  const [state, action, pending] = useActionState(saveServiceAction, initial);
  const e = (k: string) => (state.errors?.[k] ? t(`admin.catalog.fieldErr.${state.errors[k]}`) : undefined);
  const v = (k: keyof ServiceFormValues) => state.values?.[k] ?? String(values[k]);
  const creating = mode === "create";
  return (
    <form key={state.rev ?? 0} action={action} className="space-y-5 rounded-card bg-ivory p-5 shadow-soft sm:p-7" noValidate>
      <input type="hidden" name="mode" value={mode} />
      {!creating && <input type="hidden" name="slug" value={values.slug} />}
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id="svc-name" name="name" label={t("admin.catalog.field.name")} required defaultValue={v("name")} error={e("name")} maxLength={120} />
        {creating ? (
          <TextField id="svc-slug" name="slug" label={t("admin.catalog.field.slug")} hint={t("admin.catalog.field.slugHint")} defaultValue={state.values?.slug ?? ""} error={e("slug")} maxLength={60} autoCapitalize="none" />
        ) : (
          <TextField id="svc-slug-ro" label={t("admin.catalog.field.slug")} hint={t("admin.catalog.field.slugLocked")} value={values.slug} readOnly />
        )}
      </div>
      <SelectField id="svc-cat" name="category_slug" label={t("admin.catalog.field.category")} required options={categories} defaultValue={v("category_slug")} error={e("category_slug")} />
      <TextAreaField id="svc-desc" name="description" label={t("admin.catalog.field.description")} required rows={5} defaultValue={v("description")} error={e("description")} maxLength={2000} />
      <div className="grid gap-5 sm:grid-cols-3">
        <TextField id="svc-price" name="price" inputMode="decimal" label={t("admin.catalog.field.price")} hint={t("admin.catalog.field.priceHint")} required defaultValue={v("price")} error={e("price_cents")} placeholder="150,00" />
        <TextField id="svc-mprice" name="maintenance_price" inputMode="decimal" label={t("admin.catalog.field.maintenancePrice")} hint={t("admin.catalog.field.optional")} defaultValue={v("maintenance_price")} error={e("maintenance_cents")} placeholder="90,00" />
        <TextField id="svc-mdays" name="maintenance_days" type="number" inputMode="numeric" min={1} max={3650} label={t("admin.catalog.field.maintenanceDays")} hint={t("admin.catalog.field.maintenanceDaysHint")} defaultValue={v("maintenance_days")} error={e("maintenance_days")} />
      </div>
      <TextField id="svc-return" name="return_info" label={t("admin.catalog.field.returnInfo")} hint={t("admin.catalog.field.optional")} defaultValue={v("return_info")} error={e("return_info")} maxLength={500} />
      <TextAreaField id="svc-notes" name="notes" label={t("admin.catalog.field.notes")} hint={t("admin.catalog.field.notesHint")} rows={4} defaultValue={v("notes")} error={e("notes")} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id="svc-pos" name="position" type="number" inputMode="numeric" min={1} max={999} label={t("admin.catalog.field.position")} required defaultValue={v("position")} error={e("position")} />
        <div className="self-end pb-3"><CheckField id="svc-active" name="active" label={t("admin.catalog.field.active")} defaultChecked={state.values ? state.values.active === "on" : values.active} /></div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SaveButton pending={pending} label={creating ? t("admin.catalog.createService") : t("admin.catalog.save")} />
      </div>
      <Status state={state} />
    </form>
  );
}

/** Arquivar/reativar: não há exclusão (preserva links, feedbacks e histórico). */
export function ArchiveButton({ kind, slug, active }: { kind: "service" | "category"; slug: string; active: boolean }) {
  const t = useT();
  const [state, action, pending] = useActionState(setActiveAction, initial);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="active" value={active ? "false" : "true"} />
      <button type="submit" disabled={pending} className={buttonClass("outline")}>
        {pending ? <Loader2 size={16} className="animate-spin" aria-hidden /> : active ? <Archive size={16} aria-hidden /> : <ArchiveRestore size={16} aria-hidden />}
        {active ? t("admin.catalog.archive") : t("admin.catalog.restore")}
      </button>
      <p className="text-xs text-cocoa">{active ? t("admin.catalog.archiveNote") : t("admin.catalog.archivedNote")}</p>
      {state.code && <Alert tone="error">{t(`admin.catalog.err.${state.code}`)}</Alert>}
    </form>
  );
}
