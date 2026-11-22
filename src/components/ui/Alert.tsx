import { AlertCircle, CheckCircle2, Info } from "lucide-react";

type Tone = "error" | "success" | "info";

const tones: Record<Tone, { box: string; icon: string; Icon: typeof Info }> = {
  error: { box: "bg-rose/15 text-espresso", icon: "text-rose-deep", Icon: AlertCircle },
  success: { box: "bg-nude/70 text-espresso", icon: "text-cocoa", Icon: CheckCircle2 },
  info: { box: "bg-ivory text-cocoa shadow-soft", icon: "text-rose-deep", Icon: Info },
};

export function Alert({ tone = "info", title, children }: { tone?: Tone; title?: string; children: React.ReactNode }) {
  const { box, icon, Icon } = tones[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex gap-3.5 rounded-card px-5 py-4 text-sm ${box}`}>
      <Icon size={20} className={`mt-0.5 shrink-0 ${icon}`} aria-hidden />
      <div>
        {title && <p className="font-medium">{title}</p>}
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
