import { AlertCircle, CheckCircle2, Info } from "lucide-react";

type Tone = "error" | "success" | "info";

const tones: Record<Tone, { box: string; Icon: typeof Info }> = {
  error: { box: "border-rose-deep/40 bg-rose/10 text-espresso", Icon: AlertCircle },
  success: { box: "border-cocoa/30 bg-nude/60 text-espresso", Icon: CheckCircle2 },
  info: { box: "border-line bg-ivory text-cocoa", Icon: Info },
};

export function Alert({ tone = "info", title, children }: { tone?: Tone; title?: string; children: React.ReactNode }) {
  const { box, Icon } = tones[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex gap-3 border px-4 py-3 text-sm ${box}`}>
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden />
      <div>
        {title && <p className="font-medium">{title}</p>}
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
