import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { setAuthCookie } from "@/lib/session";
import { env } from "@/lib/env";
import { locale } from "@/lib/localization";
import { User } from "@/types/user";

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Magic link verification started');
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token) {
      console.log('❌ No token provided');
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    console.log('🔑 Token received:', token.slice(0, 20) + '...');
    const payload = verifyJwt<{ email: string }>(token);
    if (!payload || !payload.email) {
      console.log('❌ Invalid or expired token');
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    console.log('✅ Token valid for email:', payload.email);

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
      console.log('✅ User found/created:', user.email);
    } catch (err) {
      console.error('❌ DB error:', err);
      return NextResponse.json({ error: locale.error_internal, details: String(err) }, { status: 500 });
    }

    // Set session cookie
    try {
      const res = NextResponse.json({ user });
      setAuthCookie(res, user);
      console.log('✅ Auth cookie set');
      return res;
    } catch (err) {
      console.error('❌ Cookie error:', err);
      return NextResponse.json({ error: 'Failed to set auth cookie', details: String(err) }, { status: 500 });
    }
  } catch (err) {
    console.error('❌ Magic link verify error:', err);
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
} 