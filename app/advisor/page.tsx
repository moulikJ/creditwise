import { Shell } from "@/components/shell";
import { Advisor } from "./advisor-client";

export const metadata = { title: "AI Card Advisor" };

export default function AdvisorPage() {
  return (
    <Shell>
      <h1 className="text-2xl font-semibold">AI Card Advisor</h1>
      <p className="mt-1 text-sm text-fg-2">Describe your spending in plain English and get explained recommendations. Runs on a transparent rule-based engine — no data leaves the app.</p>
      <div className="mt-6"><Advisor /></div>
    </Shell>
  );
}
