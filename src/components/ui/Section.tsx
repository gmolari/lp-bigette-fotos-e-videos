import { Reveal } from "./Reveal";

type Props = {
  children: React.ReactNode;
  id?: string;
  /** fundo levemente mais claro, para alternar o ritmo da página */
  alt?: boolean;
  /** sem fundo: deixa a cena 3D aparecer atrás */
  transparente?: boolean;
  /** marca a seção como zona onde a cena 3D roda */
  cena3d?: boolean;
  className?: string;
};

export function Section({
  children,
  id,
  alt = false,
  transparente = false,
  cena3d = false,
  className = "",
}: Props) {
  const fundo = transparente ? "" : alt ? "bg-bg-2" : "bg-bg";
  return (
    <section
      id={id}
      data-cena3d={cena3d ? "" : undefined}
      className={`relative z-1 py-20 sm:py-[104px] ${fundo} ${className}`}
    >
      <div className="container-lp">{children}</div>
    </section>
  );
}

/**
 * Etiqueta acima do título. O traço à esquerda cresce quando a seção
 * entra na tela — é o que dá a sensação de que a página está se
 * montando na frente de quem lê, e não apenas aparecendo.
 */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <Reveal variante="left" className="mb-5 flex items-center gap-3">
      <span
        aria-hidden="true"
        className="h-px w-9 origin-left bg-ouro/70 transition-transform duration-700 ease-[var(--ease-out)]"
      />
      <p className="text-[11px] font-semibold tracking-[0.24em] text-ouro uppercase">
        {children}
      </p>
    </Reveal>
  );
}

export function Title({
  children,
  className = "",
  delay = 60,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <Reveal variante="cortina" delay={delay}>
      <h2
        className={`mb-6 font-display text-[clamp(30px,5vw,50px)] leading-[1.08] tracking-[-0.015em] ${className}`}
      >
        {children}
      </h2>
    </Reveal>
  );
}

export function Lead({
  children,
  className = "",
  delay = 140,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <Reveal variante="up" delay={delay}>
      <p
        className={`max-w-[56ch] text-[clamp(17px,2.1vw,21px)] leading-relaxed text-muted ${className}`}
      >
        {children}
      </p>
    </Reveal>
  );
}
