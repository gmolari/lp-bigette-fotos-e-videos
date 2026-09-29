import "server-only";
import bcrypt from "bcrypt";

/** Custo 12 ≈ 150–250 ms por hash: lento contra força bruta, rápido no login. */
export const BCRYPT_COST = 12;

export const hashPassword = (plain: string) => bcrypt.hash(plain, BCRYPT_COST);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);
