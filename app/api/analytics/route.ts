import { NextRequest, NextResponse } from "next/server";
import { analyticsRepo } from "@/lib/repo";

export async function POST(req: NextRequest) {
  try {
    const e = await req.json();
    if (!e?.type) return NextResponse.json({ error: "type required" }, { status: 422 });
    analyticsRepo.track(e);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json(analyticsRepo.summary());
}
