import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { setAuthCookie } from "@/lib/session";
import { env } from "@/lib/env";
import { locale } from "@/lib/localization";
import { User } from "@/types/user";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const payload = verifyJwt<{ email: string }>(token);
  if (!payload || !payload.email) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  // Find or create user
  let user: User | null = null;
  try {
    const dbUser = await prisma.user.upsert({
      where: { email: payload.email },
      update: {},
      create: { email: payload.email },
    });
    user = {
      id: dbUser.id,
      email: dbUser.email,
      isPro: dbUser.isPro,
      createdAt: dbUser.createdAt.toISOString(),
    };
  } catch (err) {
    return NextResponse.json({ error: locale.error_internal }, { status: 500 });
  }

  // Set session cookie
  const res = NextResponse.json({ user });
  setAuthCookie(res, user);

  return res;
}
