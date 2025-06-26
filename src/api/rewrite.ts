import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { openai } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { getUserFromRequest } from "@/lib/session";
import { env } from "@/lib/env";
import { locale } from "@/lib/localization";
import { RewriteRequest, RewriteResponse } from "@/types/rewrite";

const RewriteSchema = z.object({
  resume: z.string().max(3000),
  jobDescription: z.string().max(3000),
  template: z.string().max(3000),
  userEmail: z.string().email().optional(),
});

async function checkQuota(email: string | null, ip: string): Promise<boolean> {
  // Free: 1 rewrite/day, Pro: unlimited
  if (!email) {
    // Anonymous: 1/day per IP
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const count = await prisma.submission.count({
      where: {
        email: null,
        createdAt: { gte: since },
        template: "anonymous",
        id: { contains: ip },
      },
    });
    return count < 1;
  }
  // Check user
  const user = await prisma.user.findUnique({ where: { email } });
  if (user?.isPro) return true;
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const count = await prisma.submission.count({
    where: { email, createdAt: { gte: since } },
  });
  return count < 1;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  // Rate limit: 10/min per IP
  const { limited } = rateLimit(req, { windowMs: 60_000, max: 10, keyPrefix: "rewrite" });
  if (limited) {
    return NextResponse.json({ error: locale.error_too_many_requests }, { status: 429 });
  }

  const body = await req.json();
  const parse = RewriteSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { resume, jobDescription, template, userEmail } = parse.data;

  // Determine user (from session or email)
  let email: string | null = null;
  const user = getUserFromRequest(req);
  if (user) email = user.email;
  else if (userEmail) email = userEmail;

  // Enforce quota
  const allowed = await checkQuota(email, ip);
  if (!allowed) {
    return NextResponse.json({ error: locale.error_quota_exceeded }, { status: 401 });
  }

  // Call GPT-4
  let gptResponse: RewriteResponse;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are Resume Rewriter, an expert at tailoring resumes to job descriptions. Rewrite the resume to best match the job description, but do not fabricate or exaggerate. Output structured sections and formatted markdown.",
        },
        {
          role: "user",
          content: `Resume:\n${resume}\n\nJob Description:\n${jobDescription}\n\nTemplate:\n${template}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1200,
    });

    // Expecting a JSON response with sections and markdown
    gptResponse = JSON.parse(completion.choices[0].message.content || "{}");
    if (!gptResponse.sections || !gptResponse.markdown) {
      throw new Error("Malformed GPT response");
    }
  } catch (err) {
    return NextResponse.json({ error: locale.error_internal }, { status: 500 });
  }

  // Log submission
  try {
    await prisma.submission.create({
      data: {
        email: email || null,
        input: { resume, jobDescription, template },
        output: gptResponse,
        template: email ? "user" : "anonymous",
        // For anonymous, store IP in id for quota tracking
        id: email ? undefined : `${Date.now()}_${ip}`,
      },
    });
  } catch (err) {
    // Logging failure should not block response
  }

  return NextResponse.json(gptResponse);
}
