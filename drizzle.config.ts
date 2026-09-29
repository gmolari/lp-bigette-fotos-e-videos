import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Carrega .env / .env.local exatamente como o Next carrega.
loadEnvConfig(process.cwd());

// drizzle-kit usa o pooler em modo SESSÃO (5432): migration precisa de
// sessão de verdade — DDL em transação e advisory lock.
const url = process.env.DATABASE_POSTGRES_URL_NON_POOLING;
if (!url) {
  throw new Error(
    "DATABASE_POSTGRES_URL_NON_POOLING não definida. Veja .env.example.",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema/index.ts",
  out: "./src/server/db/migrations",
  dbCredentials: { url },
  // Precisa bater com o `casing` do cliente em src/server/db/client.ts
  casing: "snake_case",
  migrations: { schema: "drizzle", table: "__drizzle_migrations" },
  // Só olha o schema public — auth/storage/realtime são do Supabase
  schemaFilter: ["public"],
  strict: true,
  verbose: true,
});
