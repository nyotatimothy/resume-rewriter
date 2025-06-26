import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rateLimit";
import { signJwt } from "@/lib/jwt";
import { resend } from "@/lib/resend";
import { env } from "@/lib/env";
import { locale } from "@/lib/localization";

const EmailSchema = z.object({
  email: z.string().email({ message: locale.error_invalid_email }),
});

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Magic link request started');
    
    // Rate limit: 5/min per IP
    const { limited } = rateLimit(req, { windowMs: 60_000, max: 5, keyPrefix: "magic" });
    if (limited) {
      return NextResponse.json({ error: locale.error_too_many_requests }, { status: 429 });
    }

    const body = await req.json();
    const parse = EmailSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: parse.error.errors[0].message }, { status: 400 });
    }
    const { email } = parse.data;

    console.log('📧 Email to send to:', email);
    console.log('🔑 JWT Secret configured:', !!process.env.JWT_SECRET);
    console.log('📮 Resend API Key configured:', !!process.env.RESEND_API_KEY);
    console.log('📧 Email From configured:', process.env.EMAIL_FROM);

    // Generate 15-min JWT
    const token = signJwt({ email }, `${env.MAGIC_LINK_EXPIRY_MINUTES}m`);
    console.log('🎫 JWT Token generated successfully');

    // Magic link URL
    const url = `${env.FRONTEND_URL}/login?token=${token}`;
    console.log('🔗 Magic link URL:', url);

    // Send email via Resend
    console.log('📤 Attempting to send email...');
    const emailResult = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: email,
      subject: locale.magic_link_subject,
      html: `
        <p>${locale.magic_link_email_greeting}</p>
        <p>${locale.magic_link_email_body}</p>
        <a href="${url}" style="display:inline-block;padding:10px 20px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:4px;">${locale.magic_link_button}</a>
      `,
    });
    
    console.log('✅ Email sent successfully:', emailResult);

    return NextResponse.json({ success: true });
  } catch (err) {
    // Log the error for debugging
    console.error('❌ Magic link error:', err);
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 });
  }
} 