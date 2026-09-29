"use client";

import { panelContent } from "@/config/panel-content";
import { ROLES } from "@/modules/users/domain/user";
import { Field } from "../ui/Field";
import { PasswordField } from "../ui/PasswordField";
import { Select } from "../ui/Select";

const f = panelContent.fields;
const c = panelContent.common;
const roleOptions = ROLES.map((r) => ({ value: r, label: panelContent.roles[r] }));

type Bind = {
  name: string;
  value: string;
  error?: string;
  onChange: (e: { target: { value: string } }) => void;
};

/** Campos comuns de criar/editar usuário (admin). */
export function UserFields({
  field,
  mode,
  roleLocked,
}: {
  field: (name: "name" | "email" | "username" | "role" | "password") => Bind;
  mode: "create" | "edit";
  /** Rebaixar a si mesmo sendo o único admin: o servidor recusa, mas nem oferecemos. */
  roleLocked?: boolean;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label={f.name} optionalLabel={c.optional} autoComplete="off" {...field("name")} />
      <Select label={f.role} options={roleOptions} disabled={roleLocked} {...field("role")} />
      <Field label={f.email} type="email" autoComplete="off" {...field("email")} />
      <Field
        label={f.username}
        hint={f.usernameHint}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        {...field("username")}
      />
      <PasswordField
        className="sm:col-span-2"
        label={mode === "create" ? f.password : f.newPasswordOptional}
        optionalLabel={mode === "edit" ? c.optional : undefined}
        hint={mode === "create" ? f.passwordHint : f.newPasswordOptionalHint}
        autoComplete="new-password"
        {...field("password")}
      />
    </div>
  );
}
