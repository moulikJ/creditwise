import { notFound } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { CardArt, Badge, Button, inr } from "@/components/ui";
import { FavButton } from "@/components/fav-button";
import { cardRepo, analyticsRepo } from "@/lib/repo";
import { SPEND_CATEGORIES } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = cardRepo.bySlug(slug);
  return { title: card ? `${card.name} — ${card.bank}` : "Card not found" };
}

export default async function CardDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = cardRepo.bySlug(slug);
  if (!card) notFound();
  analyticsRepo.track({ type: "view", cardId: card.id });

  const similar = cardRepo.all().filter((c) => c.id !== card.id && c.category === card.category).slice(0, 3);
  const ruleByCat = new Map(card.rewardRules.map((r) => [r.category, r]));

  return (
    <Shell>
      <Link href="/explore" className="text-sm text-brand">← Back to explore</Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          {/* Header */}
          <div className="flex flex-wrap items-start gap-5">
            <CardArt card={card} className="h-32 w-52" />
            <div className="flex-1">
              <div className="flex items-center gap-2"><Badge tone="brand">{card.category}</Badge><Badge>{card.tier}</Badge></div>
              <h1 className="mt-2 text-3xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>{card.name}</h1>
              <div className="text-fg-2">{card.bank} · {card.network.join(" / ")}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <FavButton cardId={card.id} />
                <Button href={`/recommend`} variant="secondary" size="sm">Recommend</Button>
                <Button href={`/compare?cards=${card.id}`} variant="secondary" size="sm">Compare</Button>
              </div>
            </div>
          </div>

          <p className="mt-6 text-fg-2">{card.summary}</p>

          {/* Quick stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Joining fee", card.joiningFee ? inr(card.joiningFee) : "Nil"],
              ["Annual fee", card.annualFee ? inr(card.annualFee) : "Lifetime free"],
              ["Base reward", (card.baseRate * 100).toFixed(1) + "%"],
              ["Forex markup", card.forexMarkup + "%"],
            ].map(([l, v]) => (
              <div key={l} className="rounded-xl border border-line bg-surface p-3"><div className="text-xs text-muted">{l}</div><div className="mt-1 font-semibold tabular">{v}</div></div>
            ))}
          </div>

          {/* Reward structure */}
          <Section title="Reward structure">
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full min-w-[420px] text-sm">
                <thead className="bg-surface-2 text-left text-xs uppercase text-muted"><tr><th className="p-3">Category</th><th className="p-3 text-right">Reward rate</th><th className="p-3 text-right">Monthly cap</th></tr></thead>
                <tbody>
                  {SPEND_CATEGORIES.map((sc) => {
                    const rule = ruleByCat.get(sc.key);
                    const rate = rule?.rate ?? card.baseRate;
                    const boosted = !!rule;
                    return (
                      <tr key={sc.key} className="border-t border-line">
                        <td className="p-3">{sc.icon} {sc.label}</td>
                        <td className={`p-3 text-right tabular ${boosted ? "font-semibold text-pos" : "text-fg-2"}`}>{(rate * 100).toFixed(2)}%</td>
                        <td className="p-3 text-right tabular text-muted">{rule?.monthlyCapValue ? inr(rule.monthlyCapValue) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-muted">Rewards paid in {card.rewardCurrency} (≈ {inr(card.pointValue)} per unit at best redemption).</p>
          </Section>

          {/* Benefits + best for */}
          <div className="grid gap-6 sm:grid-cols-2">
            <Section title="Key benefits">
              <ul className="space-y-2 text-sm">{card.benefits.map((b, i) => <li key={i} className="flex gap-2"><span className="text-brand">•</span>{b}</li>)}</ul>
            </Section>
            <Section title="Best for">
              <div className="flex flex-wrap gap-2">{card.bestFor.map((b) => <Badge key={b}>{b}</Badge>)}</div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg border border-line p-3"><div className="text-xs text-muted">Domestic lounge</div><div className="font-semibold">{card.loungeVisitsDomestic >= 99 ? "Unlimited" : card.loungeVisitsDomestic + "/yr"}</div></div>
                <div className="rounded-lg border border-line p-3"><div className="text-xs text-muted">Welcome bonus</div><div className="font-semibold">{card.welcomeBonusValue ? inr(card.welcomeBonusValue) : "—"}</div></div>
              </div>
            </Section>
          </div>

          {/* Pros & cons */}
          <Section title="Pros & cons">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-line bg-pos-soft/40 p-4"><div className="mb-2 text-sm font-semibold text-pos">Pros</div><ul className="space-y-1.5 text-sm">{card.pros.map((p, i) => <li key={i}>✓ {p}</li>)}</ul></div>
              <div className="rounded-xl border border-line bg-surface-2 p-4"><div className="mb-2 text-sm font-semibold text-warn">Cons</div><ul className="space-y-1.5 text-sm">{card.cons.map((p, i) => <li key={i}>– {p}</li>)}</ul></div>
            </div>
          </Section>
        </div>

        {/* Sidebar: eligibility + similar */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:h-fit">
          <div className="rounded-xl border border-line bg-surface p-5">
            <div className="text-sm font-semibold">Eligibility</div>
            <dl className="mt-3 space-y-2 text-sm">
              <Row k="Min. income" v={inr(card.minIncomeAnnual) + "/yr"} />
              <Row k="Min. credit score" v={String(card.minCreditScore)} />
              <Row k="Min. age" v={card.minAge + " yrs"} />
              <Row k="Fee waiver" v={card.annualFeeWaiver ? "Spend " + inr(card.annualFeeWaiver) : "—"} />
            </dl>
            <Button href={`/recommend`} className="mt-4 w-full" size="sm">Check if it fits me</Button>
            <div className="mt-3 border-t border-line pt-3 text-xs">
              {card.verified
                ? <div className="text-pos">✓ Core data verified{card.verifiedOn ? ` on ${new Date(card.verifiedOn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : ""}</div>
                : <div className="text-muted">Figures are indicative — confirm before applying.</div>}
              <a href={card.officialUrl || `https://www.google.com/search?q=${encodeURIComponent(card.bank + " " + card.name + " credit card official")}`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-brand">Check latest on official site →</a>
            </div>
          </div>
          {similar.length > 0 && (
            <div className="rounded-xl border border-line bg-surface p-5">
              <div className="text-sm font-semibold">Similar cards</div>
              <div className="mt-3 space-y-2">
                {similar.map((s) => (
                  <Link key={s.id} href={`/card/${s.slug}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-surface-2">
                    <CardArt card={s} className="h-9 w-14" /><div><div className="text-sm font-medium">{s.name}</div><div className="text-xs text-muted">{s.bank}</div></div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </Shell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-8"><h2 className="mb-3 text-lg font-semibold">{title}</h2>{children}</section>;
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between"><dt className="text-muted">{k}</dt><dd className="font-medium tabular">{v}</dd></div>;
}
