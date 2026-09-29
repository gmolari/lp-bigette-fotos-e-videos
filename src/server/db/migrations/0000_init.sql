-- Migration inicial, sem tabelas.
-- Existe para provar o encanamento de ponta a ponta: o primeiro
-- `npm run db:migrate` cria o schema `drizzle` e a tabela de controle
-- `drizzle.__drizzle_migrations`, e a página /status/db passa a mostrar
-- "Migrations aplicadas: 1". Não toca no schema `public`.
select 1;
