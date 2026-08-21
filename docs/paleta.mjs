import { L0,C0,H0,lchToHex,hexToLCH,contraste,nota } from './cor.mjs';

const H = H0;                    // 292.88° — a hue da cor que você mandou
const R = d => (H + d + 360) % 360;

console.log('═══ RELAÇÕES DE TEORIA DAS CORES a partir de H=' + H.toFixed(2) + '° ═══\n');
const rel = [
  ['Base (lilás)',           R(0)],
  ['Complementar',           R(180)],
  ['Split-complementar A',   R(150)],
  ['Split-complementar B',   R(210)],
  ['Triádica A',             R(120)],
  ['Triádica B',             R(240)],
  ['Análoga −30',            R(-30)],
  ['Análoga +30',            R(30)],
  ['Tetrádica (retângulo)',  R(60)],
];
for (const [nome,h] of rel)
  console.log(`  ${nome.padEnd(24)} H=${h.toFixed(2).padStart(6)}°   amostra L=.72 C=.14 → ${lchToHex(0.72,0.14,h)}`);

console.log('\n  Escolha: SPLIT-COMPLEMENTAR A (H=' + R(150).toFixed(1) + '°, âmbar/ouro).');
console.log('  A complementar pura (H=' + R(180).toFixed(1) + '°) cai no verde-limão e brigaria');
console.log('  com o verde do WhatsApp, que é cor de marca e não posso mexer.\n');

const AMBAR = R(150);
const TEAL  = R(240);   // triádica B — reserva

// ── RAMPA ──────────────────────────────────────────────────────────────
const p = {};
const set = (k,L,C,h)=>{p[k]=lchToHex(L,C,h);return p[k];};

// Neutros tingidos de lilás: chroma mínimo, mas o preto deixa de ser cinza
set('bg',      0.1450, 0.0180, H);
set('bg2',     0.1980, 0.0240, H);
set('bg3',     0.2520, 0.0290, H);
set('cream',   0.9650, 0.0110, H);
set('muted',   0.7350, 0.0280, H);

// Lilás — a cor da marca. Chroma subiu de 0.044 para 0.13–0.16.
set('lilas200',0.8800, 0.0750, H);
set('lilas300',0.8100, 0.1150, H);
set('lilas400',0.7300, 0.1450, H);   // ← o "sucessor" da sua cor base
set('lilas500',0.6450, 0.1650, H);
set('lilas600',0.5500, 0.1600, H);

// Âmbar/ouro — contraponto split-complementar
set('ouro300', 0.8600, 0.1150, AMBAR);
set('ouro400', 0.7900, 0.1400, AMBAR);
set('ouro500', 0.7150, 0.1450, AMBAR);

// Tintas escuras para texto sobre botão claro
set('inkLilas',0.2000, 0.0700, H);
set('inkOuro', 0.2100, 0.0600, AMBAR);

console.log('═══ PALETA (hex) ═══');
for (const [k,v] of Object.entries(p)) {
  const [L,C,h]=hexToLCH(v);
  console.log(`  ${k.padEnd(9)} ${v}   L=${L.toFixed(3)} C=${C.toFixed(3)} H=${h.toFixed(1)}°`);
}

// ── CONTRASTE WCAG 2.1 ────────────────────────────────────────────────
console.log('\n═══ CONTRASTE WCAG 2.1 ═══');
const checks = [
  ['texto corpo',        p.cream,   p.bg,      4.5],
  ['texto corpo /bg2',   p.cream,   p.bg2,     4.5],
  ['texto secundário',   p.muted,   p.bg,      4.5],
  ['texto secund. /bg2', p.muted,   p.bg2,     4.5],
  ['texto secund. /bg3', p.muted,   p.bg3,     4.5],
  ['lilás 300 /bg',      p.lilas300,p.bg,      4.5],
  ['lilás 400 /bg',      p.lilas400,p.bg,      4.5],
  ['lilás 400 /bg2',     p.lilas400,p.bg2,     4.5],
  ['ouro 400 /bg',       p.ouro400, p.bg,      4.5],
  ['ouro 400 /bg2',      p.ouro400, p.bg2,     4.5],
  ['ink sobre lilás400', p.inkLilas,p.lilas400,4.5],
  ['ink sobre ouro400',  p.inkOuro, p.ouro400, 4.5],
  ['#06301A sobre wpp',  '#06301A', '#25D366', 4.5],
];
let falhou=0;
for (const [nome,fg,bg,alvo] of checks){
  const r=contraste(fg,bg); const ok=r>=alvo;
  if(!ok) falhou++;
  console.log(`  ${ok?'✓':'✗'} ${nome.padEnd(22)} ${fg} sobre ${bg}  =  ${r.toFixed(2)}:1  ${nota(r)}`);
}
console.log(falhou? `\n  ${falhou} REPROVAÇÕES` : '\n  Todos os pares passam em AA (4.5:1) ou melhor.');

// harmonia com o verde do WhatsApp
const [,,hw]=hexToLCH('#25D366');
console.log(`\n  WhatsApp #25D366 está em H=${hw.toFixed(1)}° — a ${Math.min(Math.abs(hw-H),360-Math.abs(hw-H)).toFixed(0)}° do lilás.`);
console.log(`  Distância quase triádica: convive sem competir.`);
