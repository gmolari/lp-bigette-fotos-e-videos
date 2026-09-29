import type { Metadata } from "next";
import { PageHeader } from "@/components/panel/PageHeader";
import { CreateUserForm } from "@/components/panel/users/CreateUserForm";
import { panelContent } from "@/config/panel-content";

const t = panelContent.users;

export const metadata: Metadata = { title: t.newTitle };

export default function NewUserPage() {
  return (
    <>
      <PageHeader title={t.newTitle} back={{ href: "/users", label: t.title }} />
      <CreateUserForm />
    </>
  );
}
