"use client";
import { useState } from "react";
import Link from "next/link";
import { CreditCard } from "@/lib/types";
import { CardArt, Button, inr } from "@/components/ui";

export function AdminPanel({ initialCards }: { initialCards: CreditCard[] }) {
  const [cards, setCards] = useState(initialCards);
  const [editing, setEditing] = useState<Partial<CreditCard> | null>(null);
  const [msg, setMsg] = useState("");

  async function save() {
    if (!editing?.id || !editing?.name) { setMsg("ID and name are required."); return; }
    const payload: CreditCard = {
      id: editing.id!, slug: editing.slug || editing.id!, name: editing.name!, bank: editing.bank || "Unknown",
      network: editing.network || ["Visa"], category: (editing.category as CreditCard["category"]) || "Rewards",
      tier: (editing.tier as CreditCard["tier"]) || "Mid", color: editing.color || "#2f54eb",
      joiningFee: Number(editing.joiningFee) || 0, annualFee: Number(editing.annualFee) || 0, annualFeeWaiver: Number(editing.annualFeeWaiver) || 0,
      baseRate: Number(editing.baseRate) || 0.01, rewardRules: editing.rewardRules || [], rewardCurrency: editing.rewardCurrency || "Reward Points", pointValue: Number(editing.pointValue) || 0.25,
      minIncomeAnnual: Number(editing.minIncomeAnnual) || 300000, minCreditScore: Number(editing.minCreditScore) || 720, minAge: Number(editing.minAge) || 18,
      loungeVisitsDomestic: Number(editing.loungeVisitsDomestic) || 0, loungeVisitsIntl: Number(editing.loungeVisitsIntl) || 0, forexMarkup: Number(editing.forexMarkup) || 3.5,
      welcomeBonusValue: Number(editing.welcomeBonusValue) || 0, welcomeBonusDesc: editing.welcomeBonusDesc || "", benefits: editing.benefits || [], bestFor: editing.bestFor || [],
      summary: editing.summary || "", pros: editing.pros || [], cons: editing.cons || [],
    };
    const r = await fetch("/api/admin/cards", { method: "POST", body: JSON.stringify(payload) });
    if (!r.ok) { setMsg("Save failed (are you admin?)."); return; }
    setCards((cs) => { const i = cs.findIndex((c) => c.id === payload.id); if (i >= 0) { const n = [...cs]; n[i] = payload; return n; } return [...cs, payload]; });
    setEditing(null); setMsg("Saved.");
  }
  async function del(id: string) {
    if (!confirm("Delete this card?")) return;
    const r = await fetch(`/api/admin/cards?id=${id}`, { method: "DELETE" });
    if (r.ok) setCards((cs) => cs.filter((c) => c.id !== id));
  }

  const F = (k: keyof CreditCard, label: string, type = "text") => (
    <label className="block"><span className="text-xs text-muted">{label}</span>
      <input type={type} value={(editing?.[k] as string | number) ?? ""} onChange={(e) => setEditing({ ...editing, [k]: e.target.value })} className="mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-brand" />
    </label>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm text-muted">{cards.length} cards</div>
          <Button size="sm" onClick={() => setEditing({ id: "", name: "" })}>+ Add card</Button>
        </div>
        <div className="overflow-hidden rounded-xl border border-line">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-left text-xs uppercase text-muted"><tr><th className="p-3">Card</th><th className="p-3">Category</th><th className="p-3 text-right">Fee</th><th className="p-3"></th></tr></thead>
            <tbody>
              {cards.map((c) => (
                <tr key={c.id} className="border-t border-line">
                  <td className="p-3"><div className="flex items-center gap-2"><CardArt card={c} className="h-8 w-12" /><span className="font-medium">{c.name}</span></div></td>
                  <td className="p-3 text-fg-2">{c.category}</td>
                  <td className="p-3 text-right tabular">{c.annualFee ? inr(c.annualFee) : "Free"}</td>
                  <td className="p-3 text-right"><button onClick={() => setEditing(c)} className="text-brand">Edit</button> <button onClick={() => del(c.id)} className="ml-2 text-neg">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="lg:sticky lg:top-20 lg:h-fit">
        {editing ? (
          <div className="rounded-xl border border-line bg-surface p-4">
            <div className="mb-3 font-semibold">{editing.id ? "Edit card" : "New card"}</div>
            <div className="space-y-3">
              {F("id", "ID (slug-safe)")}{F("name", "Name")}{F("bank", "Bank")}{F("category", "Category")}
              <div className="grid grid-cols-2 gap-2">{F("annualFee", "Annual fee", "number")}{F("baseRate", "Base rate (e.g. 0.01)", "number")}</div>
              <div className="grid grid-cols-2 gap-2">{F("minIncomeAnnual", "Min income", "number")}{F("loungeVisitsDomestic", "Lounge/yr", "number")}</div>
              {F("color", "Brand colour (hex)")}{F("summary", "Summary")}
            </div>
            {msg && <div className="mt-2 text-xs text-muted">{msg}</div>}
            <div className="mt-3 flex gap-2"><Button size="sm" onClick={save}>Save</Button><Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button></div>
          </div>
        ) : (
          <div className="rounded-xl border border-line bg-surface p-4 text-sm text-muted">
            Select a card to edit, or add a new one. <div className="mt-3"><Link href="/analytics" className="text-brand">View platform analytics →</Link></div>
            {msg && <div className="mt-2">{msg}</div>}
          </div>
        )}
      </aside>
    </div>
  );
}
