/**
 * Cria (ou atualiza) um usuário do painel pelo terminal.
 *
 *   npm run user:create -- <email> <username> [--admin] [--name "Nome"]
 *
 *   npm run user:create -- bigette@example.com bigette --admin --name "Bigette"
 *
 * - A senha é pedida no terminal, sem eco — nunca por argumento, que
 *   ficaria no histórico do shell.
 * - Se o e-mail já existe: troca senha e username (e vira admin com
 *   --admin), e derruba as sessões abertas dele.
 * - É a porta de entrada do PRIMEIRO admin. Depois, admins criam os
 *   demais pela tela /users.
 *
 * Roda fora do Next (tsx): não importa nada com `server-only`.
 * Usa a URL sem pooler, como o drizzle-kit.
 */
import { loadEnvConfig } from "@next/env";
import bcrypt from "bcrypt";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "../src/modules/users/infrastructure/schema";

// Mesmos valores de src/modules/users/domain e src/server/auth/password —
// duplicados porque aqueles importam config/zod de alias que o tsx não resolve.
const BCRYPT_COST = 12;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_BYTES = 72;
const USERNAME_PATTERN = /^[a-z][a-z0-9._-]{2,29}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

loadEnvConfig(process.cwd());

function parseArgs(argv: string[]) {
  const positional: string[] = [];
  let admin = false;
  let name: string | null = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--admin") admin = true;
    else if (argv[i] === "--name") name = argv[++i]?.trim() || null;
    else positional.push(argv[i]);
  }
  const [email, username] = positional.map((s) => s.trim().toLowerCase());
  return { email, username, admin, name };
}

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    process.stdout.write(question);
    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let value = "";
    const onData = (ch: string) => {
      if (ch === "\r" || ch === "\n" || ch === "\u0004") {
        stdin.setRawMode?.(false);
        stdin.pause();
        stdin.off("data", onData);
        process.stdout.write("\n");
        resolve(value);
      } else if (ch === "\u0003") {
        process.exit(130);
      } else if (ch === "\u007f") {
        value = value.slice(0, -1);
      } else {
        value += ch;
      }
    };
    stdin.on("data", onData);
  });
}

async function main() {
  const { email, username, admin, name } = parseArgs(process.argv.slice(2));
  if (!email || !EMAIL_PATTERN.test(email) || !username) {
    console.error('Uso: npm run user:create -- <email> <username> [--admin] [--name "Nome"]');
    process.exit(1);
  }
  if (!USERNAME_PATTERN.test(username)) {
    throw new Error("Username: 3 a 30 caracteres, a-z 0-9 . _ -, começando com letra.");
  }

  const url = process.env.DATABASE_POSTGRES_URL_NON_POOLING;
  if (!url) throw new Error("DATABASE_POSTGRES_URL_NON_POOLING não definida");

  const password = await askHidden("Senha: ");
  const confirm = await askHidden("Repita a senha: ");
  if (password !== confirm) throw new Error("As senhas não conferem.");
  if (password.length < PASSWORD_MIN_LENGTH) throw new Error(`Mínimo de ${PASSWORD_MIN_LENGTH} caracteres.`);
  if (Buffer.byteLength(password) > PASSWORD_MAX_BYTES) {
    throw new Error(`Máximo de ${PASSWORD_MAX_BYTES} bytes (limite do bcrypt).`);
  }

  const client = postgres(url, { max: 1 });
  try {
    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
    const [row] = await drizzle(client, { casing: "snake_case" })
      .insert(users)
      .values({ email, username, name, passwordHash, role: admin ? "admin" : "member" })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          username,
          passwordHash,
          sessionVersion: sql`${users.sessionVersion} + 1`,
          ...(name ? { name } : {}),
          ...(admin ? { role: "admin" as const } : {}),
        },
      })
      .returning({ id: users.id, email: users.email, username: users.username, role: users.role });
    console.log(`✓ ${row.role === "admin" ? "Admin" : "Membro"} pronto: ${row.email} · @${row.username} (${row.id})`);
  } catch (e) {
    const code = (e as { code?: string; constraint_name?: string }).code;
    if (code === "23505") throw new Error(`Username "${username}" já pertence a outra conta.`);
    throw e;
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(`✗ ${(e as Error).message}`);
  process.exit(1);
});
