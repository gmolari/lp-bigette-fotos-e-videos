"use client";

import Link from "next/link";
import { m } from "motion/react";
import { ChevronRight, UsersRound } from "lucide-react";
import { panelContent } from "@/config/panel-content";
import { useActionQuery } from "@/lib/action/hooks";
import { listUsers } from "@/modules/users/actions";
import { fadeUp, stagger } from "../motion/tokens";
import { ActionAlert } from "../ui/ActionAlert";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { formatDateTime } from "./format";

const t = panelContent.users;
const c = panelContent.common;

export function UsersList({ currentUserId }: { currentUserId: string }) {
  const query = useActionQuery(["users", "list"], listUsers, undefined);

  if (query.isPending) {
    return (
      <ul aria-busy className="flex flex-col gap-2" aria-label={c.loading}>
        {[0, 1, 2].map((i) => (
          <li key={i} className="h-[4.5rem] animate-pulse rounded-2xl bg-bg-2" />
        ))}
      </ul>
    );
  }

  if (query.isError) {
    return (
      <div className="flex flex-col items-start gap-4">
        <ActionAlert error={query.error} />
        <Button variant="secondary" size="sm" onClick={() => query.refetch()}>
          {c.retry}
        </Button>
      </div>
    );
  }

  if (query.data.length === 0) return <EmptyState icon={UsersRound} title={t.emptyTitle} />;

  return (
    <m.ul variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-2">
      {query.data.map((u) => (
        <m.li key={u.id} variants={fadeUp}>
          <Link
            href={`/users/${u.id}`}
            className={[
              "group flex items-center gap-4 rounded-2xl border border-line bg-bg-2 px-4 py-3.5",
              "transition-[border-color,background-color] duration-200 hover:border-line-forte hover:bg-bg-3/60",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-2",
            ].join(" ")}
          >
            <span
              aria-hidden
              className="grid size-10 shrink-0 place-items-center rounded-full bg-bg-3 font-display text-accent-2"
            >
              {(u.name || u.username).charAt(0).toUpperCase()}
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="truncate font-medium text-cream">{u.name || u.username}</span>
                <Badge tone={u.role === "admin" ? "accent" : "neutral"}>{panelContent.roles[u.role]}</Badge>
                {u.id === currentUserId && <Badge tone="ouro">{t.you}</Badge>}
              </span>
              <span className="mt-0.5 block truncate text-sm text-muted">
                @{u.username} · {u.email}
              </span>
            </span>

            <span className="hidden shrink-0 text-right text-xs text-muted sm:block">
              {t.lastLogin}
              <span className="block text-cream/80">{formatDateTime(u.lastLoginAt) ?? c.never}</span>
            </span>
            <ChevronRight
              aria-hidden
              className="size-4 shrink-0 text-muted transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </m.li>
      ))}
    </m.ul>
  );
}
