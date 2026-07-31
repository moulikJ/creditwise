"use client";
import { useState } from "react";
import Link from "next/link";
import { CreditCard, SPEND_CATEGORIES } from "@/lib/types";
import { CardArt, inr } from "@/components/ui";
import { effectiveRate } from "@/lib/engine";

export function Compare({ cards, preselect }: { cards: CreditCard[]; preselect: string[] }) {
  const [picked, setPicked] = useState<string[]>(preselect.slice(0, 3));
  const [q, setQ] = useState("");
  const chosen = picked.map((id) => cards.find((c) => c.id === id)!).filter(Boolean);
  const results = q.trim() ? cards.filter((c) => !picked.includes(c.id) && (c.name + c.bank).toLowerCase().includes(q.toLowerCase())).slice(0, 5) : [];

  function add(id: string) {
    if (picked.length >= 3 || picked.includes(id)) return;
    setPicked([...picked, id]); setQ("");
    fetch("/api/analytics", { method: "POST", body: JSON.stringify({ type: "compare", cardId: id }) }).catch(() => {});
  }
  const rows: [string, (c: CreditCard) => string][] = [
    ["Bank", (c) => c.bank],
    ["Category", (c) => c.category],
    ["Joining fee", (c) => c.joiningFee ? inr(c.joiningFee) : "Nil"],
    ["Annual fee", (c) => c.annualFee ? inr(c.annualFee) : "Lifetime free"],
    ["Fee waiver", (c) => c.annualFeeWaiver ? inr(c.annualFeeWaiver) + " spend" : "—"],
    ["Base reward", (c) => (c.baseRate * 100).toFixed(2) + "%"],
    ["Welcome bonus", (c) => c.welcomeBonusValue ? inr(c.welcomeBonusValue) : "—"],
    ["Domestic lounge", (c) => c.loungeVisitsDomestic >= 99 ? "Unlimited" : c.loungeVisitsDomestic + "/yr"],
    ["Intl lounge", (c) => c.loungeVisitsIntl >= 99 ? "Unlimited" : c.loungeVisitsIntl + "/yr"],
    ["Forex markup", (c) => c.forexMarkup + "%"],
    ["Min income", (c) => inr(c.minIncomeAnnual) + "/yr"],
    ["Min credit score", (c) => String(c.minCreditScore)],
    ["Reward currency", (c) => c.rewardCurrency],
  ];

  return (
    <div>
      {picked.length < 3 && (
        <div className="mb-6 max-w-md">
          <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
            <span className="text-muted">⌕</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Add a card (${picked.length}/3)…`} className="w-full bg-transparent text-sm outline-none" />
          </div>
          {results.map((c) => (
            <button key={c.id} onClick={() => add(c.id)} className="mt-1 flex w-full items-center gap-3 rounded-lg border border-line bg-surface p-2 text-left hover:border-brand">
              <CardArt card={c} className="h-8 w-12" /><div><div className="text-sm font-medium">{c.name}</div><div className="text-xs text-muted">{c.bank}</div></div>
            </button>
          ))}
        </div>
      )}

      {chosen.length === 0 ? (
        <div className="rounded-xl border border-line bg-surface p-10 text-center text-muted">Add up to 3 cards to compare them side by side.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="w-40 p-4 text-left text-xs uppercase text-muted">Feature</th>
                {chosen.map((c) => (
                  <th key={c.id} className="p-4 text-left align-top">
                    <CardArt card={c} className="h-20 w-32" />
                    <div className="mt-2 font-semibold"><Link href={`/card/${c.slug}`} className="hover:text-brand">{c.name}</Link></div>
                    <button onClick={() => setPicked(picked.filter((x) => x !== c.id))} className="text-xs text-muted hover:text-neg">Remove</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, fn]) => (
                <tr key={label} className="border-b border-line">
                  <td className="p-3 text-muted">{label}</td>
                  {chosen.map((c) => <td key={c.id} className="p-3 font-medium tabular">{fn(c)}</td>)}
                </tr>
              ))}
              <tr className="bg-surface-2">
                <td className="p-3 text-xs font-semibold uppercase text-muted">Reward rate by category</td>
                {chosen.map((c) => <td key={c.id} />)}
              </tr>
              {SPEND_CATEGORIES.map((sc) => (
                <tr key={sc.key} className="border-b border-line">
                  <td className="p-3 text-muted">{sc.icon} {sc.label}</td>
                  {chosen.map((c) => {
                    const r = effectiveRate(c, sc.key);
                    const best = Math.max(...chosen.map((x) => effectiveRate(x, sc.key)));
                    return <td key={c.id} className={`p-3 tabular ${r === best && r > 0 ? "font-semibold text-pos" : "text-fg-2"}`}>{(r * 100).toFixed(1)}%</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
