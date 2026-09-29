"use client";

import { useEffect } from "react";
import Link from "next/link";
import { m } from "motion/react";
import { TriangleAlert } from "lucide-react";
import { panelContent } from "@/config/panel-content";
import { focusIn } from "./motion/tokens";
import { Button } from "./ui/Button";

const t = panelContent.errors;

/**
 * Tela de erro de renderização (error boundary do Next).
 *
 * Em produção o Next NÃO manda a mensagem do erro ao navegador — só o
 * `digest`, um hash que aparece também no log do servidor. É ele que
 * mostramos como código, para cruzar com o log.
 */
export function ErrorScreen({
  error,
  retry,
  homeHref,
}: {
  error: Error & { digest?: string };
  retry: () => void;
  homeHref: string;
}) {
  useEffect(() => {
    console.error("[painel] erro de renderização", error);
  }, [error]);

  return (
    <m.div
      variants={focusIn}
      initial="hidden"
      animate="visible"
      role="alert"
      className="mx-auto flex max-w-md flex-col items-center py-16 text-center"
    >
      <span className="grid size-12 place-items-center rounded-full bg-erro/10 text-erro">
        <TriangleAlert aria-hidden className="size-5" />
      </span>
      <h1 className="mt-4 font-display text-2xl text-cream">{t.boundary.title}</h1>
      <p className="mt-2 text-sm text-muted">{t.boundary.text}</p>

      {error.digest && (
        <p className="mt-3 text-xs text-muted">
          {t.errorId}: <code className="select-all font-mono text-cream/80">{error.digest}</code>
        </p>
      )}
      {process.env.NODE_ENV !== "production" && (
        <code className="mt-3 block max-w-full break-words rounded-lg bg-bg-2 px-3 py-2 text-left font-mono text-xs text-erro">
          {error.message}
        </code>
      )}

      <div className="mt-6 flex gap-3">
        <Button onClick={retry}>{t.boundary.retry}</Button>
        <Link
          href={homeHref}
          className="inline-flex h-11 items-center rounded-full px-5 text-[0.95rem] font-semibold text-muted transition-colors hover:bg-bg-3 hover:text-cream"
        >
          {t.boundary.home}
        </Link>
      </div>
    </m.div>
  );
}
