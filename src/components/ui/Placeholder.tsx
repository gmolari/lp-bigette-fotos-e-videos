import { ImageIcon } from "lucide-react";

/**
 * Espaço reservado das seções SEM foto provisória (Sobre, Vídeo): aparece
 * enquanto o painel (/sections) não tiver foto para elas. Onde existe
 * provisória (banner, cordel, polaroides), ela é usada no lugar disto.
 */
export function Placeholder({
  label,
  ratio = "aspect-[3/4]",
  className = "",
}: {
  label: string;
  ratio?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-[16px] border border-dashed border-lilas-400/20 bg-bg-2 p-4 text-center ${ratio} ${className}`}
    >
      <ImageIcon
        size={22}
        strokeWidth={1.4}
        aria-hidden="true"
        className="text-lilas-400/45"
      />
      <span className="text-[11px] tracking-[0.18em] text-muted/55 uppercase">
        {label}
      </span>
    </div>
  );
}
