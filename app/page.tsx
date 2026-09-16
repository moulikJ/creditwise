import Link from "next/link";
import { Shell } from "@/components/shell";
import { CardArt, Button, inr } from "@/components/ui";
import { ScrollReveal } from "@/components/scroll-reveal";
import { cardRepo } from "@/lib/repo";
import { CARD_CATEGORIES } from "@/lib/types";

const CAT_META: Record<string, { icon: string; blurb: string }> = {
  Cashback: { icon: "💸", blurb: "Direct money back on every spend" },
  Travel: { icon: "✈️", blurb: "Miles, lounges and low forex" },
  Fuel: { icon: "⛽", blurb: "Save big at the pump" },
  Shopping: { icon: "🛍️", blurb: "Online & retail rewards" },
  Premium: { icon: "👑", blurb: "Lounges, concierge, high rewards" },
  Student: { icon: "🎓", blurb: "Easy entry, build your score" },
  Rewards: { icon: "🎁", blurb: "Flexible points programs" },
  "Co-brand": { icon: "🤝", blurb: "Brand-specific accelerators" },
};

const VERIFIED_IDS = ["hdfc-pixel-play", "hdfc-swiggy", "airtel-axis", "axis-cashback", "scapia-axis"];

export default function HomePage() {
  const cards = cardRepo.all();
  const featured = cards.filter((c) => ["amazon-pay-icici", "hdfc-millennia", "scapia-federal", "axis-atlas"].includes(c.id));
  const verifiedCards = cards.filter((c) => VERIFIED_IDS.includes(c.id));
  const counts = CARD_CATEGORIES.map((cat) => ({ cat, n: cards.filter((c) => c.category === cat).length }));

  return (
    <Shell>
      <section className="relative grid items-center gap-10 overflow-hidden py-8 md:grid-cols-[1.02fr_.98fr] md:py-16">
        <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-brand-soft opacity-60 blur-3xl" />
        <ScrollReveal className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-pos" /> Credit card intelligence
          </span>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl" style={{ fontFamily: "var(--font-display)" }}>
            Find the card that pays you the most.
          </h1>
          <p className="mt-5 max-w-xl text-fg-2 md:text-lg md:leading-8">
            Compare {cards.length}+ Indian credit cards, calculate your real rewards after fees, and get a personalised recommendation based on how you actually spend.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href="/recommend" size="lg">Find my best card →</Button>
            <Button href="/explore" size="lg" variant="secondary">Browse cards</Button>
          </div>
          <form action="/explore" className="mt-5 flex max-w-xl items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5 shadow-sm transition-all duration-300 focus-within:border-brand focus-within:shadow-md">
            <span className="text-muted" aria-hidden="true">⌕</span>
            <input name="q" aria-label="Search cards" placeholder="Search a card, bank or category…" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
            <button className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-brand-fg transition hover:opacity-90 active:scale-95">Search</button>
          </form>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
            <span>✓ Reward maths included</span><span>✓ Fees accounted for</span><span>✓ Issuer-source checks</span>
          </div>
        </ScrollReveal>

        <ScrollReveal className="relative hidden md:block" delay={120}>
          <div className="relative mx-auto max-w-xl rounded-3xl border border-line bg-surface p-5 shadow-2xl shadow-black/5">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div><div className="text-xs font-semibold uppercase tracking-wider text-muted">How CreditWise thinks</div><div className="mt-1 text-lg font-semibold">Your spending → your real value</div></div>
              <span className="rounded-full bg-pos-soft px-2.5 py-1 text-xs font-semibold text-pos">Calculated</span>
            </div>
            <div className="mt-5 space-y-3">
              {[{ n: "01", t: "Understand your spend", d: "Shopping · dining · travel · bills", icon: "₹" }, { n: "02", t: "Calculate rewards", d: "Rewards minus annual fees", icon: "×" }, { n: "03", t: "Show your shortlist", d: "Cards ranked by your estimated value", icon: "✓" }].map((x, i) => (
                <div key={x.n} className="flex items-center gap-3 rounded-2xl border border-line bg-bg p-3.5 transition hover:-translate-y-0.5 hover:border-brand/40">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft font-semibold text-brand">{x.icon}</div>
                  <div className="min-w-0 flex-1"><div className="text-xs font-semibold text-muted">{x.n}</div><div className="font-medium">{x.t}</div><div className="text-xs text-fg-2">{x.d}</div></div>
                  {i < 2 && <div className="hidden text-muted sm:block">↓</div>}
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-brand p-4 text-brand-fg shadow-lg">
              <div className="flex items-end justify-between gap-4"><div><div className="text-xs opacity-75">Example annual net value</div><div className="mt-1 text-2xl font-semibold">₹18,420</div></div><div className="text-right text-xs opacity-80">after fees<br />for your spend</div></div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <ScrollReveal>
        <section className="mt-4">
          <div className="flex items-end justify-between gap-4"><div><h2 className="text-lg font-semibold">What are you looking for?</h2><p className="mt-1 text-sm text-muted">Start with a goal instead of scrolling through every card.</p></div><Link href="/explore" className="hidden text-sm font-medium text-brand sm:inline">View all →</Link></div>
          <div className="scroll-pop-grid mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {counts.map(({ cat, n }) => <Link key={cat} href={`/explore?category=${encodeURIComponent(cat)}`} className="group rounded-xl border border-line bg-surface p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand hover:shadow-lg"><div className="text-2xl transition-transform duration-300 group-hover:scale-125">{CAT_META[cat]?.icon}</div><div className="mt-2 font-medium">{cat}</div><div className="text-xs text-muted">{CAT_META[cat]?.blurb}</div><div className="mt-2 text-xs text-brand">{n} cards →</div></Link>)}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="mt-12 rounded-2xl border border-line bg-surface p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="text-xs font-semibold uppercase tracking-wider text-brand">Three clicks, not three hours</div><h2 className="mt-1 text-xl font-semibold">From confused to confident</h2><p className="mt-1 max-w-2xl text-sm text-muted">You don't need to understand every credit-card term before choosing one.</p></div><Button href="/recommend" size="sm">Try the recommender →</Button></div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[{ step: "1", title: "Tell us how you spend", body: "Add rough monthly numbers. No bank statements or complicated forms." }, { step: "2", title: "We do the maths", body: "We account for rewards, fees and the preferences you care about." }, { step: "3", title: "See what fits", body: "Get a shortlist with the estimated annual value and reasons behind it." }].map((x) => <div key={x.step} className="rounded-xl border border-line bg-bg p-4"><div className="grid h-8 w-8 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-fg">{x.step}</div><h3 className="mt-3 font-medium">{x.title}</h3><p className="mt-1 text-sm leading-6 text-fg-2">{x.body}</p></div>)}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="mt-10">
          <div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold">Popular starting points</h2><p className="mt-1 text-sm text-muted">A few cards worth comparing first.</p></div><Link href="/explore" className="text-sm font-medium text-brand">See all →</Link></div>
          <div className="scroll-pop-grid mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((c) => <Link key={c.id} href={`/card/${c.slug}`} className="group rounded-xl border border-line bg-surface p-4 transition-all duration-300 hover:-translate-y-2 hover:border-brand hover:shadow-xl"><div className="overflow-hidden rounded-lg"><div className="transition-transform duration-500 group-hover:scale-105"><CardArt card={c} className="h-28 w-full" /></div></div><div className="mt-3 font-medium">{c.name}</div><div className="text-xs text-muted">{c.bank}</div><div className="mt-2 flex items-center justify-between text-sm"><span className="text-fg-2">{c.annualFee ? inr(c.annualFee) + "/yr" : "Free"}</span><span className="font-medium text-pos">{(c.baseRate * 100).toFixed(1)}%+ back</span></div><div className="mt-3 text-xs font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">Compare this card →</div></Link>)}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="mt-10 rounded-2xl border border-brand/20 bg-brand-soft/40 p-5 md:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-surface px-3 py-1 text-xs font-semibold text-brand"><span className="h-1.5 w-1.5 rounded-full bg-pos" /> Issuer-source checked</div><h2 className="text-xl font-semibold">5 new cards, verified from issuer pages</h2><p className="mt-1 max-w-2xl text-sm text-fg-2">Benefits and fees below were checked against issuer sources on September 15, 2026. Terms can change, so each card keeps its issuer source for checking the latest details.</p></div><Link href="/explore" className="text-sm font-medium text-brand">Explore all {cards.length} cards →</Link></div>
          <div className="scroll-pop-grid mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {verifiedCards.map((c) => <Link key={c.id} href={`/card/${c.slug}`} className="group rounded-xl border border-line bg-surface p-3 transition-all duration-300 hover:-translate-y-2 hover:border-brand hover:shadow-xl"><div className="overflow-hidden rounded-lg"><div className="transition-transform duration-500 group-hover:scale-105"><CardArt card={c} className="h-24 w-full" /></div></div><div className="mt-3 text-sm font-semibold">{c.name}</div><div className="text-xs text-muted">{c.bank}</div><div className="mt-2 text-xs text-fg-2">{c.annualFee ? inr(c.annualFee) + "/yr" : "Lifetime free"}</div><div className="mt-2 text-xs font-medium text-pos">Issuer checked ✓</div></Link>)}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="mt-12">
          <div className="mb-4"><h2 className="text-lg font-semibold">Not sure where to start?</h2><p className="mt-1 text-sm text-muted">Use the tool that matches what you already know.</p></div>
          <div className="scroll-pop-grid grid gap-4 sm:grid-cols-3">
            {[{ t: "I want a recommendation", d: "Enter your monthly spending and get ranked cards.", href: "/recommend", c: "Start here →" }, { t: "I have 2–3 cards in mind", d: "Put them side-by-side and compare fees, rewards and perks.", href: "/compare", c: "Compare cards →" }, { t: "I want to understand credit cards", d: "Plain-English guides on scores, fees, rewards and common mistakes.", href: "/learn", c: "Learn the basics →" }].map((x) => <Link key={x.href} href={x.href} className="group rounded-xl border border-line bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand hover:shadow-lg"><div className="font-medium">{x.t}</div><div className="mt-1 text-sm text-fg-2">{x.d}</div><div className="mt-4 text-xs font-medium text-brand">{x.c}</div></Link>)}
          </div>
        </section>
      </ScrollReveal>
    </Shell>
  );
}
