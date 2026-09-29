"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { panelContent } from "@/config/panel-content";
import { useActionForm } from "@/lib/form/useActionForm";
import { adminCreateUser } from "@/modules/users/actions";
import { createUserSchema } from "@/modules/users/domain/user";
import { ActionAlert } from "../ui/ActionAlert";
import { Button } from "../ui/Button";
import { Panel } from "../ui/Panel";
import { UserFields } from "./UserFields";

const t = panelContent.users;
const c = panelContent.common;

export function CreateUserForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useActionForm(createUserSchema, adminCreateUser, {
    initialValues: { name: "", email: "", username: "", role: "member", password: "" },
    onSuccess: async (user) => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      router.push(`/users/${user.id}?created=1`);
    },
  });

  return (
    <Panel title={t.newTitle}>
      <form onSubmit={form.submit} noValidate className="flex flex-col gap-6">
        <ActionAlert error={form.error} />
        <UserFields field={form.field} mode="create" />
        <div className="flex gap-3">
          <Button type="submit" loading={form.isSubmitting || form.isSuccess} loadingLabel={c.saving}>
            {t.new}
          </Button>
          <Button variant="ghost" onClick={() => router.push("/users")}>
            {c.cancel}
          </Button>
        </div>
      </form>
    </Panel>
  );
}
