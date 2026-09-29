"use client";

import { useSyncExternalStore } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";

const noSubscribe = () => () => {};
const isCoarsePointer = () => window.matchMedia("(pointer: coarse)").matches;

/**
 * UM provider por tela. O HTML5Backend não aceita dois ao mesmo tempo
 * ("Cannot have two HTML5 backends at the same time") — e a tela de
 * seções tem três listas ordenáveis. Cada lista separa as suas pelo
 * `type` do item, não por provider.
 *
 * O HTML5Backend não funciona com o dedo — e o painel é usado no
 * celular. Em tela de toque entra o TouchBackend, com atraso de 200 ms:
 * sem ele, qualquer rolagem que começasse em cima de uma foto viraria
 * arrasto.
 */
export function PanelDndProvider({ children }: { children: React.ReactNode }) {
  const coarse = useSyncExternalStore(noSubscribe, isCoarsePointer, () => false);
  return (
    <DndProvider
      key={coarse ? "touch" : "mouse"}
      backend={coarse ? TouchBackend : HTML5Backend}
      options={coarse ? { delayTouchStart: 200 } : undefined}
    >
      {children}
    </DndProvider>
  );
}
