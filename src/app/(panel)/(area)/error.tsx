"use client";

import { ErrorScreen } from "@/components/panel/ErrorScreen";

/** Erro de renderização dentro da área logada: a navegação continua de pé. */
export default function AreaError(props: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorScreen {...props} homeHref="/pictures" />;
}
