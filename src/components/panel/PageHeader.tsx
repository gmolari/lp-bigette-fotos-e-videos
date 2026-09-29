import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function PageHeader({
  title,
  lead,
  back,
  action,
}: {
  title: string;
  lead?: string;
  back?: { href: string; label: string };
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-8">
      {back && (
        <Link
          href={back.href}
          className="mb-4 inline-flex items-center gap-1.5 rounded-full text-sm text-muted transition-colors hover:text-cream"
        >
          <ArrowLeft aria-hidden className="size-4" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-cream">{title}</h1>
          {lead && <p className="mt-1.5 text-sm text-muted">{lead}</p>}
        </div>
        {action}
      </div>
    </header>
  );
}
