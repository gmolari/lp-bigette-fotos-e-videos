"use client";

import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { Eye, EyeOff } from "lucide-react";
import { panelContent } from "@/config/panel-content";
import { duration, ease } from "../motion/tokens";
import { Field, type FieldProps } from "./Field";

/** Spec: .claude/design-system/components.md → PasswordField */

const t = panelContent.common;

export function PasswordField(props: Omit<FieldProps, "type" | "trailing">) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <Field
      {...props}
      type={visible ? "text" : "password"}
      // Senha visível não deve ir para o corretor/sugestões do teclado
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          // Não rouba o foco do campo: quem está digitando continua digitando
          onMouseDown={(e) => e.preventDefault()}
          aria-label={visible ? t.hidePassword : t.showPassword}
          aria-pressed={visible}
          aria-controls={props.id}
          disabled={props.disabled}
          className={[
            "mr-1 grid size-9 shrink-0 place-items-center rounded-lg text-muted",
            "transition-colors duration-200 hover:bg-bg-3 hover:text-cream",
            "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent-2",
          ].join(" ")}
        >
          <AnimatePresence mode="wait" initial={false}>
            <m.span
              key={visible ? "off" : "on"}
              initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0, transition: { duration: duration.fast, ease: ease.out } }}
              exit={{ opacity: 0, scale: 0.6, transition: { duration: duration.instant } }}
              className="grid place-items-center"
            >
              <Icon aria-hidden className="size-4" />
            </m.span>
          </AnimatePresence>
        </button>
      }
    />
  );
}
