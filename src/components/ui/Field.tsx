import { forwardRef } from "react";

const control =
  "w-full rounded-field border border-stroke bg-ivory px-4 py-3.5 text-base text-ink placeholder:text-taupe transition duration-200 hover:border-taupe focus:border-rose-deep focus:outline-none focus:ring-4 focus:ring-rose/25 focus-visible:outline-none aria-[invalid=true]:border-rose-deep aria-[invalid=true]:bg-rose/5";

interface FieldShellProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

/** Mesmo estilo dos campos, para controles soltos (busca, filtros, respostas do admin). */
export const fieldControl = control;

export function FieldShell({ id, label, hint, error, required, children }: FieldShellProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-cocoa">
        {label}
        {required && <span aria-hidden className="text-rose-deep"> *</span>}
      </label>
      {hint && <p id={`${id}-hint`} className="text-xs text-cocoa/85">{hint}</p>}
      {children}
      {error && <p id={`${id}-error`} className="text-xs font-medium text-rose-deep">{error}</p>}
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  id: string; label: string; hint?: string; error?: string;
};

export const TextField = forwardRef<HTMLInputElement, InputProps>(function TextField(
  { id, label, hint, error, required, className = "", ...rest }, ref,
) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <input
        ref={ref} id={id} required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined}
        className={`${control} ${className}`} {...rest}
      />
    </FieldShell>
  );
});

type AreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string; label: string; hint?: string; error?: string;
};

export const TextAreaField = forwardRef<HTMLTextAreaElement, AreaProps>(function TextAreaField(
  { id, label, hint, error, required, className = "", rows = 4, ...rest }, ref,
) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <textarea
        ref={ref} id={id} rows={rows} required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined}
        className={`${control} resize-y ${className}`} {...rest}
      />
    </FieldShell>
  );
});

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  id: string; label: string; error?: string; options: { value: string; label: string }[]; placeholder?: string;
};

export const SelectField = forwardRef<HTMLSelectElement, SelectProps>(function SelectField(
  { id, label, error, required, options, placeholder, className = "", ...rest }, ref,
) {
  return (
    <FieldShell id={id} label={label} error={error} required={required}>
      <select ref={ref} id={id} required={required} aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined} className={`${control} select-control ${className}`} {...rest}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </FieldShell>
  );
});

type CheckProps = React.InputHTMLAttributes<HTMLInputElement> & {
  id: string; label: React.ReactNode; error?: string; badge?: string;
};

export const CheckField = forwardRef<HTMLInputElement, CheckProps>(function CheckField(
  { id, label, error, badge, className = "", ...rest }, ref,
) {
  return (
    <div className="space-y-1">
      <div className="flex items-start gap-3.5">
        <input ref={ref} id={id} type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`check-control mt-0.5 cursor-pointer ${className}`} {...rest} />
        <label htmlFor={id} className="cursor-pointer text-sm leading-relaxed text-cocoa">
          {label}
          {badge && <span className="ml-2 text-[0.65rem] uppercase tracking-widest text-rose-deep">{badge}</span>}
        </label>
      </div>
      {error && <p id={`${id}-error`} className="pl-9 text-xs font-medium text-rose-deep">{error}</p>}
    </div>
  );
});
