"use client";

import { ErrorScreen } from "@/components/panel/ErrorScreen";

/** Pega erro de renderização no login (fora da área logada). */
export default function PanelError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className="grid min-h-svh place-items-center px-4">
      <ErrorScreen {...props} homeHref="/login" />
    </main>
  );
}
