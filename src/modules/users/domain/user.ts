import { z } from "zod";
import { panelContent } from "@/config/panel-content";

/**
 * Regras de usuário. Compartilhado cliente/servidor: o mesmo esquema
 * valida no navegador (resposta na hora) e na action (o cliente mente).
 */

const v = panelContent.users.validation;

export const ROLES = ["admin", "member"] as const;
export type Role = (typeof ROLES)[number];

export const PASSWORD_MIN_LENGTH = 8;
/** bcrypt ignora tudo depois do 72º BYTE (não caractere) — acento conta 2. */
export const PASSWORD_MAX_BYTES = 72;
/** Igual ao CHECK `users_username_format` no banco. */
export const USERNAME_PATTERN = /^[a-z][a-z0-9._-]{2,29}$/;

export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: v.email }));

export const usernameField = z
  .string()
  .trim()
  .toLowerCase()
  .regex(USERNAME_PATTERN, { error: v.username });

/** Opcional: vazio vira null. */
export const nameField = z
  .string()
  .trim()
  .max(80, { error: v.nameTooLong })
  .transform((s) => s || null);

export const newPasswordField = z
  .string()
  .min(PASSWORD_MIN_LENGTH, { error: v.passwordTooShort })
  .refine((s) => new TextEncoder().encode(s).length <= PASSWORD_MAX_BYTES, {
    error: v.passwordTooLong,
  });

export const roleField = z.enum(ROLES, { error: v.role });

/** Perfil: o próprio usuário edita. */
export const profileSchema = z.object({
  name: nameField,
  email: emailField,
  username: usernameField,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { error: v.passwordRequired }),
    newPassword: newPasswordField,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    error: v.passwordMismatch,
  });

/** Admin cria. */
export const createUserSchema = profileSchema.extend({
  role: roleField,
  password: newPasswordField,
});

/** Admin edita. Senha em branco = não mexe. */
export const updateUserSchema = profileSchema.extend({
  id: z.uuid(),
  role: roleField,
  password: z
    .union([z.literal(""), newPasswordField])
    .optional()
    .transform((s) => s || undefined),
});

export const userIdSchema = z.object({ id: z.uuid() });

/** O que pode sair do servidor. Sem hash, sem versão de sessão. */
export type PublicUser = {
  id: string;
  email: string;
  username: string;
  name: string | null;
  role: Role;
  lastLoginAt: Date | null;
  createdAt: Date;
};
