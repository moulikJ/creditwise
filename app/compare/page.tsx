import { Shell } from "@/components/shell";
import { Compare } from "./compare-client";
import { cardRepo } from "@/lib/repo";

export const metadata = { title: "Compare cards" };

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ cards?: string }> }) {
  const sp = await searchParams;
  const pre = sp.cards ? sp.cards.split(",") : [];
  return (
    <Shell>
      <h1 className="text-2xl font-semibold">Compare cards</h1>
      <p className="mt-1 text-sm text-fg-2">Put up to three cards head-to-head. Best value in each row is highlighted.</p>
      <div className="mt-6"><Compare cards={cardRepo.all()} preselect={pre} /></div>
    </Shell>
  );
}
