/**
 * Uma foto como a landing page a consome. Separado de `portfolio.ts`
 * porque aquele é só servidor, e a grade e a cena 3D são cliente.
 *
 * `formato` faz três coisas ao mesmo tempo: a proporção na grade, quais
 * ocupam duas colunas, e o formato do papel pendurado no varal 3D.
 */
export type FotoPortfolio = {
  src: string;
  alt: string;
  formato: "paisagem" | "retrato";
};

/**
 * O vídeo da página: link do YouTube, já resolvido no servidor. A capa é
 * a foto escolhida no painel ou, sem ela, a miniatura do próprio YouTube.
 */
export type VideoDaPagina = {
  youtubeId: string;
  vertical: boolean;
  /** Título do YouTube — vai no `title` do iframe. */
  titulo: string;
  capa: FotoPortfolio;
};
