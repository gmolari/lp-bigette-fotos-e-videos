/** Cartão de seção de formulário. Spec: .claude/design-system/components.md → Panel */
export function Panel({
  title,
  lead,
  tone = "default",
  children,
}: {
  title: string;
  lead?: string;
  tone?: "default" | "danger";
  children: React.ReactNode;
}) {
  return (
    <section
      className={[
        "rounded-2xl border bg-bg-2 p-5 sm:p-7",
        tone === "danger" ? "border-erro/30" : "border-line",
      ].join(" ")}
    >
      <header className="mb-6">
        <h2 className={`font-display text-xl ${tone === "danger" ? "text-erro" : "text-cream"}`}>{title}</h2>
        {lead && <p className="mt-1 text-sm text-muted">{lead}</p>}
      </header>
      {children}
    </section>
  );
}
