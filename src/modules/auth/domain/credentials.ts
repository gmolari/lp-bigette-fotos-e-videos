import { z } from "zod";
import { panelContent } from "@/config/panel-content";

const t = panelContent.login.validation;

/**
 * Login aceita e-mail OU username no mesmo campo. Tem "@" → e-mail.
 * Sem validar formato aqui de propósito: dizer "username inválido" já
 * contaria que as regras existem. Qualquer erro vira "credenciais incorretas".
 */
export const credentialsSchema = z.object({
  identifier: z.string().trim().toLowerCase().min(1, { error: t.identifierRequired }),
  password: z.string().min(1, { error: t.passwordRequired }),
});

export type Credentials = z.output<typeof credentialsSchema>;
