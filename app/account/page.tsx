import { redirect } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { CardArt, inr } from "@/components/ui";
import { LogoutButton } from "./logout-button";
import { getCurrentUser } from "@/lib/auth";
import { favRepo, recRepo, cardRepo } from "@/lib/repo";

export const metadata = { title: "Your account" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const favs = cardRepo.byIds(favRepo.forUser(user.id).map((f) => f.cardId));
  const history = recRepo.forUser(user.id).slice(0, 5);

  return (
    <Shell>
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold">Hi, {user.name.split(" ")[0]}</h1><p className="text-sm text-muted">{user.email}</p></div>
        <div className="flex gap-2">{user.role === "admin" && <Link href="/admin" className="rounded-lg border border-line px-3 py-2 text-sm">Admin</Link>}<LogoutButton /></div>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Saved cards ({favs.length})</h2>
        {favs.length === 0 ? <p className="mt-2 text-sm text-muted">No saved cards yet. Tap ☆ Save on any card.</p> : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favs.map((c) => (
              <Link key={c.id} href={`/card/${c.slug}`} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4 hover:border-brand">
                <CardArt card={c} className="h-12 w-20" /><div><div className="font-medium">{c.name}</div><div className="text-xs text-muted">{c.bank}</div></div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Recommendation history</h2>
        {history.length === 0 ? <p className="mt-2 text-sm text-muted">Run the recommender to see your history here.</p> : (
          <div className="mt-4 space-y-2">
            {history.map((h) => (
              <div key={h.id} className="rounded-xl border border-line bg-surface p-4 text-sm">
                <div className="text-xs text-muted">{new Date(h.createdAt).toLocaleString("en-IN")}</div>
                <div className="mt-1">Top picks: {cardRepo.byIds(h.resultCardIds).slice(0, 3).map((c) => c.name).join(", ")}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}
