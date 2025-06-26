import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { Submission } from "@/types/rewrite";

export async function GET(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key");
  if (adminKey !== env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Format for API response
  const result: Submission[] = submissions.map((s) => ({
    id: s.id,
    email: s.email || undefined,
    input: s.input as any,
    output: s.output as any,
    createdAt: s.createdAt.toISOString(),
  }));

  return NextResponse.json({ submissions: result });
}
