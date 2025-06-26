import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { User } from "@/types/user";

export async function GET(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key");
  if (adminKey !== env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const result: User[] = users.map((u) => ({
    id: u.id,
    email: u.email,
    isPro: u.isPro,
    createdAt: u.createdAt.toISOString(),
  }));

  return NextResponse.json({ users: result });
}
