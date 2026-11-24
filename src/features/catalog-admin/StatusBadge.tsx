export function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs ${active ? "bg-nude text-espresso" : "bg-blush text-rose-deep"}`}>{label}</span>
  );
}
