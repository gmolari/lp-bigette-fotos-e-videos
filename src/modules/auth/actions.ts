"use server";

import { z } from "zod";
import { panelContent } from "@/config/panel-content";
import { DomainError } from "@/lib/action/result";
import { drizzleUserRepository } from "@/modules/users/infrastructure/repository";
import { createAction } from "@/server/action";
import { verifyPassword } from "@/server/auth/password";
import { getDb } from "@/server/db/client";
import { signIn as signInUseCase } from "./application/sign-in";
import { credentialsSchema } from "./domain/credentials";
import { endSession, startSession } from "./guards";

/** Login. Só exige o portão — é justamente quem ainda não tem sessão. */
export const signIn = createAction(
  { name: "auth.signIn", input: credentialsSchema, guard: "gate" },
  async (credentials) => {
    const user = await signInUseCase(
      { users: drizzleUserRepository(getDb()), verify: verifyPassword },
      credentials,
    );
    if (!user) throw new DomainError(panelContent.login.invalidCredentials);

    await startSession(user);
    return null;
  },
);

/** Logout. Só o portão: apagar um cookie vencido não deveria falhar. */
export const signOut = createAction({ name: "auth.signOut", input: z.void(), guard: "gate" }, async () => {
  await endSession();
  return null;
});
