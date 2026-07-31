import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userRepo } from "@/lib/repo";
import { hashPassword, createSession } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid details. Password must be 6+ characters." }, { status: 422 });
  const { name, email, password } = parsed.data;
  if (userRepo.byEmail(email))
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

  // Demo convenience: an email containing "admin" provisions an admin account,
  // so the Admin dashboard is reachable without a separate seeding step.
  const role: "user" | "admin" = /admin/i.test(email) ? "admin" : "user";
  const user = userRepo.create({ name, email, passwordHash: await hashPassword(password), role });
  await createSession(user.id);
  return NextResponse.json({ user: { id: user.id, name: user.name, role: user.role } });
}
