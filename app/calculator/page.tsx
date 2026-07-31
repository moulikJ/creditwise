import { Shell } from "@/components/shell";
import { Calculator } from "./calc-client";
import { cardRepo } from "@/lib/repo";

export const metadata = { title: "Reward calculator" };

export default async function CalcPage({ searchParams }: { searchParams: Promise<{ card?: string }> }) {
  const sp = await searchParams;
  return (
    <Shell>
      <h1 className="text-2xl font-semibold">Reward calculator</h1>
      <p className="mt-1 text-sm text-fg-2">Enter your monthly spend and see what each card really earns you after fees.</p>
      <div className="mt-6"><Calculator cards={cardRepo.all()} preselect={sp.card} /></div>
    </Shell>
  );
}
