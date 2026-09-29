import { notFound } from "next/navigation";
import { getCurrentUser } from "@/modules/auth";

/**
 * Só admin. Membro recebe 404 — nem fica sabendo que a tela existe.
 * As actions de admin conferem o papel de novo (guard "admin").
 */
export default async function UsersLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (user?.role !== "admin") notFound();
  return children;
}
