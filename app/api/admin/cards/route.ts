import { NextRequest, NextResponse } from "next/server";
import { cardRepo } from "@/lib/repo";
import { getCurrentUser } from "@/lib/auth";

async function requireAdmin() {
  const user = await getCurrentUser();
  return user && user.role === "admin" ? user : null;
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const card = await req.json().catch(() => null);
  if (!card?.id || !card?.name) return NextResponse.json({ error: "id and name required" }, { status: 422 });
  return NextResponse.json({ card: cardRepo.upsert(card) });
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 422 });
  cardRepo.remove(id);
  return NextResponse.json({ ok: true });
}
