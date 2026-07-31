import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { AdminPanel } from "./admin-client";
import { getCurrentUser } from "@/lib/auth";
import { cardRepo } from "@/lib/repo";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/account");
  return (
    <Shell>
      <h1 className="text-2xl font-semibold">Admin dashboard</h1>
      <p className="mt-1 text-sm text-fg-2">Manage the card catalogue and review platform analytics.</p>
      <div className="mt-6"><AdminPanel initialCards={cardRepo.all()} /></div>
    </Shell>
  );
}
