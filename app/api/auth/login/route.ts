import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userRepo } from "@/lib/repo";
import { verifyPassword, createSession } from "@/lib/auth";

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email and password." }, { status: 422 });
  const user = userRepo.byEmail(parsed.data.email);
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash)))
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  await createSession(user.id);
  return NextResponse.json({ user: { id: user.id, name: user.name, role: user.role } });
}
