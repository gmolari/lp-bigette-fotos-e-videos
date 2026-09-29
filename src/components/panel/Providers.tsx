"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { domAnimation, LazyMotion, MotionConfig } from "motion/react";
import { ActionError, RETRYABLE } from "@/lib/action/hooks";

/**
 * Provedores SÓ do painel. A landing page não carrega React Query nem
 * Motion — continua com o pacote que já tinha.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // useState, não constante de módulo: um QueryClient por navegador, nunca
  // compartilhado entre requisições no servidor.
  const [client] = useState(() => {
    /**
     * Sessão morreu no meio do uso (expirou, senha trocada em outro lugar,
     * usuário excluído): qualquer consulta ou mutação que receba
     * UNAUTHENTICATED leva ao login. A mensagem ainda aparece no lugar do
     * erro até a navegação terminar.
     */
    const onError = (error: unknown) => {
      if (error instanceof ActionError && error.code === "UNAUTHENTICATED") {
        router.replace("/login");
        router.refresh();
      }
    };

    return new QueryClient({
      queryCache: new QueryCache({ onError }),
      mutationCache: new MutationCache({ onError }),
      defaultOptions: {
        queries: {
          staleTime: 30_000,
          // Cada refetch é uma server action, e elas rodam em fila
          refetchOnWindowFocus: false,
          // Só o que é passageiro (rede, banco fora, timeout) merece nova tentativa
          retry: (count, error) =>
            error instanceof ActionError && RETRYABLE.has(error.code) && count < 2,
          retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
        },
        // Mutação nunca repete sozinha: pode ter salvo e só a resposta se perdido
        mutations: { retry: false },
      },
    });
  });

  return (
    <QueryClientProvider client={client}>
      {/* LazyMotion + `m.*`: ~5 KB em vez dos ~34 KB do `motion.*` completo */}
      <LazyMotion features={domAnimation} strict>
        {/* Respeita prefers-reduced-motion: transform some, opacidade fica */}
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </LazyMotion>
      {/* Em produção o pacote exporta um componente vazio */}
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
