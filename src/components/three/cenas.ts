/**
 * ─────────────────────────────────────────────────────────────────────
 *  AS CENAS 3D
 *
 *  Duas, e as duas vivem dentro de uma seção — não mais atrás da página
 *  inteira. Fundo 3D permanente disputava atenção com todo o resto e
 *  deixava a página com ar de demonstração de biblioteca.
 *
 *  1. O VARAL — prints pendurados num arame numa sala escura, secando.
 *     A câmera percorre o varal em quatro paradas, com mudança de
 *     distância focal entre elas (é o que dá a leitura de câmera de
 *     verdade, e não de "objeto girando"). A seção fica presa na tela
 *     enquanto isso: quem rola não sente que desceu a página, sente que
 *     a cena andou.
 *
 *  2. AS POLAROIDES — um carrossel lento de fotos reveladas, ambiente,
 *     fechando a página. Não depende do scroll: só existe e respira.
 *
 *  Este módulo é carregado por import() dinâmico. O three.js inteiro
 *  fica num chunk separado que só desce quando `aguentaCena3D()` aprova
 *  o aparelho — em celular, nunca.
 * ─────────────────────────────────────────────────────────────────────
 */
import * as THREE from "three";
import { MS_ENTRADA_PARADA, clamp, damp, lerp } from "@/lib/motion";
import { content } from "@/config/content";

/** As mesmas fotos do portfólio alimentam as duas cenas. */
const FOTOS = content.sala.fotos.map((f) => f.src);
/** Em pé ou deitada — decide o formato do papel pendurado. */
const DEITADA = content.sala.fotos.map((f) => f.formato === "paisagem");

/**
 * As fotos reais já foram entregues?
 *
 * Uma única requisição HEAD na primeira, memorizada. Sem isso seriam 19
 * erros 404 no console toda vez que a página abre enquanto o portfólio
 * não chega — e um console cheio de erro inofensivo é a melhor forma de
 * esconder o erro que importa.
 */
let _temFotos: Promise<boolean> | null = null;
function fotosEntregues(): Promise<boolean> {
  _temFotos ??= fetch(FOTOS[0], { method: "HEAD" })
    .then((r) => r.ok)
    .catch(() => false);
  return _temFotos;
}

function carregarImagem(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/** Desenha a imagem preenchendo a área, cortando o excesso (object-fit: cover). */
function desenharCobrindo(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  l: number,
  a: number,
) {
  const escala = Math.max(l / img.width, a / img.height);
  const il = img.width * escala;
  const ia = img.height * escala;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, l, a);
  ctx.clip();
  ctx.drawImage(img, x + (l - il) / 2, y + (a - ia) / 2, il, ia);
  ctx.restore();
}

const COR = {
  fundo: 0x0a0911,
  luzChave: 0xfff1dd,
  luzPreenche: 0x8f7ad0,
  papel: 0xf3f2fa,
  arame: 0x4a4360,
};

/** Suaviza a entrada e a saída de cada trecho entre duas paradas. */
const suave = (t: number) => t * t * (3 - 2 * t);

export type Palco = {
  setProgresso: (p: number) => void;
  setAtivo: (ativo: boolean) => void;
  redimensionar: () => void;
  destruir: () => void;
  /** avisa qual parada está ativa, para o texto trocar junto */
  aoTrocarEstacao?: (i: number) => void;
  /** progresso contínuo 0→1 do percurso, um aviso por quadro */
  aoProgredir?: (p: number) => void;
};

/**
 * Textura de um print pendurado: papel fotográfico com margem branca.
 *
 * Com `foto`, a imagem real é composta dentro da margem. Sem ela, o
 * miolo é um gradiente com realce — a cena não finge ter portfólio que
 * ainda não existe, mesma postura do <Placeholder> do resto da página.
 * Basta pôr os arquivos em public/portfolio/ que a troca é automática.
 */
