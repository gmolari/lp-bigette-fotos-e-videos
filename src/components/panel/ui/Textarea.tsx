"use client";

import { useId } from "react";
import { describedBy, FieldShell } from "./FieldShell";

/** Spec: .claude/design-system/components.md → Textarea */

export type TextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> & {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

export function Textarea({ label, hint, error, id, className, disabled, rows = 3, ...textarea }: TextareaProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <FieldShell inputId={inputId} label={label} hint={hint} error={error} disabled={disabled} multiline className={className}>
      <textarea
        id={inputId}
        rows={rows}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, hint, error)}
        className="w-full min-w-0 resize-y bg-transparent px-3.5 py-2.5 leading-relaxed text-cream placeholder:text-muted/60 disabled:cursor-not-allowed"
        {...textarea}
      />
    </FieldShell>
  );
}
