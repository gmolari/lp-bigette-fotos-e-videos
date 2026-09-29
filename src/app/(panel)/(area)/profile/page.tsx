import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/panel/PageHeader";
import { ProfileForms } from "@/components/panel/ProfileForms";
import { panelContent } from "@/config/panel-content";
import { getCurrentUser } from "@/modules/auth";

const t = panelContent.profile;

export const metadata: Metadata = { title: t.metaTitle };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <PageHeader title={t.title} lead={t.lead} />
      <ProfileForms user={user} />
    </>
  );
}
