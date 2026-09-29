"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, m } from "motion/react";
import { panelContent } from "@/config/panel-content";
import { useAction, useActionQuery } from "@/lib/action/hooks";
import { useActionForm } from "@/lib/form/useActionForm";
import { adminDeleteUser, adminUpdateUser, getUserById } from "@/modules/users/actions";
import { updateUserSchema, type PublicUser } from "@/modules/users/domain/user";
import { duration, ease } from "../motion/tokens";
import { ActionAlert } from "../ui/ActionAlert";
import { Alert } from "../ui/Alert";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Panel } from "../ui/Panel";
import { formatDateTime } from "./format";
import { UserFields } from "./UserFields";

const t = panelContent.users;
const c = panelContent.common;

export function EditUser({
  id,
  currentUserId,
  justCreated,
}: {
  id: string;
  currentUserId: string;
  justCreated: boolean;
}) {
  const query = useActionQuery(["users", "detail"], getUserById, { id });

  if (query.isPending) return <div aria-busy className="h-96 animate-pulse rounded-2xl bg-bg-2" />;
  if (query.isError) return <ActionAlert error={query.error} />;

  return (
    <EditUserLoaded
      // Dados novos do servidor → formulário recomeça deles
      key={query.data.id}
      user={query.data}
      isSelf={query.data.id === currentUserId}
      justCreated={justCreated}
    />
  );
}

function EditUserLoaded({
  user,
  isSelf,
  justCreated,
}: {
  user: PublicUser;
  isSelf: boolean;
  justCreated: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useActionForm(updateUserSchema, adminUpdateUser, {
    initialValues: {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      password: "",
    },
    syncFromResult: (u) => ({ name: u.name, email: u.email, username: u.username, role: u.role, password: "" }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
      // Rebaixou a si mesmo: esta tela deixou de ser sua
      if (isSelf && updated.role !== "admin") {
        router.replace("/profile");
        router.refresh();
      }
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <Alert tone="success" message={justCreated && form.mutation.isIdle ? t.created : undefined} />

      <Panel title={t.editTitle}>
        <form onSubmit={form.submit} noValidate className="flex flex-col gap-6">
          <ActionAlert error={form.error} />
          <Alert tone="success" message={form.isSuccess ? t.saved : undefined} />
          <UserFields field={form.field} mode="edit" />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button type="submit" loading={form.isSubmitting} loadingLabel={c.saving}>
              {c.save}
            </Button>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
              <span>
                {t.createdAt}: <span className="text-cream/80">{formatDateTime(user.createdAt)}</span>
              </span>
              <span>
                {t.lastLogin}: <span className="text-cream/80">{formatDateTime(user.lastLoginAt) ?? c.never}</span>
              </span>
              {isSelf && <Badge tone="ouro">{t.you}</Badge>}
            </p>
          </div>
        </form>
      </Panel>

      {!isSelf && <DangerZone user={user} />}
    </div>
  );
}

/** Exclusão em duas etapas: o primeiro clique só arma o botão. */
function DangerZone({ user }: { user: PublicUser }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [armed, setArmed] = useState(false);

  const del = useAction(adminDeleteUser, {
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: ["users", "detail"] });
      await queryClient.invalidateQueries({ queryKey: ["users", "list"] });
      router.replace("/users");
    },
  });

  return (
    <Panel title={t.danger.title} lead={t.danger.text} tone="danger">
      <div className="flex flex-col items-start gap-4">
        <ActionAlert error={del.error} />
        <div className="flex flex-wrap gap-3">
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={armed ? "armed" : "idle"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } }}
              exit={{ opacity: 0, transition: { duration: duration.instant } }}
              className="flex gap-3"
            >
              {armed ? (
                <>
                  <Button
                    variant="danger"
                    loading={del.isPending || del.isSuccess}
                    loadingLabel={t.danger.deleting}
                    onClick={() => del.mutate({ id: user.id })}
                  >
                    {t.danger.confirm}
                  </Button>
                  <Button variant="ghost" onClick={() => setArmed(false)} disabled={del.isPending}>
                    {c.cancel}
                  </Button>
                </>
              ) : (
                <Button variant="secondary" onClick={() => setArmed(true)}>
                  {t.danger.button}
                </Button>
              )}
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </Panel>
  );
}
