"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CreditCard, CARD_CATEGORIES } from "@/lib/types";
import { CardArt, Badge, inr } from "@/components/ui";

type Sort = "name" | "fee" | "feeDesc" | "reward" | "lounge";

export function Explorer({ cards, banks, initialCategory, initialQuery }: {
  cards: CreditCard[]; banks: string[]; initialCategory?: string; initialQuery?: string;
}) {
  const [q, setQ] = useState(initialQuery ?? "");
  const [category, setCategory] = useState(initialCategory ?? "All");
  const [bank, setBank] = useState("All");
  const [maxFee, setMaxFee] = useState(15000);
  const [benefit, setBenefit] = useState<string>("");
  const [sort, setSort] = useState<Sort>("reward");
  const [view, setView] = useState<"grid" | "table">("grid");

  const filtered = useMemo(() => {
    let r = cards.slice();
    if (q.trim()) r = r.filter((c) => (c.name + " " + c.bank + " " + c.category).toLowerCase().includes(q.toLowerCase()));
    if (category !== "All") r = r.filter((c) => c.category === category);
    if (bank !== "All") r = r.filter((c) => c.bank === bank);
    r = r.filter((c) => c.annualFee <= maxFee);
    if (benefit === "lounge") r = r.filter((c) => c.loungeVisitsDomestic >= 4);
    if (benefit === "nofee") r = r.filter((c) => c.annualFee === 0);
    if (benefit === "lowforex") r = r.filter((c) => c.forexMarkup <= 2);
    r.sort((a, b) =>
      sort === "fee" ? a.annualFee - b.annualFee :
      sort === "feeDesc" ? b.annualFee - a.annualFee :
      sort === "reward" ? b.baseRate - a.baseRate :
      sort === "lounge" ? b.loungeVisitsDomestic - a.loungeVisitsDomestic :
      a.name.localeCompare(b.name));
    return r;
  }, [cards, q, category, bank, maxFee, benefit, sort]);

  useEffect(() => {
    if (q.trim().length > 2) {
      const t = setTimeout(() => { fetch("/api/analytics", { method: "POST", body: JSON.stringify({ type: "search", query: q.trim() }) }).catch(() => {}); }, 800);
      return () => clearTimeout(t);
    }
  }, [q]);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Filter rail */}
      <aside className="space-y-5 lg:sticky lg:top-20 lg:h-fit">
        <div>
          <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
            <span className="text-muted">⌕</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search cards…" className="w-full bg-transparent text-sm outline-none" />
          </div>
        </div>
        <Filter label="Category">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm">
            <option>All</option>{CARD_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Filter>
        <Filter label="Bank">
          <select value={bank} onChange={(e) => setBank(e.target.value)} className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm">
            <option>All</option>{banks.map((b) => <option key={b}>{b}</option>)}
          </select>
        </Filter>
        <Filter label={`Max annual fee · ${inr(maxFee)}`}>
          <input type="range" min={0} max={15000} step={500} value={maxFee} onChange={(e) => setMaxFee(+e.target.value)} className="w-full accent-brand" />
        </Filter>
        <Filter label="Benefit">
          <div className="flex flex-wrap gap-2">
            {[["", "Any"], ["nofee", "No fee"], ["lounge", "Lounge"], ["lowforex", "Low forex"]].map(([v, l]) => (
              <button key={v} onClick={() => setBenefit(v)} className={`rounded-md px-2.5 py-1 text-xs ${benefit === v ? "bg-brand text-brand-fg" : "border border-line text-fg-2"}`}>{l}</button>
            ))}
          </div>
        </Filter>
      </aside>

      {/* Results */}
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-fg-2"><span className="font-semibold text-fg">{filtered.length}</span> cards</div>
          <div className="flex items-center gap-2">
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm">
              <option value="reward">Highest base reward</option>
              <option value="fee">Lowest fee</option>
              <option value="feeDesc">Highest fee</option>
              <option value="lounge">Most lounge visits</option>
              <option value="name">Name (A–Z)</option>
            </select>
            <div className="flex rounded-lg border border-line p-0.5">
              <button onClick={() => setView("grid")} className={`rounded px-2.5 py-1 text-sm ${view === "grid" ? "bg-surface-2" : ""}`}>▦</button>
              <button onClick={() => setView("table")} className={`rounded px-2.5 py-1 text-sm ${view === "table" ? "bg-surface-2" : ""}`}>≣</button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-line bg-surface p-10 text-center text-muted">No cards match these filters.</div>
        ) : view === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((c) => (
              <Link key={c.id} href={`/card/${c.slug}`} className="rounded-xl border border-line bg-surface p-4 transition hover:shadow-sm hover:border-brand">
                <div className="flex items-start justify-between">
                  <CardArt card={c} className="h-24 w-40" />
                  <Badge tone="brand">{c.category}</Badge>
                </div>
                <div className="mt-3 font-medium">{c.name}</div>
                <div className="text-xs text-muted">{c.bank}</div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div><div className="font-semibold tabular">{c.annualFee ? inr(c.annualFee) : "Free"}</div><div className="text-muted">fee</div></div>
                  <div><div className="font-semibold tabular text-pos">{(c.baseRate * 100).toFixed(1)}%</div><div className="text-muted">base</div></div>
                  <div><div className="font-semibold tabular">{c.loungeVisitsDomestic >= 99 ? "∞" : c.loungeVisitsDomestic}</div><div className="text-muted">lounge</div></div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-muted">
                <tr><th className="p-3">Card</th><th className="p-3">Category</th><th className="p-3 text-right">Annual fee</th><th className="p-3 text-right">Base reward</th><th className="p-3 text-right">Lounge</th><th className="p-3 text-right">Forex</th></tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t border-line hover:bg-surface-2">
                    <td className="p-3"><Link href={`/card/${c.slug}`} className="flex items-center gap-3"><CardArt card={c} className="h-9 w-14" /><div><div className="font-medium">{c.name}</div><div className="text-xs text-muted">{c.bank}</div></div></Link></td>
                    <td className="p-3"><Badge>{c.category}</Badge></td>
                    <td className="p-3 text-right tabular">{c.annualFee ? inr(c.annualFee) : "Free"}</td>
                    <td className="p-3 text-right tabular text-pos">{(c.baseRate * 100).toFixed(1)}%</td>
                    <td className="p-3 text-right tabular">{c.loungeVisitsDomestic >= 99 ? "∞" : c.loungeVisitsDomestic}</td>
                    <td className="p-3 text-right tabular">{c.forexMarkup}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{label}</div>{children}</div>;
}