function texturaDePrint(
  i: number,
  foto?: HTMLImageElement | null,
): THREE.CanvasTexture {
  const L = 300;
  const A = 375;
  const cv = document.createElement("canvas");
  cv.width = L;
  cv.height = A;
  const c = cv.getContext("2d")!;

  // papel
  c.fillStyle = "#efe9e0";
  c.fillRect(0, 0, L, A);

  // área da imagem, com margem de papel fotográfico
  const m = 16;
  const iw = L - m * 2;
  const ih = A - m * 2 - 26; // margem maior embaixo, como cópia de laboratório

  if (foto) {
    desenharCobrindo(c, foto, m, m, iw, ih);
  } else {
    const tons = [
      ["#9b86c4", "#2b2340"],
      ["#c2a0a8", "#3a2a3c"],
      ["#8f8bc0", "#241f38"],
      ["#d0a992", "#42302e"],
      ["#a394d4", "#282348"],
      ["#b58fb0", "#33243a"],
      ["#8b93c8", "#1f2036"],
    ][i % 7];

    const g = c.createLinearGradient(m, m, m + iw * 0.7, m + ih);
    g.addColorStop(0, tons[0]);
    g.addColorStop(1, tons[1]);
    c.fillStyle = g;
    c.fillRect(m, m, iw, ih);

    // luz principal na imagem
    const cx = m + iw * (0.34 + (i % 3) * 0.15);
    const cy = m + ih * (0.28 + (i % 4) * 0.09);
    const luz = c.createRadialGradient(cx, cy, 2, cx, cy, iw * 0.8);
    luz.addColorStop(0, "rgba(255,244,232,0.72)");
    luz.addColorStop(0.5, "rgba(214,196,248,0.22)");
    luz.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = luz;
    c.fillRect(m, m, iw, ih);

    // grão de filme — só no procedural: numa foto de verdade, sujaria
    const px = c.getImageData(m, m, iw, ih);
    for (let k = 0; k < px.data.length; k += 4) {
      const n = (Math.random() - 0.5) * 20;
      px.data[k] += n;
      px.data[k + 1] += n;
      px.data[k + 2] += n;
    }
    c.putImageData(px, m, m);
  }

  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function montarRenderer(canvas: HTMLCanvasElement) {
  const r = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  r.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.05;
  return r;
}

/** Poeira suspensa no feixe de luz — dá volume ao vazio. */
function criarPoeira(qtd: number, raio: number, prof: number) {
  const pos = new Float32Array(qtd * 3);
  for (let i = 0; i < qtd; i++) {
    const a = (i * 2.399) % (Math.PI * 2);
    const r = ((i * 37) % 100) / 100;
    pos[i * 3] = Math.cos(a) * raio * r;
    pos[i * 3 + 1] = (((i * 53) % 100) / 100 - 0.5) * raio;
    pos[i * 3 + 2] = (((i * 71) % 100) / 100 - 0.5) * prof;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xd8d0ff,
    size: 0.028,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  return { pontos: new THREE.Points(geo, mat), geo, mat };
}

/* ═══════════════════════════════════════════════════════════════════
   1. O VARAL
   ═══════════════════════════════════════════════════════════════════ */

/** As quatro paradas da câmera. Posição, alvo e distância focal. */
const PARADAS = [
  // abre larga, com o arame inteiro no quadro
  { pos: [-8.6, 1.7, 9.4], alvo: [-6.4, 0.95, 0], fov: 44 },
  // fecha num print, ainda mostrando de onde ele pende
  { pos: [-3.5, 1.05, 5.4], alvo: [-2.9, 0.95, 0], fov: 34 },
  // sobe e olha de cima, do outro lado
  { pos: [2.1, 2.5, 5.6], alvo: [2.4, 0.85, 0], fov: 40 },
  // recua para o convite
  { pos: [7.6, 1.5, 10.2], alvo: [3.2, 1.0, 0], fov: 52 },
];

/**
 * Quanto o assunto é empurrado para a direita do quadro, em fração da
 * largura. O texto vive na metade esquerda, então a câmera descentra o
 * ponto principal em vez de mirar torto — é o equivalente ao
 * deslocamento de uma lente tilt-shift, e mantém as verticais retas.
 *
 * Subiu de 0,20 para 0,27 quando os prints deitados entraram: sendo
 * quase 30% mais largos que os em pé, eles avançavam sobre o texto.
 */
const DESLOCA_X = 0.27;

/**
 * Zona morta da troca de parada, em unidades de parada.
 *
 * Só passa de uma parada para outra depois de ±0,62 — o que deixa uma
 * faixa de 0,24 em volta de cada fronteira onde nada acontece. É o que
 * impede o valor amortecido de trocar ida e volta quando o scroll para
 * bem em cima de uma fronteira.
 */
const ZONA_MORTA = 0.62;

export function criarVaral(canvas: HTMLCanvasElement): Palco {
  const renderer = montarRenderer(canvas);
  const cena = new THREE.Scene();
  cena.fog = new THREE.FogExp2(COR.fundo, 0.042);

  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 60);
  const lixo: Array<{ dispose: () => void }> = [];

  // ── luz ──────────────────────────────────────────────────────────
  cena.add(new THREE.AmbientLight(COR.luzPreenche, 0.55));
  const chave = new THREE.DirectionalLight(COR.luzChave, 2.1);
  chave.position.set(-4, 5, 6);
  cena.add(chave);
  const contra = new THREE.DirectionalLight(0xac95fa, 0.9);
  contra.position.set(6, 2, -5);
  cena.add(contra);

  // ── o arame, com barriga ─────────────────────────────────────────
  const N = 7;
  const curva = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-11, 2.5, 0),
    new THREE.Vector3(-5.5, 2.05, 0.15),
    new THREE.Vector3(0, 1.92, 0),
    new THREE.Vector3(5.5, 2.05, -0.15),
    new THREE.Vector3(11, 2.5, 0),
  ]);
  const geoArame = new THREE.TubeGeometry(curva, 90, 0.014, 5, false);
  const matArame = new THREE.MeshStandardMaterial({
    color: COR.arame,
    roughness: 0.7,
    metalness: 0.5,
  });
  lixo.push(geoArame, matArame);
  cena.add(new THREE.Mesh(geoArame, matArame));

  // ── os prints pendurados ─────────────────────────────────────────
  const prints: THREE.Group[] = [];
  const materiaisPrint: THREE.MeshStandardMaterial[] = [];
  // Uma geometria por formato. Um varal só de retrato fica com cara de
  // catálogo; misturar em pé e deitada é o que faz parecer trabalho.
  const geoRetrato = new THREE.PlaneGeometry(1.5, 1.875);
  const geoPaisagem = new THREE.PlaneGeometry(1.98, 1.42);
  const geoPrendedor = new THREE.BoxGeometry(0.1, 0.17, 0.05);
  const matPrendedor = new THREE.MeshStandardMaterial({
    color: COR.papel,
    roughness: 0.85,
  });
  lixo.push(geoRetrato, geoPaisagem, geoPrendedor, matPrendedor);

  for (let i = 0; i < N; i++) {
    const t = 0.09 + (i / (N - 1)) * 0.82;
    const p = curva.getPointAt(t);

    const g = new THREE.Group();
    g.position.set(p.x, p.y, p.z);

    const tex = texturaDePrint(i);
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.94,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    lixo.push(tex, mat);
    materiaisPrint.push(mat);

    const deitada = DEITADA[i % DEITADA.length];
    const print = new THREE.Mesh(deitada ? geoPaisagem : geoRetrato, mat);
    // pendura pelo topo: o papel deitado desce menos que o em pé
    print.position.y = deitada ? -0.84 : -1.05;
    g.add(print);

    const prendedor = new THREE.Mesh(geoPrendedor, matPrendedor);
    prendedor.position.y = -0.06;
    g.add(prendedor);

    // cada print pende com uma inclinação própria — varal não é régua
    g.userData.base = ((i * 7919) % 100) / 100 - 0.5;
    g.rotation.y = g.userData.base * 0.5;
    cena.add(g);
    prints.push(g);
  }

  const { pontos, geo: gp, mat: mp } = criarPoeira(260, 9, 8);
  lixo.push(gp, mp);
  cena.add(pontos);

  // ── estado ───────────────────────────────────────────────────────
  let destruido = false;
  let progresso = 0;
  let suavizado = 0;
  let ativo = false;
  let raf = 0;
  let ultimo = 0;
  let estacaoAtual = -1;
  let ultimaAvisada = -1;
  let avisadaEm = -Infinity;
  const palco: Palco = {
    setProgresso: (p) => {
      progresso = clamp(p);
    },
    setAtivo,
    redimensionar,
    destruir,
  };

  function redimensionar() {
    const l = canvas.clientWidth || window.innerWidth;
    const a = canvas.clientHeight || window.innerHeight;
    renderer.setSize(l, a, false);
    camera.aspect = l / a;
    // Em tela estreita não há coluna de texto ao lado: o assunto volta
    // para o centro e o texto passa a ficar por cima, com véu por baixo.
    if (l >= 900) camera.setViewOffset(l, a, -l * DESLOCA_X, 0, l, a);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }

  const vPos = new THREE.Vector3();
  const vAlvo = new THREE.Vector3();

  function quadro(agora: number) {
    raf = requestAnimationFrame(quadro);
    const dt = Math.min((agora - ultimo) / 1000, 0.05);
    ultimo = agora;
    suavizado = damp(suavizado, progresso, 4.2, dt);
    const t = agora / 1000;

    // trecho entre duas paradas
    const escala = suavizado * (PARADAS.length - 1);
    const i = Math.min(Math.floor(escala), PARADAS.length - 2);
    const f = suave(clamp(escala - i));
    const a = PARADAS[i];
    const b = PARADAS[i + 1];

    vPos.set(
      lerp(a.pos[0], b.pos[0], f),
      lerp(a.pos[1], b.pos[1], f),
      lerp(a.pos[2], b.pos[2], f),
    );
    vAlvo.set(
      lerp(a.alvo[0], b.alvo[0], f),
      lerp(a.alvo[1], b.alvo[1], f),
      lerp(a.alvo[2], b.alvo[2], f),
    );

    // respiração lenta, para a câmera nunca ficar morta parada
    camera.position.set(
      vPos.x + Math.sin(t * 0.21) * 0.09,
      vPos.y + Math.cos(t * 0.17) * 0.07,
      vPos.z,
    );
    camera.lookAt(vAlvo);

    const fov = lerp(a.fov, b.fov, f);
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix(); // preserva o viewOffset já definido
    }

    // os prints balançam de leve, cada um no seu tempo
    for (let k = 0; k < prints.length; k++) {
      const g = prints[k];
      const base = g.userData.base as number;
      g.rotation.z = Math.sin(t * 0.55 + k * 1.4) * 0.028;
      g.rotation.y = base * 0.5 + Math.sin(t * 0.33 + k) * 0.055;
    }
    pontos.rotation.y = t * 0.02;

    // Avisa a troca de parada, com zona morta.
    //
    // Antes era Math.round(escala), e isso piscava: quando o scroll para
    // perto de uma fronteira (escala ≈ 1,5), o valor amortecido oscila em
    // torno dela e o arredondamento troca de parada ida e volta a cada
    // quadro — um render do React por quadro, texto tremendo.
    //
    // Com a zona morta a parada só muda depois de ±0,62, o que deixa uma
    // faixa de 0,24 onde nada acontece. Fronteira parada não pisca mais.
    if (estacaoAtual < 0) {
      estacaoAtual = Math.round(escala);
    } else if (Math.abs(escala - estacaoAtual) > ZONA_MORTA) {
      // Vai DIRETO para a parada mais próxima, sem passar pelas do
      // meio. Antes isto era `estacaoAtual + 1`, um passo por quadro:
      // num fling a câmera cruzava duas paradas e as duas eram
      // renderizadas, a primeira só para ser trocada logo em seguida.
      estacaoAtual = clamp(Math.round(escala), 0, PARADAS.length - 1);
    }

    // Tempo mínimo de permanência.
    //
    // A zona morta resolve o scroll parado em cima de uma fronteira,
    // mas não resolve o scroll RÁPIDO. Medido com roda de verdade:
    //
    //   roda lenta   → trocas a cada 1387–1816 ms   ok
    //   roda comum   → trocas a cada  615– 653 ms   ok
    //   fling        → trocas a cada  179– 339 ms   ← a transição
    //                                                dura 440 ms
    //
    // No fling o bloco novo era substituído antes de terminar de
    // entrar: nunca chegava a opacidade 1 e nunca chegava ao lugar.
    // Isso é a tremida. Segurando o aviso até a transição anterior
    // fechar, o fling passa a anunciar só a parada onde ele PAROU —
    // que é a única que a pessoa tem tempo de ler.
    if (
      estacaoAtual !== ultimaAvisada &&
      agora - avisadaEm >= MS_ENTRADA_PARADA
    ) {
      ultimaAvisada = estacaoAtual;
      avisadaEm = agora;
      palco.aoTrocarEstacao?.(estacaoAtual);
    }
    // O progresso contínuo alimenta a barra do percurso. Vai por
    // callback e não por estado do React — é um valor por quadro.
    palco.aoProgredir?.(suavizado);

    renderer.render(cena, camera);
  }

  function setAtivo(v: boolean) {
    if (v === ativo) return;
    ativo = v;
    if (v) {
      suavizado = progresso; // sem corrida de recuperação ao voltar
      ultimo = performance.now();
      raf = requestAnimationFrame(quadro);
    } else {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  function destruir() {
    destruido = true;
    cancelAnimationFrame(raf);
    for (const d of lixo) d.dispose();
    renderer.dispose();
  }

  redimensionar();
  // Assim que as fotos existirem em public/portfolio/, os prints deixam
  // de ser desenho e passam a ser o trabalho dela.
  void aplicarFotosReais(materiaisPrint, texturaDePrint, lixo, () => !destruido);
  return palco;
}

/* ═══════════════════════════════════════════════════════════════════
   2. AS POLAROIDES — fecho da página
   ═══════════════════════════════════════════════════════════════════ */

/** Polaroide: papel quadrado com a imagem deslocada para cima. */
function texturaDePolaroide(
  i: number,
  foto?: HTMLImageElement | null,
): THREE.CanvasTexture {
  const cv = document.createElement("canvas");
  cv.width = 270;
  cv.height = 324;
  const c = cv.getContext("2d")!;
  c.fillStyle = "#f6f4ef";
  c.fillRect(0, 0, 270, 324);

  if (foto) {
    desenharCobrindo(c, foto, 18, 18, 234, 220);
  } else {
    const tons = [
      ["#a692cd", "#332a4c"],
      ["#c79fae", "#3f2d3c"],
      ["#8f8fc4", "#26243a"],
      ["#d2a795", "#42302c"],
    ][i % 4];
    const g = c.createLinearGradient(18, 18, 200, 250);
    g.addColorStop(0, tons[0]);
    g.addColorStop(1, tons[1]);
    c.fillStyle = g;
    c.fillRect(18, 18, 234, 220);
    const luz = c.createRadialGradient(110, 90, 4, 110, 90, 190);
    luz.addColorStop(0, "rgba(255,245,232,0.66)");
    luz.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = luz;
    c.fillRect(18, 18, 234, 220);
  }

  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/**
 * Troca as texturas procedurais pelas fotos reais, se elas existirem.
 *
 * A cena aparece na hora com o desenho procedural e faz o upgrade
 * depois — ninguém espera download para ver a página se mexer.
 */
async function aplicarFotosReais(
  materiais: THREE.MeshStandardMaterial[],
  fazerTextura: (i: number, foto: HTMLImageElement) => THREE.CanvasTexture,
  lixo: Array<{ dispose: () => void }>,
  aindaVivo: () => boolean,
) {
  if (!(await fotosEntregues()) || !aindaVivo()) return;

  await Promise.all(
    materiais.map(async (mat, i) => {
      const foto = await carregarImagem(FOTOS[i % FOTOS.length]);
      if (!foto || !aindaVivo()) return;
      const nova = fazerTextura(i, foto);
      mat.map?.dispose();
      mat.map = nova;
      mat.needsUpdate = true;
      lixo.push(nova);
    }),
  );
}

export function criarPolaroides(canvas: HTMLCanvasElement): Palco {
  const renderer = montarRenderer(canvas);
  const cena = new THREE.Scene();
  cena.fog = new THREE.FogExp2(COR.fundo, 0.055);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40);
  camera.position.set(0, 0.4, 8.2);

  const lixo: Array<{ dispose: () => void }> = [];
  cena.add(new THREE.AmbientLight(COR.luzPreenche, 0.7));
  const chave = new THREE.DirectionalLight(COR.luzChave, 1.7);
  chave.position.set(3, 4, 6);
  cena.add(chave);

  // uma polaroide: quadrado de papel, imagem descentralizada para cima
  const geo = new THREE.PlaneGeometry(1.35, 1.62);
  lixo.push(geo);
  const materiais: THREE.MeshStandardMaterial[] = [];

  const anel = new THREE.Group();
  const QTD = 12;
  const polas: THREE.Mesh[] = [];
  for (let i = 0; i < QTD; i++) {
    const tex = texturaDePolaroide(i);
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.92,
      side: THREE.DoubleSide,
    });
    lixo.push(tex, mat);
    materiais.push(mat);

    const m = new THREE.Mesh(geo, mat);
    const ang = (i / QTD) * Math.PI * 2;
    const r = 3.5;
    m.position.set(Math.cos(ang) * r, ((i % 3) - 1) * 0.5, Math.sin(ang) * r);
    m.rotation.y = -ang + Math.PI / 2;
    m.rotation.z = (((i * 31) % 100) / 100 - 0.5) * 0.28;
    m.userData.fase = i * 0.83;
    anel.add(m);
    polas.push(m);
  }
  anel.rotation.x = 0.14;
  cena.add(anel);

  const { pontos, geo: gp, mat: mp } = criarPoeira(180, 6, 6);
  lixo.push(gp, mp);
  cena.add(pontos);

  let ativo = false;
  let raf = 0;
  let ultimo = 0;
  let progresso = 0;
  let suavizado = 0;
  let destruido = false;

  function redimensionar() {
    const l = canvas.clientWidth || window.innerWidth;
    const a = canvas.clientHeight || window.innerHeight;
    renderer.setSize(l, a, false);
    camera.aspect = l / a;
    camera.updateProjectionMatrix();
  }

  function quadro(agora: number) {
    raf = requestAnimationFrame(quadro);
    const dt = Math.min((agora - ultimo) / 1000, 0.05);
    ultimo = agora;
    suavizado = damp(suavizado, progresso, 3, dt);
    const t = agora / 1000;

    // gira sozinho, devagar; o scroll só acrescenta um empurrão
    anel.rotation.y = t * 0.075 + suavizado * 1.1;
    for (const m of polas) {
      const fase = m.userData.fase as number;
      m.position.y += Math.sin(t * 0.6 + fase) * 0.0016;
    }
    camera.position.y = 0.4 + Math.sin(t * 0.24) * 0.16;
    camera.lookAt(0, 0, 0);
    pontos.rotation.y = -t * 0.03;

    renderer.render(cena, camera);
  }

  redimensionar();
  void aplicarFotosReais(materiais, texturaDePolaroide, lixo, () => !destruido);
  return {
    setProgresso: (p) => {
      progresso = clamp(p);
    },
    setAtivo(v) {
      if (v === ativo) return;
      ativo = v;
      if (v) {
        ultimo = performance.now();
        raf = requestAnimationFrame(quadro);
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    redimensionar,
    destruir() {
      destruido = true;
      cancelAnimationFrame(raf);
      for (const d of lixo) d.dispose();
      renderer.dispose();
    },
  };
}
