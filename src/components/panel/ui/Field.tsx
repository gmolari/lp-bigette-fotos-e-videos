"use client";

import { useId } from "react";
import { controlInputClass, describedBy, FieldShell } from "./FieldShell";

/** Spec: .claude/design-system/components.md → Field */

export type FieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  /** Mostra "(opcional)" ao lado do rótulo. */
  optionalLabel?: string;
  /** Elemento à direita, dentro do contorno (ex.: botão do olho). */
  trailing?: React.ReactNode;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function Field({
  label,
  hint,
  error,
  optionalLabel,
  trailing,
  id,
  className,
  disabled,
  ...input
}: FieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <FieldShell
      inputId={inputId}
      label={label}
      optionalLabel={optionalLabel}
      hint={hint}
      error={error}
      disabled={disabled}
      className={className}
    >
      <input
        id={inputId}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, hint, error)}
        className={controlInputClass}
        {...input}
      />
      {trailing}
    </FieldShell>
  );
}
