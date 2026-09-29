import type { LucideIcon } from "lucide-react";

/** Spec: .claude/design-system/components.md → EmptyState */
export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: LucideIcon;
  title: string;
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line-forte px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-bg-3 text-accent">
        <Icon aria-hidden className="size-5" />
      </span>
      <h2 className="mt-4 font-display text-xl text-cream">{title}</h2>
      {text && <p className="mt-1.5 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
