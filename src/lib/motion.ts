/**
 * Utilidades de movimento.
 * Regra da casa: nenhuma animação começa sem antes perguntar se a
 * pessoa pediu movimento reduzido no sistema.
 */

/** A pessoa pediu menos movimento no sistema operacional? */
export function semMovimento(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** O navegador tem WebGL utilizável? */
export function suportaWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return Boolean(
      c.getContext("webgl2") ??
        c.getContext("webgl") ??
        c.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

/**
 * O aparelho aguenta a cena 3D?
 * Tela pequena, pouca memória ou pouco núcleo ficam de fora — não por
 * capricho: nesse projeto a maior parte do tráfego vem do link da bio,
 * ou seja, celular. Lá a página tem que abrir, não impressionar.
 */
let _aguenta: boolean | null = null;
export function aguentaCena3D(): boolean {
  // Memorizado: a checagem cria um <canvas> para testar WebGL, e o
  // useSyncExternalStore chama isto com frequência.
  if (_aguenta !== null) return _aguenta;
  _aguenta = calcularAguenta();
  return _aguenta;
}

function calcularAguenta(): boolean {
  if (typeof window === "undefined") return false;
  if (semMovimento() || !suportaWebGL()) return false;
  if (window.innerWidth < 900) return false;

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  if (nav.connection?.saveData) return false;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4) return false;
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency < 4)
    return false;

  return true;
}

export const clamp = (v: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Interpolação estável independente do frame rate. */
export const damp = (a: number, b: number, taxa: number, dt: number) =>
  lerp(a, b, 1 - Math.exp(-taxa * dt));

/** Progresso 0→1 do scroll da página inteira. */
export function progressoDaPagina(): number {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  return total <= 0 ? 0 : clamp(window.scrollY / total);
}

/** Progresso 0→1 de um elemento atravessando a tela (para seções presas). */
export function progressoDoElemento(el: HTMLElement): number {
  const r = el.getBoundingClientRect();
  const total = r.height - window.innerHeight;
  if (total <= 0) return 0;
  return clamp(-r.top / total);
}

/**
 * Tempos da troca de texto entre paradas do varal, em ms.
 *
 * Moram aqui porque dois arquivos precisam dos MESMOS números e não
 * podem se importar: `Sala.tsx` usa como duração das transições CSS e
 * `cenas.ts` usa a entrada como tempo mínimo de permanência antes de
 * anunciar a parada seguinte. `Sala.tsx` não pode importar de
 * `cenas.ts` sem arrastar o three.js para o pacote principal.
 *
 * A saída é MAIS CURTA que a entrada de propósito: as duas começam no
 * mesmo instante, então o texto que sai precisa sumir antes que o que
 * entra fique legível. Iguais, dá para ler os dois ao mesmo tempo —
 * e dois textos legíveis empilhados é o que o olho lê como tremida.
 */
export const MS_ENTRADA_PARADA = 440;
export const MS_SAIDA_PARADA = 200;
/** Quanto a parada que saiu leva para terminar de derivar para fora.
 *  Maior que a saída de propósito: quando esses ms correm, o bloco já
 *  está invisível — quem marca o tempo da troca é o esmaecimento. */
export const MS_DERIVA_PARADA = 360;
