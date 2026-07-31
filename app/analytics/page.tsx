import { Shell } from "@/components/shell";
import { AnalyticsDash } from "./analytics-client";
import { cardRepo } from "@/lib/repo";

export const metadata = { title: "Platform analytics" };

export default function AnalyticsPage() {
  const cardNames = Object.fromEntries(cardRepo.all().map((c) => [c.id, c.name]));
  return (
    <Shell>
      <h1 className="text-2xl font-semibold">Platform analytics</h1>
      <p className="mt-1 text-sm text-fg-2">Live behavioural metrics — views, comparisons, searches and recommendation activity.</p>
      <div className="mt-6"><AnalyticsDash cardNames={cardNames} /></div>
    </Shell>
  );
}
