import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/server/auth/jwt";
import {
  accessKeyMatches,
  ACCESS_PARAM,
  GATE_COOKIE,
  GATE_MAX_AGE,
  gateCookieMatches,
  gateToken,
  getGateKey,
} from "@/server/panel/gate";

/**
 * Duas camadas na frente do painel:
 *
 * 1. PORTÃO — sem o cookie do link especial, as rotas do painel NÃO
 *    EXISTEM: respondem o 404 padrão, idêntico ao de uma URL inventada.
 *    Nada de 401/403 — isso confirmaria que há algo ali.
 * 2. SESSÃO — com o portão aberto, as páginas internas exigem o JWT;
 *    sem ele, vão para /login.
 *
 * ⚠️ O proxy NÃO manda quem tem JWT de /login para dentro. O JWT pode
 * ter assinatura válida e estar morto (senha trocada → session_version
 * mudou). O proxy só vê a assinatura; o layout vê o banco. Se os dois
 * redirecionassem, seria loop infinito /login ↔ /pictures — aconteceu
 * no teste. Quem decide "já logado" em /login é a página, pelo banco.
 *
 * Isto é checagem OTIMISTA (só lê cookie). A autorização de verdade
 * acontece de novo em cada server action (src/server/action.ts), porque
 * uma action pode ser chamada por POST em qualquer URL, sem passar aqui.
 */

const LOGIN = "/login";

export async function proxy(req: NextRequest) {
  const key = getGateKey();
  if (!key) return notFound(req);

  // Entrada pelo link especial: troca a chave por cookie e limpa a URL
  const received = req.nextUrl.searchParams.get(ACCESS_PARAM);
  if (received !== null) {
    if (!(await accessKeyMatches(received, key))) return notFound(req);

    const clean = req.nextUrl.clone();
    clean.searchParams.delete(ACCESS_PARAM);
    const res = NextResponse.redirect(clean);
    res.cookies.set(GATE_COOKIE, await gateToken(key), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // lax, não strict: o link chega por navegação vinda de outro site
      // (WhatsApp, e-mail); com strict o cookie não iria no redirect.
      sameSite: "lax",
      path: "/",
      maxAge: GATE_MAX_AGE,
    });
    return noIndex(res);
  }

  if (!(await gateCookieMatches(req.cookies.get(GATE_COOKIE)?.value, key))) {
    return notFound(req);
  }

  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const isLogin = req.nextUrl.pathname === LOGIN;

  if (!session && !isLogin) return noIndex(redirectTo(req, LOGIN));

  return noIndex(NextResponse.next());
}

function redirectTo(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

/** Reescreve para uma rota que não existe → o not-found padrão, com 404. */
function notFound(req: NextRequest) {
  return noIndex(NextResponse.rewrite(new URL("/__not-found__", req.url)));
}

function noIndex(res: NextResponse) {
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  // Nem navegador nem CDN guardam página do painel
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

// Literal obrigatório: o Next lê o matcher estaticamente no build.
export const config = {
  matcher: [
    "/login/:path*",
    "/pictures/:path*",
    "/profile/:path*",
    "/sections/:path*",
    "/users/:path*",
  ],
};
