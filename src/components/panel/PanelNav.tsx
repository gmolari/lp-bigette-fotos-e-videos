"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { m } from "motion/react";
import { Image, LayoutList, LogOut, UserRound, UsersRound } from "lucide-react";
import { panelContent } from "@/config/panel-content";
import { useAction } from "@/lib/action/hooks";
import { signOut } from "@/modules/auth/actions";
import { spring } from "./motion/tokens";
import { ActionAlert } from "./ui/ActionAlert";
import { Button } from "./ui/Button";

const t = panelContent.nav;

const links = [
  { href: "/pictures", label: t.pictures, Icon: Image, adminOnly: false },
  { href: "/sections", label: t.sections, Icon: LayoutList, adminOnly: false },
  { href: "/users", label: t.users, Icon: UsersRound, adminOnly: true },
  { href: "/profile", label: t.profile, Icon: UserRound, adminOnly: false },
];

/** `isAdmin` só decide o que MOSTRAR. Quem barra é o servidor. */
export function PanelNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAction(signOut, {
    onSuccess: () => {
      router.replace("/login");
      router.refresh();
    },
  });

  return (
    <nav aria-label={t.label} className="relative flex items-center gap-1">
      <ul className="flex items-center gap-1">
        {links.filter((l) => isAdmin || !l.adminOnly).map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href} className="relative">
              {active && (
                // Pílula compartilhada: desliza entre os itens ao navegar
                <m.span
                  layoutId="panel-nav-pill"
                  transition={spring.gentle}
                  className="absolute inset-0 rounded-full bg-bg-3"
                />
              )}
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={[
                  "relative flex h-9 items-center gap-2 rounded-full px-3.5 text-sm transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-2",
                  active ? "text-cream" : "text-muted hover:text-cream",
                ].join(" ")}
              >
                <Icon aria-hidden className="size-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <Button
        variant="ghost"
        size="sm"
        loading={logout.isPending}
        onClick={() => logout.mutate(undefined)}
        aria-label={t.signOut}
      >
        <LogOut aria-hidden className="size-4" />
      </Button>
      {/* Sair falhou (ex.: sem internet): avisa em vez de falhar calado */}
      {logout.error && (
        <div className="absolute right-0 top-full mt-2 w-72">
          <ActionAlert error={logout.error} />
        </div>
      )}
    </nav>
  );
}
