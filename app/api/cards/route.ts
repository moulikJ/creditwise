import { NextRequest, NextResponse } from "next/server";
import { cardRepo, analyticsRepo } from "@/lib/repo";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase().trim();
  const category = searchParams.get("category");
  const bank = searchParams.get("bank");
  const maxFee = searchParams.get("maxFee");
  const benefit = searchParams.get("benefit"); // lounge | nofee | lowforex
  const sort = searchParams.get("sort") ?? "name";

  let cards = cardRepo.all();
  if (q) {
    cards = cards.filter((c) => (c.name + " " + c.bank + " " + c.category).toLowerCase().includes(q));
    analyticsRepo.track({ type: "search", query: q });
  }
  if (category && category !== "All") cards = cards.filter((c) => c.category === category);
  if (bank && bank !== "All") cards = cards.filter((c) => c.bank === bank);
  if (maxFee) cards = cards.filter((c) => c.annualFee <= Number(maxFee));
  if (benefit === "lounge") cards = cards.filter((c) => c.loungeVisitsDomestic >= 4);
  if (benefit === "nofee") cards = cards.filter((c) => c.annualFee === 0);
  if (benefit === "lowforex") cards = cards.filter((c) => c.forexMarkup <= 2);

  cards = [...cards].sort((a, b) => {
    if (sort === "fee") return a.annualFee - b.annualFee;
    if (sort === "feeDesc") return b.annualFee - a.annualFee;
    if (sort === "reward") return b.baseRate - a.baseRate;
    if (sort === "lounge") return b.loungeVisitsDomestic - a.loungeVisitsDomestic;
    return a.name.localeCompare(b.name);
  });

  return NextResponse.json({ cards, count: cards.length });
}
