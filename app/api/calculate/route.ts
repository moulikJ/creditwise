import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cardRepo, analyticsRepo } from "@/lib/repo";
import { valuateCard } from "@/lib/engine";

const schema = z.object({
  cardIds: z.array(z.string()).min(1),
  profile: z.record(z.string(), z.number().nonnegative()).default({}),
  loungeVisitsUsed: z.number().nonnegative().optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 422 });

  const { cardIds, profile, loungeVisitsUsed } = parsed.data;
  const out = cardRepo.byIds(cardIds).map((card) => ({
    card,
    valuation: valuateCard(card, profile as never, { loungeVisitsUsed, loungeValuePerVisit: 1000 }),
  }));
  analyticsRepo.track({ type: "calculate", meta: { cards: cardIds.length } });
  return NextResponse.json({ results: out });
}
