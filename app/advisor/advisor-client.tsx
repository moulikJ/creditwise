"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { CreditCard } from "@/lib/types";
import { CardArt, inr } from "@/components/ui";

interface Scored { card: CreditCard; net: number; score: number; reasons: string[]; }
interface Msg { role: "user" | "bot"; text: string; results?: Scored[]; }

const EXAMPLES = [
  "I spend a lot on Amazon and Swiggy, want no annual fee",
  "Travel abroad twice a year, want lounge access and low forex",
  "₹50,000/month mostly on fuel and groceries, income 8 lakh",
];

export function Advisor() {
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "bot", text: "Hi! Describe how you spend — brands, categories, rough amounts, and anything you care about (no fee, lounges, travel). I'll suggest cards and explain why." }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    setMsgs((m) => [...m, { role: "user", text }]); setInput(""); setBusy(true);
    try {
      const r = await fetch("/api/advisor", { method: "POST", body: JSON.stringify({ message: text }) });
      const d = await r.json();
      setMsgs((m) => [...m, { role: "bot", text: d.reply || "Here's what I found.", results: d.results }]);
    } catch {
      setMsgs((m) => [...m, { role: "bot", text: "Something went wrong — try rephrasing." }]);
    } finally { setBusy(false); }
  }

  return (
    <div className="mx-auto flex h-[70vh] max-w-2xl flex-col rounded-xl border border-line bg-surface">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-brand text-brand-fg" : "bg-surface-2 text-fg"}`}>
              {m.text}
              {m.results && m.results.length > 0 && (
                <div className="mt-3 space-y-2">
                  {m.results.map((r) => (
                    <Link key={r.card.id} href={`/card/${r.card.slug}`} className="flex items-center gap-3 rounded-lg border border-line bg-surface p-2 hover:border-brand">
                      <CardArt card={r.card} className="h-10 w-16" />
                      <div className="flex-1">
                        <div className="font-medium">{r.card.name}</div>
                        <div className="text-xs text-muted">{r.reasons[0]}</div>
                      </div>
                      <div className="text-right text-xs"><div className="font-semibold tabular text-pos">{inr(r.net)}/yr</div><div className="text-muted">fit {r.score}</div></div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && <div className="text-sm text-muted">Thinking…</div>}
        <div ref={endRef} />
      </div>
      <div className="border-t border-line p-3">
        {msgs.length === 1 && (
          <div className="mb-2 flex flex-wrap gap-2">{EXAMPLES.map((e) => <button key={e} onClick={() => send(e)} className="rounded-full border border-line px-3 py-1 text-xs text-fg-2 hover:border-brand">{e}</button>)}</div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Describe your spending…" className="flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-brand" />
          <button className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-fg disabled:opacity-50" disabled={busy}>Send</button>
        </form>
      </div>
    </div>
  );
}
