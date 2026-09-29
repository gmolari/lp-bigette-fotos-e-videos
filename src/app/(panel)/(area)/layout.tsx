import { redirect } from "next/navigation";
import { PanelNav } from "@/components/panel/PanelNav";
import { getCurrentUser } from "@/modules/auth";

/**
 * Área logada. O proxy só confere o JWT; aqui a sessão é conferida no
 * banco (usuário existe, versão de sessão bate, papel atual).
 */
export default async function AreaLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-line bg-bg/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
          <span className="font-display text-lg text-cream">Bigette</span>
          <PanelNav isAdmin={user.role === "admin"} />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
    </>
  );
}
