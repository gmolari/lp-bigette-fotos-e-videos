"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { controlInputClass, describedBy, FieldShell } from "./FieldShell";

/**
 * <select> NATIVO estilizado: acessível de graça e com o seletor do
 * sistema no celular. Spec: .claude/design-system/components.md → Select
 */
export function Select({
  label,
  name,
  value,
  onChange,
  options,
  hint,
  error,
  disabled,
  id,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: readonly { value: string; label: string }[];
  hint?: string;
  error?: string;
  disabled?: boolean;
  id?: string;
}) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <FieldShell inputId={inputId} label={label} hint={hint} error={error} disabled={disabled}>
      <div className="relative h-full w-full">
        <select
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, hint, error)}
          className={`${controlInputClass} appearance-none pr-10`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-bg-2 text-cream">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
        />
      </div>
    </FieldShell>
  );
}
