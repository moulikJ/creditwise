import { NextRequest, NextResponse } from "next/server";
import { favRepo } from "@/lib/repo";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ favorites: favRepo.forUser(user.id).map((f) => f.cardId) });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { cardId } = await req.json().catch(() => ({}));
  if (!cardId) return NextResponse.json({ error: "cardId required" }, { status: 422 });
  const active = favRepo.toggle(user.id, cardId);
  return NextResponse.json({ active });
}
