import "server-only";
import postgres from "postgres";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { serverEnv } from "@/server/env";
import * as schema from "./schema";

/**
 * Cliente único do banco: postgres.js + Drizzle.
 *
 * Por que postgres.js: é o driver que o Drizzle e o Supabase recomendam
 * para Node, sem dependência nativa, com pool embutido e pipelining.
 *
 * O pool é UM por processo. Em dev, o hot reload reavalia este módulo a
 * cada salvamento — sem o `globalThis`, cada salvamento abriria um pool
 * novo e deixaria o anterior pendurado até estourar o limite do pooler.
 */

export type Db = PostgresJsDatabase<typeof schema> & {
  $client: postgres.Sql;
};

const globalForDb = globalThis as unknown as { __bigetteDb?: Db };

function createDb(): Db {
  const env = serverEnv();

  const client = postgres(env.DATABASE_POSTGRES_URL, {
    // Por instância. O gargalo real é o pooler do Supabase, não este número.
    max: env.DB_POOL_MAX,
    // OBRIGATÓRIO no pooler em modo transação: cada statement pode cair
    // numa conexão diferente do Postgres, e prepared statement não
    // sobrevive a isso ("prepared statement does not exist").
    prepare: false,
    // Solta conexão ociosa rápido — instância serverless congelada
    // segurando conexão é o gargalo clássico.
    idle_timeout: 20,
    // Recicla conexão de vida longa (evita conexão "zumbi" após failover).
    max_lifetime: 60 * 30,
    // Falha rápido em vez de pendurar a requisição.
    connect_timeout: 10,
    connection: { application_name: "bigette-lp" },
    onnotice: () => {},
  });

  return drizzle(client, { schema, casing: "snake_case" });
}

/** Devolve o banco, criando o pool no primeiro uso. */
export function getDb(): Db {
  if (!globalForDb.__bigetteDb) globalForDb.__bigetteDb = createDb();
  return globalForDb.__bigetteDb;
}
