import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cardRepo, analyticsRepo, recRepo } from "@/lib/repo";
import { recommend } from "@/lib/engine";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  profile: z.record(z.string(), z.number().nonnegative()).default({}),
  incomeAnnual: z.number().nonnegative().optional(),
  creditScore: z.number().min(300).max(900).optional(),
  age: z.number().min(18).max(100).optional(),
  preferNoFee: z.boolean().optional(),
  wantLounge: z.boolean().optional(),
  wantLowForex: z.boolean().optional(),
  ownedCardIds: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });

  const results = recommend(cardRepo.all(), parsed.data as never).slice(0, 6);
  analyticsRepo.track({ type: "recommend", meta: { count: results.length } });

  const user = await getCurrentUser();
  if (user) {
    recRepo.add({ userId: user.id, spendProfile: parsed.data.profile as never, resultCardIds: results.map((r) => r.card.id) });
  }
  return NextResponse.json({ results });
}
