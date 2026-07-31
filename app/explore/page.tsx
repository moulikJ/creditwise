import { Shell } from "@/components/shell";
import { Explorer } from "./explorer-client";
import { cardRepo } from "@/lib/repo";

export const metadata = { title: "Explore credit cards" };

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const sp = await searchParams;
  return (
    <Shell>
      <h1 className="text-2xl font-semibold">Explore cards</h1>
      <p className="mt-1 text-sm text-fg-2">Filter, sort and compare {cardRepo.all().length} cards across every major Indian issuer.</p>
      <div className="mt-6">
        <Explorer cards={cardRepo.all()} banks={cardRepo.banks()} initialCategory={sp.category} initialQuery={sp.q} />
      </div>
    </Shell>
  );
}
