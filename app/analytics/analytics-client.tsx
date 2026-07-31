"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface Summary {
  totals: { views: number; compares: number; searches: number; recommends: number; calculates: number; all: number };
  mostViewed: [string, number][]; mostCompared: [string, number][]; topSearches: [string, number][];
}
const COLORS = ["#2f54eb", "#15a34a", "#e8730c", "#7c3aed", "#e0586a", "#0f9d96"];

export function AnalyticsDash({ cardNames }: { cardNames: Record<string, string> }) {
  const [s, setS] = useState<Summary | null>(null);
  useEffect(() => { fetch("/api/analytics").then((r) => r.json()).then(setS).catch(() => {}); }, []);
  if (!s) return <div className="text-muted">Loading metrics…</div>;

  const funnel = [
    { k: "Views", v: s.totals.views }, { k: "Compares", v: s.totals.compares },
    { k: "Calculates", v: s.totals.calculates }, { k: "Recommends", v: s.totals.recommends }, { k: "Searches", v: s.totals.searches },
  ];
  const viewed = s.mostViewed.map(([id, n]) => ({ name: cardNames[id] || id, n }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[["Total events", s.totals.all], ["Card views", s.totals.views], ["Compares", s.totals.compares], ["Calculations", s.totals.calculates], ["Recommendations", s.totals.recommends], ["Searches", s.totals.searches]].map(([l, v]) => (
          <div key={l as string} className="rounded-xl border border-line bg-surface p-4"><div className="text-xs text-muted">{l}</div><div className="mt-1 text-2xl font-semibold tabular">{v as number}</div></div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-3 text-sm font-semibold">Engagement by feature</div>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer><BarChart data={funnel}><XAxis dataKey="k" stroke="var(--color-muted)" fontSize={12} /><YAxis stroke="var(--color-muted)" fontSize={12} /><Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-line)", borderRadius: 8 }} /><Bar dataKey="v" fill="var(--color-brand)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-3 text-sm font-semibold">Most viewed cards</div>
          {viewed.length === 0 ? <div className="grid h-[240px] place-items-center text-sm text-muted">No views tracked yet — browse some cards.</div> : (
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer><PieChart><Pie data={viewed} dataKey="n" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(e) => e.name}>{viewed.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-3 text-sm font-semibold">Most compared</div>
          {s.mostCompared.length === 0 ? <div className="text-sm text-muted">No comparisons yet.</div> : (
            <table className="w-full text-sm"><tbody>{s.mostCompared.map(([id, n]) => <tr key={id} className="border-t border-line first:border-0"><td className="py-2">{cardNames[id] || id}</td><td className="py-2 text-right tabular text-muted">{n}</td></tr>)}</tbody></table>
          )}
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-3 text-sm font-semibold">Top searches</div>
          {s.topSearches.length === 0 ? <div className="text-sm text-muted">No searches yet.</div> : (
            <div className="flex flex-wrap gap-2">{s.topSearches.map(([q, n]) => <span key={q} className="rounded-full bg-surface-2 px-3 py-1 text-sm">{q} <span className="text-muted">×{n}</span></span>)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
