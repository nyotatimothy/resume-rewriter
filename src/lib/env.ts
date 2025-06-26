import { z } from 'zod';

const envSchema = z.object({
  OPENAI_API_KEY: z.string().optional().default('sk-demo-key'),
  DATABASE_URL: z.string().optional().default('file:./dev.db'),
  JWT_SECRET: z.string().optional().default('demo-jwt-secret-change-in-production'),
  RESEND_API_KEY: z.string().optional().default('re_demo_key'),
  STRIPE_SECRET_KEY: z.string().optional().default('sk_test_demo'),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default('whsec_demo'),
  NEXTAUTH_SECRET: z.string().optional().default('demo-nextauth-secret'),
  NEXTAUTH_URL: z.string().optional().default('http://localhost:3000'),
  FRONTEND_URL: z.string().optional().default('http://localhost:3000'),
  EMAIL_FROM: z.string().optional().default('noreply@resumerewriter.com'),
  MAGIC_LINK_EXPIRY_MINUTES: z.string().optional().default('15'),
  ADMIN_API_KEY: z.string().optional().default('admin-demo-key'),
});

export const env = envSchema.parse(process.env); 