"use client";

import { AnimatePresence, m } from "motion/react";
import { duration, ease } from "../motion/tokens";

/**
 * Casca comum de Field, PasswordField e Select: rótulo, contorno com
 * foco (`.field-control`), dica e erro animado. Os IDs de acessibilidade
 * vêm de quem usa.
 */
export function FieldShell({
  inputId,
  label,
  optionalLabel,
  hint,
  error,
  disabled,
  className = "",
  children,
}: {
  inputId: string;
  label: string;
  optionalLabel?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`group flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={inputId}
        className={[
          "flex items-baseline gap-1.5 text-sm font-medium transition-colors duration-200",
          error ? "text-erro" : "text-cream group-focus-within:text-accent-2",
        ].join(" ")}
      >
        {label}
        {optionalLabel && <span className="text-xs font-normal text-muted">({optionalLabel})</span>}
      </label>

      <div
        className="field-control"
        data-invalid={error ? "true" : undefined}
        data-disabled={disabled ? "true" : undefined}
      >
        {children}
      </div>

      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}

      <AnimatePresence initial={false}>
        {error && (
          <m.p
            key="error"
            id={`${inputId}-error`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } }}
            exit={{ opacity: 0, transition: { duration: duration.fast } }}
            className="text-xs text-erro"
          >
            {error}
          </m.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function describedBy(inputId: string, hint?: string, error?: string) {
  return [hint && !error && `${inputId}-hint`, error && `${inputId}-error`].filter(Boolean).join(" ") || undefined;
}

/** Classes do <input>/<select> dentro do contorno. */
export const controlInputClass =
  "h-full w-full min-w-0 bg-transparent px-3.5 text-cream placeholder:text-muted/60 disabled:cursor-not-allowed";
