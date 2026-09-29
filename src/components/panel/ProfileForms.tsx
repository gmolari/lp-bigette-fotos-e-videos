"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { panelContent } from "@/config/panel-content";
import { useActionForm } from "@/lib/form/useActionForm";
import { changeMyPassword, updateMyProfile } from "@/modules/users/actions";
import { changePasswordSchema, profileSchema, type PublicUser } from "@/modules/users/domain/user";
import { ActionAlert } from "./ui/ActionAlert";
import { Alert } from "./ui/Alert";
import { Button } from "./ui/Button";
import { Field } from "./ui/Field";
import { Panel } from "./ui/Panel";
import { PasswordField } from "./ui/PasswordField";

const t = panelContent.profile;
const f = panelContent.fields;
const c = panelContent.common;

export function ProfileForms({ user }: { user: PublicUser }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const profile = useActionForm(profileSchema, updateMyProfile, {
    initialValues: { name: user.name, email: user.email, username: user.username },
    syncFromResult: (u) => ({ name: u.name, email: u.email, username: u.username }),
    onSuccess: () => {
      // Lista de usuários (se admin) e o que o servidor renderizou ficam velhos
      queryClient.invalidateQueries({ queryKey: ["users"] });
      router.refresh();
    },
  });

  const password = useActionForm(changePasswordSchema, changeMyPassword, {
    initialValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    resetOnSuccess: true,
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title={t.dataTitle} lead={t.dataLead}>
        <form onSubmit={profile.submit} noValidate className="flex flex-col gap-5">
          <ActionAlert error={profile.error} />
          <Alert tone="success" message={profile.isSuccess ? t.saved : undefined} />
          <Field label={f.name} optionalLabel={c.optional} autoComplete="name" {...profile.field("name")} />
          <Field label={f.email} type="email" autoComplete="email" {...profile.field("email")} />
          <Field
            label={f.username}
            hint={f.usernameHint}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            {...profile.field("username")}
          />
          <div>
            <Button type="submit" loading={profile.isSubmitting} loadingLabel={c.saving}>
              {c.save}
            </Button>
          </div>
        </form>
      </Panel>

      <Panel title={t.passwordTitle} lead={t.passwordLead}>
        <form onSubmit={password.submit} noValidate className="flex flex-col gap-5">
          <ActionAlert error={password.error} />
          <Alert tone="success" message={password.isSuccess ? t.passwordSaved : undefined} />
          {/* Campo escondido de username: gerenciador de senha associa a conta certa */}
          <input type="text" name="username" autoComplete="username" value={user.username} readOnly hidden />
          <PasswordField
            label={f.currentPassword}
            autoComplete="current-password"
            {...password.field("currentPassword")}
          />
          <PasswordField
            label={f.newPassword}
            hint={f.passwordHint}
            autoComplete="new-password"
            {...password.field("newPassword")}
          />
          <PasswordField
            label={f.confirmPassword}
            autoComplete="new-password"
            {...password.field("confirmPassword")}
          />
          <div>
            <Button type="submit" loading={password.isSubmitting} loadingLabel={c.saving}>
              {t.passwordSubmit}
            </Button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
