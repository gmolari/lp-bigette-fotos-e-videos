"use client";

import { AnimatePresence, m } from "motion/react";
import { CircleAlert, CircleCheck, Info } from "lucide-react";
import { duration, ease } from "../motion/tokens";

/** Spec: .claude/design-system/components.md → Alert */

type Tone = "error" | "success" | "info";

const tones: Record<Tone, { box: string; Icon: typeof Info }> = {
  error: { box: "border-erro/40 bg-erro/10 text-erro", Icon: CircleAlert },
  success: { box: "border-sucesso/40 bg-sucesso/10 text-sucesso", Icon: CircleCheck },
  info: { box: "border-accent/40 bg-accent/10 text-accent-2", Icon: Info },
};

/** Sem `message` não renderiza nada — e anima a entrada e a saída. */
export function Alert({ tone = "error", message }: { tone?: Tone; message?: string }) {
  const { box, Icon } = tones[tone];
  return (
    <AnimatePresence initial={false}>
      {message && (
        <m.div
          key={message}
          // error interrompe o leitor de tela; os outros esperam a vez
          role={tone === "error" ? "alert" : "status"}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } }}
          exit={{ opacity: 0, transition: { duration: duration.fast } }}
          className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm ${box}`}
        >
          <Icon aria-hidden className="mt-px size-4 shrink-0" />
          <span>{message}</span>
        </m.div>
      )}
    </AnimatePresence>
  );
}
