// ── sRGB <-> OKLab/OKLCH (Björn Ottosson) + WCAG 2.1 contrast ──────────
const srgbToLinear = c => c <= 0.04045 ? c/12.92 : ((c+0.055)/1.055)**2.4;
const linearToSrgb = c => c <= 0.0031308 ? 12.92*c : 1.055*Math.pow(c,1/2.4)-0.055;

function hexToRgb(hex){const h=hex.replace('#','');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255);}
function rgbToHex([r,g,b]){const f=v=>Math.round(Math.min(1,Math.max(0,v))*255).toString(16).padStart(2,'0');return '#'+f(r)+f(g)+f(b);}

function rgbToOklab([r,g,b]){
  const R=srgbToLinear(r),G=srgbToLinear(g),B=srgbToLinear(b);
  const l=Math.cbrt(0.4122214708*R+0.5363325363*G+0.0514459929*B);
  const m=Math.cbrt(0.2119034982*R+0.6806995451*G+0.1073969566*B);
  const s=Math.cbrt(0.0883024619*R+0.2817188376*G+0.6299787005*B);
  return [0.2104542553*l+0.7936177850*m-0.0040720468*s,
          1.9779984951*l-2.4285922050*m+0.4505937099*s,
          0.0259040371*l+0.7827717662*m-0.8086757660*s];
}
function oklabToRgb([L,a,bb]){
  const l=(L+0.3963377774*a+0.2158037573*bb)**3;
  const m=(L-0.1055613458*a-0.0638541728*bb)**3;
  const s=(L-0.0894841775*a-1.2914855480*bb)**3;
  return [linearToSrgb(+4.0767416621*l-3.3077115913*m+0.2309699292*s),
          linearToSrgb(-1.2684380046*l+2.6097574011*m-0.3413193965*s),
          linearToSrgb(-0.0041960863*l-0.7034186147*m+1.7076147010*s)];
}
const toLCH=([L,a,b])=>[L,Math.hypot(a,b),(Math.atan2(b,a)*180/Math.PI+360)%360];
const fromLCH=([L,C,H])=>[L,C*Math.cos(H*Math.PI/180),C*Math.sin(H*Math.PI/180)];

const inGamut=rgb=>rgb.every(v=>v>=-0.0005&&v<=1.0005);
/** Reduz chroma até caber no sRGB — preserva L e H, que é o que importa. */
function lchToHex(L,C,H){
  let lo=0,hi=C;
  if(inGamut(oklabToRgb(fromLCH([L,C,H])))) return rgbToHex(oklabToRgb(fromLCH([L,C,H])));
  for(let i=0;i<40;i++){const mid=(lo+hi)/2;
    if(inGamut(oklabToRgb(fromLCH([L,mid,H])))) lo=mid; else hi=mid;}
  return rgbToHex(oklabToRgb(fromLCH([L,lo,H])));
}
const hexToLCH=h=>toLCH(rgbToOklab(hexToRgb(h)));

// WCAG 2.1 relative luminance + contrast ratio
function lum(hex){const [r,g,b]=hexToRgb(hex).map(srgbToLinear);return 0.2126*r+0.7152*g+0.0722*b;}
function contraste(a,b){const l1=lum(a),l2=lum(b);const [hi,lo]=l1>l2?[l1,l2]:[l2,l1];return (hi+0.05)/(lo+0.05);}
const nota=r=>r>=7?'AAA':r>=4.5?'AA':r>=3?'AA-large':'REPROVA';

// ── ANÁLISE DA COR BASE ───────────────────────────────────────────────
const BASE='#9F9AB8';
const [L0,C0,H0]=hexToLCH(BASE);
console.log('BASE  '+BASE);
console.log(`  OKLCH  L=${L0.toFixed(4)}  C=${C0.toFixed(4)}  H=${H0.toFixed(2)}°`);
console.log(`  HSL    ${(()=>{const [r,g,b]=hexToRgb(BASE);const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;const l=(mx+mn)/2;const s=d===0?0:d/(1-Math.abs(2*l-1));let h=0;if(d){h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;if(h<0)h+=360;}return `H=${h.toFixed(1)}° S=${(s*100).toFixed(1)}% L=${(l*100).toFixed(1)}%`;})()}`);
console.log(`  → chroma ${C0.toFixed(4)} é baixíssimo (lilás vivo fica em 0.09–0.15). Vou subir mantendo H=${H0.toFixed(1)}°.\n`);

export { L0,C0,H0,lchToHex,hexToLCH,contraste,nota,lum };
