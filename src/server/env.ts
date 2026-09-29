import "server-only";
import { z } from "zod";
import { ConfigError } from "@/lib/action/result";

/**
 * Variáveis de ambiente do SERVIDOR, validadas com zod.
 *
 * Validação preguiçosa, de propósito: a landing page não usa banco, e
 * precisa continuar buildando e subindo num ambiente sem as
 * credenciais. Quem chamar `serverEnv()` sem elas recebe o erro na
 * hora, com o nome da variável — não um `Invalid URL` longe daqui.
 */
const schema = z.object({
  /** Pooler do Supabase em modo transação (6543). Runtime da aplicação. */
  DATABASE_POSTGRES_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  /** Conexões por instância. Em serverless, instâncias × isto chega ao pooler. */
  DB_POOL_MAX: z.coerce.number().int().min(1).max(20).default(5),
});

export type ServerEnv = z.infer<typeof schema>;

let cached: ServerEnv | undefined;

export function serverEnv(): ServerEnv {
  if (cached) return cached;

  const result = schema.safeParse({
    DATABASE_POSTGRES_URL: process.env.DATABASE_POSTGRES_URL,
    // Campo vazio no .env chega como "" — trata como ausente, cai no padrão
    DB_POOL_MAX: process.env.DB_POOL_MAX || undefined,
  });

  if (!result.success) {
    throw new ConfigError(
      `Variáveis de ambiente do servidor inválidas:\n${z.prettifyError(result.error)}\n` +
        "Veja .env.example e .claude/specs/001-database-connection.md",
    );
  }

  cached = result.data;
  return cached;
}

/**
 * Vercel Blob, validado À PARTE do banco: sem credencial, só o envio e a
 * exclusão de foto falham — o resto do painel (e a leitura das fotos
 * já cadastradas) continua funcionando.
 *
 * Dois jeitos de autenticar, nesta ordem:
 *  1. `BLOB_READ_WRITE_TOKEN`: token fixo. Funciona igual no local e no
 *     deploy, sem depender da CLI da Vercel. Tem prioridade porque, com
 *     ele definido, é a credencial que certamente está presente.
 *  2. OIDC (padrão da Vercel desde 2026): ligar o store ao projeto injeta
 *     `BLOB_STORE_ID`, e o SDK pega o `VERCEL_OIDC_TOKEN` sozinho — nos
 *     deploys, direto; no local, só depois de `vercel env pull`.
 */
const blobSchema = z
  .object({
    BLOB_STORE_ID: z
      .string()
      .trim()
      .regex(/^store_[A-Za-z0-9]+$/, { error: 'formato "store_<id>"' })
      .optional(),
    BLOB_READ_WRITE_TOKEN: z
      .string()
      .trim()
      .startsWith("vercel_blob_rw_", { error: 'deve começar com "vercel_blob_rw_"' })
      .optional(),
  })
  .refine((e) => e.BLOB_STORE_ID || e.BLOB_READ_WRITE_TOKEN, {
    error: "defina BLOB_STORE_ID (OIDC) ou BLOB_READ_WRITE_TOKEN",
  });

/** `token` só existe no modo token; no modo OIDC o SDK resolve sozinho. */
export type BlobAuth = { mode: "oidc"; token?: undefined } | { mode: "token"; token: string };

let cachedBlob: BlobAuth | undefined;

export function blobEnv(): BlobAuth {
  if (cachedBlob) return cachedBlob;

  const result = blobSchema.safeParse({
    // Campo vazio no .env chega como "" — trata como ausente
    BLOB_STORE_ID: process.env.BLOB_STORE_ID || undefined,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN || undefined,
  });
  if (!result.success) {
    throw new ConfigError(
      `Credencial do Vercel Blob ausente ou inválida:\n${z.prettifyError(result.error)}\n` +
        "Veja .env.example e .claude/specs/005-portfolio-pictures.md",
    );
  }

  const { BLOB_READ_WRITE_TOKEN } = result.data;
  // Passar `token` ao SDK desliga o OIDC — então só quando ele existe
  cachedBlob = BLOB_READ_WRITE_TOKEN ? { mode: "token", token: BLOB_READ_WRITE_TOKEN } : { mode: "oidc" };
  return cachedBlob;
}
