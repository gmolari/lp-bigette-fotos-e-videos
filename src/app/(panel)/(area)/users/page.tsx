import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/panel/PageHeader";
import { UsersList } from "@/components/panel/users/UsersList";
import { panelContent } from "@/config/panel-content";
import { getCurrentUser } from "@/modules/auth";

const t = panelContent.users;

export const metadata: Metadata = { title: t.metaTitle };

export default async function UsersPage() {
  const me = await getCurrentUser();

  return (
    <>
      <PageHeader
        title={t.title}
        lead={t.lead}
        action={
          <Link
            href="/users/new"
            className={[
              "inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-[0.95rem] font-semibold text-ink",
              "transition-colors duration-200 hover:bg-accent-2",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-2",
            ].join(" ")}
          >
            <Plus aria-hidden className="size-4" />
            {t.new}
          </Link>
        }
      />
      <UsersList currentUserId={me!.id} />
    </>
  );
}
