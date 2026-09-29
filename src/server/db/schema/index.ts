/**
 * Schema do Drizzle — ponto único que o drizzle-kit e o cliente leem.
 * Cada módulo declara as tabelas em
 * `src/modules/<module>/infrastructure/schema.ts` e reexporta aqui.
 */
export * from "../../../modules/users/infrastructure/schema";
export * from "../../../modules/pictures/infrastructure/schema";
export * from "../../../modules/sections/infrastructure/schema";
