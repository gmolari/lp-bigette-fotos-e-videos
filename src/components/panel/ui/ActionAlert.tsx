"use client";

import { AnimatePresence, m } from "motion/react";
import { CircleAlert, RefreshCw, WifiOff } from "lucide-react";
import { panelContent } from "@/config/panel-content";
import type { ActionError } from "@/lib/action/hooks";
import { duration, ease } from "../motion/tokens";

/**
 * Alerta de erro de action. Mostra a mensagem certa para o código, o
 * `errorId` (para achar no log) e, em desenvolvimento, a causa técnica.
 *
 * `VALIDATION` com campos não aparece aqui: o erro já está embaixo de
 * cada campo, e repetir no topo só polui.
 *
 * Spec: .claude/design-system/components.md → ActionAlert
 */

const t = panelContent.errors;

export function ActionAlert({ error }: { error: ActionError | null | undefined }) {
  const hidden = !error || (error.code === "VALIDATION" && error.fields && Object.keys(error.fields).length > 0);
  const Icon = error?.code === "NETWORK" ? WifiOff : CircleAlert;

  return (
    <AnimatePresence initial={false}>
      {!hidden && error && (
        <m.div
          key={`${error.code}:${error.message}`}
          role="alert"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } }}
          exit={{ opacity: 0, transition: { duration: duration.fast } }}
          className="flex items-start gap-2.5 rounded-xl border border-erro/40 bg-erro/10 px-3.5 py-3 text-sm text-erro"
        >
          <Icon aria-hidden className="mt-px size-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p>{error.message}</p>

            {error.code === "STALE" && (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-2 inline-flex items-center gap-1.5 font-semibold underline-offset-4 hover:underline"
              >
                <RefreshCw aria-hidden className="size-3.5" />
                {t.reload}
              </button>
            )}

            {error.errorId && (
              <p className="mt-1.5 text-xs text-erro/80">
                {t.errorId}: <code className="font-mono select-all">{error.errorId}</code>
              </p>
            )}

            {error.detail && (
              <details className="mt-1.5 text-xs text-erro/80">
                <summary>{t.detail}</summary>
                <code className="mt-1 block break-words font-mono">{error.detail}</code>
              </details>
            )}
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
