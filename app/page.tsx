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

const VERIFIED_IDS = [
  "hdfc-pixel-play",
  "hdfc-swiggy",
  "airtel-axis",
  "axis-cashback",
  "scapia-axis",
];

export default function HomePage() {
  const cards = cardRepo.all();

  const featured = cards.filter((c) =>
    ["amazon-pay-icici", "hdfc-millennia", "scapia-federal", "axis-atlas"].includes(c.id)
  );
  const verifiedCards = cards.filter((c) => VERIFIED_IDS.includes(c.id));

  const counts = CARD_CATEGORIES.map((cat) => ({
    cat,
    n: cards.filter((c) => c.category === cat).length,
  }));

  return (
    <Shell>
      {/* Hero */}
      <section className="grid items-center gap-8 py-6 md:grid-cols-2 md:py-12">
        <ScrollReveal>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand">
            Credit card intelligence
          </span>
          <h1
            className="mt-3 text-4xl font-semibold leading-tight md:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Find the card that pays you the most.
          </h1>
          <p className="mt-4 max-w-md text-fg-2">
            Compare {cards.length}+ Indian credit cards, calculate your real
            rewards after fees, and get a personalised recommendation built
            around how you actually spend.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/recommend" size="lg">Get my recommendation</Button>
            <Button href="/explore" size="lg" variant="secondary">Browse all cards</Button>
          </div>
          <form
            action="/explore"
            className="mt-6 flex max-w-md items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 transition-all duration-300 focus-within:border-brand focus-within:shadow-md"
          >
            <span className="text-muted">⌕</span>
            <input name="q" placeholder="Search by bank or card name…" className="flex-1 bg-transparent text-sm outline-none" />
            <button className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-brand-fg transition-all duration-200 hover:scale-105 active:scale-95">
              Search
            </button>
          </form>
        </ScrollReveal>

        <ScrollReveal className="hidden md:block" delay={120}>
          <div className="relative h-72">
            {featured.map((c, i) => (
              <div key={c.id} className="absolute" style={{ left: `${i * 70}px`, top: `${i * 34}px`, zIndex: i }}>
                <div className="transition-all duration-500 hover:-translate-y-4 hover:scale-105" style={{ transform: `rotate(${i * 3 - 4}deg)` }}>
                  <CardArt card={c} className="h-44 w-72" />
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      <ScrollReveal>
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Browse by category</h2>
          <div className="scroll-pop-grid mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {counts.map(({ cat, n }) => (
              <Link key={cat} href={`/explore?category=${encodeURIComponent(cat)}`} className="group rounded-xl border border-line bg-surface p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand hover:shadow-lg">
                <div className="text-2xl transition-transform duration-300 group-hover:scale-125">{CAT_META[cat]?.icon}</div>
                <div className="mt-2 font-medium">{cat}</div>
                <div className="text-xs text-muted">{CAT_META[cat]?.blurb}</div>
                <div className="mt-2 text-xs text-brand transition-transform duration-300 group-hover:translate-x-1">{n} cards →</div>
              </Link>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Featured cards</h2>
            <Link href="/explore" className="text-sm text-brand transition-all duration-200 hover:translate-x-1">See all →</Link>
          </div>
          <div className="scroll-pop-grid mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((c) => (
              <Link key={c.id} href={`/card/${c.slug}`} className="group rounded-xl border border-line bg-surface p-4 transition-all duration-300 hover:-translate-y-2 hover:border-brand hover:shadow-xl">
                <div className="overflow-hidden rounded-lg"><div className="transition-transform duration-500 group-hover:scale-105"><CardArt card={c} className="h-28 w-full" /></div></div>
                <div className="mt-3 font-medium">{c.name}</div>
                <div className="text-xs text-muted">{c.bank}</div>
                <div className="mt-2 flex items-center justify-between text-sm"><span className="text-fg-2">{c.annualFee ? inr(c.annualFee) + "/yr" : "Free"}</span><span className="font-medium text-pos transition-transform duration-200 group-hover:scale-105">{(c.baseRate * 100).toFixed(1)}%+ back</span></div>
              </Link>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="mt-10 rounded-2xl border border-brand/20 bg-brand-soft/40 p-5 md:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-surface px-3 py-1 text-xs font-semibold text-brand">
                <span className="h-1.5 w-1.5 rounded-full bg-pos" /> Official-source checked
              </div>
              <h2 className="text-xl font-semibold">5 new cards, verified from issuer pages</h2>
              <p className="mt-1 max-w-2xl text-sm text-fg-2">
                Benefits and fees below were checked against the banks&apos; official card pages on September 15, 2026. Terms can change, so every card links back to its issuer source.
              </p>
            </div>
            <Link href="/explore" className="text-sm font-medium text-brand">Explore all {cards.length} cards →</Link>
          </div>
          <div className="scroll-pop-grid mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {verifiedCards.map((c) => (
              <Link key={c.id} href={`/card/${c.slug}`} className="group rounded-xl border border-line bg-surface p-3 transition-all duration-300 hover:-translate-y-2 hover:border-brand hover:shadow-xl">
                <div className="overflow-hidden rounded-lg"><div className="transition-transform duration-500 group-hover:scale-105"><CardArt card={c} className="h-24 w-full" /></div></div>
                <div className="mt-3 text-sm font-semibold">{c.name}</div>
                <div className="text-xs text-muted">{c.bank}</div>
                <div className="mt-2 text-xs text-fg-2">{c.annualFee ? inr(c.annualFee) + "/yr" : "Lifetime free"}</div>
                <div className="mt-2 text-xs font-medium text-pos">Verified ✓</div>
              </Link>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="mt-12">
          <div className="scroll-pop-grid grid gap-4 sm:grid-cols-3">
            {[{ t: "Smart Recommendation", d: "Enter your spend; get ranked cards with built-in reward maths.", href: "/recommend" }, { t: "Side-by-side Compare", d: "Put up to 3 cards head-to-head.", href: "/compare" }, { t: "Learn the basics", d: "Plain-English guides on scores, fees and mistakes.", href: "/learn" }].map((x) => (
              <Link key={x.href} href={x.href} className="group rounded-xl border border-line bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand hover:shadow-lg">
                <div className="font-medium transition-transform duration-200 group-hover:translate-x-1">{x.t}</div>
                <div className="mt-1 text-sm text-fg-2">{x.d}</div>
                <div className="mt-3 text-xs text-brand opacity-0 transition-opacity duration-300 group-hover:opacity-100">Explore →</div>
              </Link>
            ))}
          </div>
        </section>
      </ScrollReveal>
    </Shell>
  );
}
