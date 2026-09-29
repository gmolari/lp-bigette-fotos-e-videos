import { jwtVerify, SignJWT } from "jose";
import { ConfigError } from "@/lib/action/result";

/**
 * JWT da sessão (HS256, via `jose`).
 *
 * Sem `server-only`: o `proxy.ts` também verifica o token. `jose` usa
 * Web Crypto, então roda em qualquer runtime.
 */

export const SESSION_COOKIE = "bgt_session";
/** 7 dias. Expirou → login de novo. */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const ISSUER = "bigette-panel";
const AUDIENCE = "bigette-panel";
const MIN_SECRET_LENGTH = 32;

/**
 * Só identidade + versão. Nada que mude (e-mail, papel) vai no token:
 * isso é lido do banco a cada requisição, então rebaixar alguém vale na
 * hora, e não daqui a 7 dias quando o token vencer.
 */
export type SessionPayload = {
  /** id do usuário (uuid) */
  sub: string;
  /** users.session_version no momento do login. Diferente do banco → sessão morta. */
  ver: number;
};

function secret(): Uint8Array | null {
  const s = process.env.AUTH_JWT_SECRET?.trim();
  return s && s.length >= MIN_SECRET_LENGTH ? new TextEncoder().encode(s) : null;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const key = secret();
  if (!key) throw new ConfigError("AUTH_JWT_SECRET ausente ou com menos de 32 caracteres");

  return new SignJWT({ ver: payload.ver })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(key);
}

/** Token válido → payload. Qualquer problema (expirado, adulterado, sem segredo) → null. */
export async function verifySession(
  token: string | undefined,
): Promise<SessionPayload | null> {
  const key = secret();
  if (!token || !key) return null;
  try {
    const { payload } = await jwtVerify(token, key, {
      issuer: ISSUER,
      audience: AUDIENCE,
      // Fixa o algoritmo: impede o ataque do `alg: none` / troca de algoritmo
      algorithms: ["HS256"],
    });
    if (typeof payload.sub !== "string" || typeof payload.ver !== "number") {
      return null;
    }
    return { sub: payload.sub, ver: payload.ver };
  } catch {
    return null;
  }
}
