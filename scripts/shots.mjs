/**
 * Captura a página em 10 posições de scroll e reporta quantos elementos
 * de revelação ficaram travados.
 *
 * Existe porque este projeto já publicou uma versão em que NENHUM título
 * aparecia e ninguém percebeu lendo o código — ver docs/09-movimento-3d.md.
 *
 *   npm run dev
 *   npm run shots                       # usa localhost:3000 e ./shots
 *   npm run shots -- http://... ./saida
 *
 * Usa o Chrome do sistema; o download do Chromium do Playwright não é
 * necessário.
 */
import { chromium } from 'playwright';
const alvo = process.argv[2] || 'http://localhost:3002/';
const dir  = process.argv[3] || './shots';
const b = await chromium.launch({ executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome-stable', args:['--no-sandbox','--enable-gpu','--use-gl=swiftshader'] });
const pg = await (await b.newContext({ viewport:{width:1440,height:900}, deviceScaleFactor:1 })).newPage();
const erros=[];
pg.on('console', m => { if(m.type()==='error') erros.push(m.text()); });
pg.on('pageerror', e => erros.push('PAGEERROR: '+e.message));
await pg.goto(alvo, { waitUntil:'networkidle' });
const alt = await pg.evaluate(()=>document.documentElement.scrollHeight);
console.log('altura da página:', alt, 'px =', (alt/900).toFixed(1), 'viewports');
const paradas = [0, .08, .17, .28, .40, .52, .64, .76, .88, 1];
for (const [i,p] of paradas.entries()) {
  await pg.evaluate(y => window.scrollTo(0,y), Math.round((alt-900)*p));
  await pg.waitForTimeout(1100);
  await pg.screenshot({ path: `${dir}/${String(i).padStart(2,'0')}-${Math.round(p*100)}pc.png` });
}
// diagnóstico dos reveals
const diag = await pg.evaluate(()=>{
  const els=[...document.querySelectorAll('[data-reveal]')];
  const semShow = els.filter(e=>e.getAttribute('data-shown')!=='true');
  return {
    total: els.length,
    naoRevelados: semShow.length,
    exemplos: semShow.slice(0,8).map(e=>({variante:e.getAttribute('data-reveal'), texto:(e.innerText||'').slice(0,42), clip:getComputedStyle(e).clipPath, op:getComputedStyle(e).opacity})),
  };
});
console.log(JSON.stringify(diag,null,1));
console.log('ERROS DE CONSOLE:', erros.length ? erros.slice(0,6) : 'nenhum');
await b.close();
