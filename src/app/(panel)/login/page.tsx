import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/panel/LoginForm";
import { panelContent } from "@/config/panel-content";
import { getCurrentUser } from "@/modules/auth";

export const metadata: Metadata = { title: panelContent.login.metaTitle };

export default async function LoginPage() {
  // Conferido no BANCO (não só o JWT) — ver o aviso em src/proxy.ts
  if (await getCurrentUser()) redirect("/pictures");

  return (
    <main className="grid min-h-svh place-items-center px-4 py-16">
      <LoginForm />
    </main>
  );
}
