import { Shell } from "@/components/shell";
import { Recommender } from "./rec-client";
import { cardRepo } from "@/lib/repo";

export const metadata = { title: "Card recommendation" };

export default function RecommendPage() {
  return (
    <Shell>
      <h1 className="text-2xl font-semibold">Personalised recommendation</h1>
      <p className="mt-1 text-sm text-fg-2">Tell us how you spend and what you value. We rank every eligible card by real net value and fit — calculator built in.</p>
      <div className="mt-6"><Recommender allCards={cardRepo.all()} /></div>
    </Shell>
  );
}
