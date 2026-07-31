"use client";
import { useMemo, useState } from "react";
import { CreditCard, SPEND_CATEGORIES, SpendCategory } from "@/lib/types";
import { CardArt, inr } from "@/components/ui";
import { valuateCard } from "@/lib/engine";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const PRESET: Record<string, Partial<Record<SpendCategory, number>>> = {
  Light: { online: 4000, dining: 3000, groceries: 5000, fuel: 2000, bills: 3000, upi: 4000 },
  Typical: { online: 10000, dining: 8000, groceries: 12000, fuel: 5000, travel: 4000, bills: 6000, entertainment: 2500, upi: 8000 },
  Heavy: { online: 25000, dining: 18000, groceries: 20000, fuel: 9000, travel: 15000, bills: 12000, entertainment: 6000, upi: 15000, international: 8000 },
};

export function Calculator({ cards, preselect }: { cards: CreditCard[]; preselect?: string }) {
  const [spend, setSpend] = useState<Partial<Record<SpendCategory, number>>>(PRESET.Typical);
  const [picked, setPicked] = useState<string[]>(preselect ? [preselect] : ["hdfc-millennia", "sbi-cashback", "amazon-pay-icici"]);
  const [q, setQ] = useState("");

  const chosen = picked.map((id) => cards.find((c) => c.id === id)!).filter(Boolean);
  const results = useMemo(() =>
    chosen.map((c) => ({ card: c, v: valuateCard(c, spend, { loungeVisitsUsed: 4, loungeValuePerVisit: 1000 }) }))
      .sort((a, b) => b.v.net - a.v.net), [chosen, spend]);

  const chartData = results.map((r) => ({ name: r.card.name, net: r.v.net, color: r.card.color }));
  const searchResults = q.trim() ? cards.filter((c) => !picked.includes(c.id) && (c.name + c.bank).toLowerCase().includes(q.toLowerCase())).slice(0, 5) : [];
  const setCat = (k: SpendCategory, v: string) => setSpend((s) => ({ ...s, [k]: Math.max(0, parseInt(v) || 0) }));

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      {/* Inputs */}
      <div className="space-y-4">
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-2 text-sm font-semibold">Monthly spend</div>
          <div className="mb-3 flex gap-2">{Object.keys(PRESET).map((p) => <button key={p} onClick={() => setSpend(PRESET[p])} className="rounded-md border border-line px-2.5 py-1 text-xs hover:border-brand">{p}</button>)}</div>
          <div className="space-y-2">
            {SPEND_CATEGORIES.map((sc) => (
              <div key={sc.key} className="flex items-center gap-2">
                <span className="w-5 text-center">{sc.icon}</span>
                <span className="flex-1 text-sm">{sc.label}</span>
                <input inputMode="numeric" value={spend[sc.key] ? "₹" + spend[sc.key]!.toLocaleString("en-IN") : ""} placeholder="₹0"
                  onChange={(e) => setCat(sc.key, e.target.value.replace(/[^\d]/g, ""))}
                  className="w-24 rounded-md border border-line bg-bg px-2 py-1 text-right text-sm tabular outline-none focus:border-brand" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-2 text-sm font-semibold">Cards ({picked.length})</div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Add a card…" className="w-full rounded-md border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-brand" />
          {searchResults.map((c) => <button key={c.id} onClick={() => { setPicked([...picked, c.id]); setQ(""); }} className="mt-1 block w-full rounded-md p-2 text-left text-sm hover:bg-surface-2">{c.name} · <span className="text-muted">{c.bank}</span></button>)}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {chosen.map((c) => <span key={c.id} className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-2 py-1 text-xs">{c.name}<button onClick={() => setPicked(picked.filter((x) => x !== c.id))} className="text-muted">×</button></span>)}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-3 text-sm font-semibold">Net annual value (rewards − fee + lounge)</div>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" tickFormatter={(v) => "₹" + (v / 1000) + "k"} stroke="var(--color-muted)" fontSize={12} />
                <YAxis type="category" dataKey="name" width={110} stroke="var(--color-muted)" fontSize={12} />
                <Tooltip formatter={(v: unknown) => inr(Number(v))} contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-line)", borderRadius: 8, color: "var(--color-fg)" }} />
                <Bar dataKey="net" radius={[0, 6, 6, 0]}>{chartData.map((d, i) => <Cell key={i} fill={d.color} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-left text-xs uppercase text-muted"><tr><th className="p-3">Card</th><th className="p-3 text-right">Gross rewards</th><th className="p-3 text-right">Annual fee</th><th className="p-3 text-right">Lounge value</th><th className="p-3 text-right">Net / year</th></tr></thead>
            <tbody>
              {results.map(({ card, v }, i) => (
                <tr key={card.id} className={`border-t border-line ${i === 0 ? "bg-pos-soft/40" : ""}`}>
                  <td className="p-3"><div className="flex items-center gap-2"><CardArt card={card} className="h-8 w-12" /><span className="font-medium">{card.name}</span>{i === 0 && <span className="rounded bg-pos px-1.5 py-0.5 text-[10px] text-white">Best</span>}</div></td>
                  <td className="p-3 text-right tabular text-pos">{inr(v.gross)}</td>
                  <td className="p-3 text-right tabular text-warn">{v.fee ? "−" + inr(v.fee) : "Nil"}</td>
                  <td className="p-3 text-right tabular">{inr(v.perksValue)}</td>
                  <td className="p-3 text-right font-semibold tabular">{inr(v.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted">Assumes 4 lounge visits used at ₹1,000 value each, where the card offers them. Fee shown as nil when your spend clears the waiver threshold.</p>
      </div>
    </div>
  );
}
