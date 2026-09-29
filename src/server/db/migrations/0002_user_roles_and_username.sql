-- Papéis (admin/member), username e versão de sessão.
--
-- Editada à mão: o drizzle-kit gera `ADD COLUMN username text NOT NULL`,
-- que falha com a linha que já existe. Aqui: adiciona nulável → preenche
-- a partir do e-mail → só então NOT NULL.
--
-- Quem já existia vira ADMIN: antes desta migration não havia papéis e
-- todo usuário tinha acesso total. Rebaixar em silêncio trancaria a dona
-- do painel para fora da tela de usuários.
CREATE TYPE "public"."user_role" AS ENUM('admin', 'member');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'member' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "session_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
WITH base AS (
  SELECT id,
         regexp_replace(lower(split_part(email, '@', 1)), '[^a-z0-9._-]', '', 'g') AS raw
  FROM "users"
), fixed AS (
  SELECT id,
         left(CASE WHEN raw ~ '^[a-z]' THEN raw ELSE 'u' || raw END, 26) AS name,
         row_number() OVER (PARTITION BY left(CASE WHEN raw ~ '^[a-z]' THEN raw ELSE 'u' || raw END, 26) ORDER BY id) AS rn
  FROM base
)
UPDATE "users" u
-- rpad TAMBÉM corta: só aplica quando o nome tem menos de 3 caracteres
SET username = CASE
      WHEN length(f.name || CASE WHEN f.rn > 1 THEN f.rn::text ELSE '' END) < 3
        THEN rpad(f.name || CASE WHEN f.rn > 1 THEN f.rn::text ELSE '' END, 3, '0')
      ELSE f.name || CASE WHEN f.rn > 1 THEN f.rn::text ELSE '' END
    END,
    role = 'admin'
FROM fixed f
WHERE u.id = f.id;--> statement-breakpoint
UPDATE "users" SET email = lower(email) WHERE email <> lower(email);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_lowercase" CHECK ("users"."email" = lower("users"."email"));--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_format" CHECK ("users"."username" ~ '^[a-z][a-z0-9._-]{2,29}$');
