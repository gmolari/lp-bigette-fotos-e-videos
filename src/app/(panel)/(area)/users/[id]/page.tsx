import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { PageHeader } from "@/components/panel/PageHeader";
import { EditUser } from "@/components/panel/users/EditUser";
import { panelContent } from "@/config/panel-content";
import { getCurrentUser } from "@/modules/auth";

const t = panelContent.users;

export const metadata: Metadata = { title: t.editTitle };

export default async function EditUserPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const [{ id }, { created }, me] = await Promise.all([params, searchParams, getCurrentUser()]);
  // id malformado nem chega a virar consulta
  if (!z.uuid().safeParse(id).success) notFound();

  return (
    <>
      <PageHeader title={t.editTitle} back={{ href: "/users", label: t.title }} />
      <EditUser id={id} currentUserId={me!.id} justCreated={created === "1"} />
    </>
  );
}
