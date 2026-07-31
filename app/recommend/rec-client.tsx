"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { CreditCard, SPEND_CATEGORIES, SpendCategory } from "@/lib/types";
import { CardArt, Button, inr } from "@/components/ui";
import { valuateCard } from "@/lib/engine";

interface Scored { card: CreditCard; net: number; gross: number; fee: number; score: number; reasons: string[]; }

const PRESET: Record<string, Partial<Record<SpendCategory, number>>> = {
  Light: { online: 4000, dining: 3000, groceries: 5000, fuel: 2000, bills: 3000, upi: 4000 },
  Typical: { online: 10000, dining: 8000, groceries: 10000, fuel: 5000, travel: 4000, bills: 6000, upi: 6000 },
  Heavy: { online: 25000, dining: 18000, groceries: 20000, fuel: 9000, travel: 15000, bills: 12000, entertainment: 6000, upi: 15000, international: 8000 },
};

export function Recommender({ allCards }: { allCards: CreditCard[] }) {
  const [step, setStep] = useState(0); // 0 spend, 1 details, 2 results, 3 card-detail
  const [spend, setSpend] = useState<Partial<Record<SpendCategory, number>>>(PRESET.Typical);
  const [income, setIncome] = useState(1200000);
  const [age, setAge] = useState(28);
  const [score, setScore] = useState<number | null>(null); // null = skipped/unknown
  const [owned, setOwned] = useState<string[]>([]);
  const [ownQuery, setOwnQuery] = useState("");
  const [prefs, setPrefs] = useState({ preferNoFee: false, wantLounge: true, wantLowForex: false });
  const [results, setResults] = useState<Scored[] | null>(null);
  const [active, setActive] = useState<CreditCard | null>(null);
  const [loading, setLoading] = useState(false);

  const setCat = (k: SpendCategory, v: string) => setSpend((s) => ({ ...s, [k]: Math.max(0, parseInt(v) || 0) }));
  const ownResults = ownQuery.trim()
    ? allCards.filter((c) => !owned.includes(c.id) && (c.name + c.bank).toLowerCase().includes(ownQuery.toLowerCase())).slice(0, 5)
    : [];

  async function run() {
    setLoading(true);
    const r = await fetch("/api/recommend", {
      method: "POST",
      body: JSON.stringify({
        profile: spend, incomeAnnual: income, age,
        creditScore: score ?? undefined, ownedCardIds: owned, ...prefs,
      }),
    });
    const d = await r.json();
    setResults(d.results || []); setLoading(false); setStep(2);
  }

  // ---------- Card detail (inline, so Back returns to results) ----------
  if (step === 3 && active) {
    const v = valuateCard(active, spend, { loungeVisitsUsed: 4, loungeValuePerVisit: 1000 });
    return (
      <div className="max-w-2xl">
        <button onClick={() => setStep(2)} className="text-sm text-brand">← Back to recommended cards</button>
        <div className="mt-4 rounded-xl border border-line bg-surface p-5">
          <div className="flex flex-wrap items-start gap-4">
            <CardArt card={active} className="h-24 w-40" />
            <div className="flex-1">
              <h2 className="text-2xl font-semibold">{active.name}</h2>
              <div className="text-sm text-muted">{active.bank} · {active.category}</div>
              <Link href={`/card/${active.slug}`} className="mt-2 inline-block text-sm text-brand">Open full card page →</Link>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted">Your est. net value</div>
              <div className="text-2xl font-semibold tabular text-pos">{inr(v.net)}<span className="text-sm text-muted">/yr</span></div>
            </div>
          </div>
          <p className="mt-4 text-fg-2">{active.summary}</p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-lg border border-line p-3"><div className="font-semibold tabular text-pos">{inr(v.gross)}</div><div className="text-xs text-muted">gross rewards/yr</div></div>
            <div className="rounded-lg border border-line p-3"><div className="font-semibold tabular text-warn">{v.fee ? "−" + inr(v.fee) : "Nil"}</div><div className="text-xs text-muted">annual fee</div></div>
            <div className="rounded-lg border border-line p-3"><div className="font-semibold tabular">{inr(v.perksValue)}</div><div className="text-xs text-muted">lounge value</div></div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Results ----------
  if (step === 2 && results) {
    return (
      <div>
        <button onClick={() => setStep(0)} className="text-sm text-brand">← Adjust inputs</button>
        <h2 className="mt-3 text-xl font-semibold">Your top {results.length} matches</h2>
        <p className="text-sm text-muted">Ranked by real net value for your spend{owned.length ? `, excluding the ${owned.length} card${owned.length > 1 ? "s" : ""} you already hold` : ""}.</p>
        <div className="mt-4 space-y-3">
          {results.map((r, i) => (
            <div key={r.card.id} className="rounded-xl border border-line bg-surface p-4">
              <div className="flex flex-wrap items-start gap-4">
                <CardArt card={r.card} className="h-16 w-24 sm:h-20 sm:w-32" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {i === 0 && <span className="rounded bg-brand px-2 py-0.5 text-xs text-brand-fg">Best fit</span>}
                    <span className="rounded bg-surface-2 px-2 py-0.5 text-xs">Fit score {r.score}</span>
                  </div>
                  <button onClick={() => { setActive(r.card); setStep(3); }} className="mt-1 block text-left text-lg font-semibold hover:text-brand">{r.card.name}</button>
                  <div className="text-sm text-muted">{r.card.bank}</div>
                  <ul className="mt-2 space-y-1 text-sm text-fg-2">{r.reasons.slice(0, 3).map((x, j) => <li key={j}>✓ {x}</li>)}</ul>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted">Est. net value</div>
                  <div className="text-xl font-semibold tabular text-pos">{inr(r.net)}<span className="text-sm text-muted">/yr</span></div>
                  <Button onClick={() => { setActive(r.card); setStep(3); }} size="sm" variant="secondary" className="mt-2">View details</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---------- Step 0: spend (with presets, merged calculator input) ----------
  if (step === 0) {
    const total = SPEND_CATEGORIES.reduce((s, c) => s + (spend[c.key] || 0), 0);
    return (
      <div className="max-w-2xl">
        <div className="rounded-xl border border-line bg-surface p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">1 · How do you spend each month?</div>
            <div className="flex gap-2">{Object.keys(PRESET).map((p) => <button key={p} onClick={() => setSpend(PRESET[p])} className="rounded-md border border-line px-2.5 py-1 text-xs hover:border-brand">{p}</button>)}</div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SPEND_CATEGORIES.map((sc) => (
              <label key={sc.key} className="flex items-center gap-2 rounded-lg border border-line px-3 py-2">
                <span>{sc.icon}</span><span className="flex-1 text-sm">{sc.label}</span>
                <input inputMode="numeric" value={spend[sc.key] ? "₹" + spend[sc.key]!.toLocaleString("en-IN") : ""} onChange={(e) => setCat(sc.key, e.target.value.replace(/[^\d]/g, ""))} placeholder="₹0" className="w-24 bg-transparent text-right text-sm tabular outline-none" />
              </label>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-sm"><span className="text-muted">Total / month</span><span className="font-semibold tabular">{inr(total)}</span></div>
          <div className="mt-5 flex justify-end"><Button onClick={() => setStep(1)} disabled={total === 0}>Next</Button></div>
        </div>
      </div>
    );
  }

  // ---------- Step 1: details (age, income, existing cards, optional score) ----------
  return (
    <div className="max-w-2xl">
      <div className="rounded-xl border border-line bg-surface p-5">
        <div className="text-sm font-semibold">2 · A few details so we only suggest cards you'll get</div>
        <div className="mt-4 space-y-5">
          {/* Age */}
          <div>
            <div className="mb-1 flex justify-between text-sm"><span>Your age</span><span className="font-medium tabular">{age} yrs</span></div>
            <input type="range" min={18} max={70} value={age} onChange={(e) => setAge(+e.target.value)} className="w-full accent-brand" />
            <p className="mt-1 text-xs text-muted">Some cards require a minimum age — this keeps suggestions eligible.</p>
          </div>
          {/* Income */}
          <div>
            <div className="mb-1 flex justify-between text-sm"><span>Annual income</span><span className="font-medium tabular">{inr(income)}</span></div>
            <input type="range" min={300000} max={5000000} step={100000} value={income} onChange={(e) => setIncome(+e.target.value)} className="w-full accent-brand" />
          </div>
          {/* Credit score — optional with Skip */}
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>Credit score <span className="text-muted">(optional)</span></span>
              {score === null
                ? <button onClick={() => setScore(750)} className="text-xs text-brand">+ Add score</button>
                : <button onClick={() => setScore(null)} className="text-xs text-muted">Skip / don't know</button>}
            </div>
            {score === null
              ? <div className="rounded-lg border border-dashed border-line px-3 py-2 text-xs text-muted">No problem — we'll recommend without it. Many people don't know their exact score.</div>
              : <><input type="range" min={650} max={850} step={10} value={score} onChange={(e) => setScore(+e.target.value)} className="w-full accent-brand" /><div className="text-right text-xs tabular text-muted">{score}</div></>}
          </div>
          {/* Existing cards — with Skip */}
          <div>
            <div className="mb-1 text-sm">Cards you already have <span className="text-muted">(optional — improves results)</span></div>
            {owned.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {owned.map((id) => { const c = allCards.find((x) => x.id === id)!; return <span key={id} className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-2 py-1 text-xs">{c.name}<button onClick={() => setOwned(owned.filter((x) => x !== id))} className="text-muted">×</button></span>; })}
              </div>
            )}
            <input value={ownQuery} onChange={(e) => setOwnQuery(e.target.value)} placeholder="Search to add a card you own…" className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-brand" />
            {ownResults.map((c) => <button key={c.id} onClick={() => { setOwned([...owned, c.id]); setOwnQuery(""); }} className="mt-1 block w-full rounded-md p-2 text-left text-sm hover:bg-surface-2">{c.name} · <span className="text-muted">{c.bank}</span></button>)}
            <p className="mt-1 text-xs text-muted">We'll exclude these and suggest cards that complement them. Leave empty to skip.</p>
          </div>
          {/* Preferences */}
          <div className="flex flex-wrap gap-2">
            {([["preferNoFee", "Prefer no annual fee"], ["wantLounge", "Want lounge access"], ["wantLowForex", "Travel abroad / low forex"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setPrefs((p) => ({ ...p, [k]: !p[k] }))} className={`rounded-lg px-3 py-1.5 text-sm ${prefs[k] ? "bg-brand text-brand-fg" : "border border-line text-fg-2"}`}>{l}</button>
            ))}
          </div>
        </div>
        <div className="mt-5 flex justify-between"><Button variant="ghost" onClick={() => setStep(0)}>Back</Button><Button onClick={run} disabled={loading}>{loading ? "Analysing…" : "See my matches"}</Button></div>
      </div>
    </div>
  );
}
