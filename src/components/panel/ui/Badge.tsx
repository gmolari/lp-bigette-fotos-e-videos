/** Spec: .claude/design-system/components.md → Badge. Sempre texto, nunca só cor. */
type Tone = "accent" | "neutral" | "ouro";

const tones: Record<Tone, string> = {
  accent: "bg-accent/15 text-accent-2",
  neutral: "bg-bg-3 text-muted",
  ouro: "bg-ouro/15 text-ouro",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
