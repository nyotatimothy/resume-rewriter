import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
    RESEND_API_KEY: process.env.RESEND_API_KEY ? 'SET' : 'NOT SET',
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    FRONTEND_URL: process.env.FRONTEND_URL ? 'SET' : 'NOT SET',
    EMAIL_FROM: process.env.EMAIL_FROM ? 'SET' : 'NOT SET',
    MAGIC_LINK_EXPIRY_MINUTES: process.env.MAGIC_LINK_EXPIRY_MINUTES ? 'SET' : 'NOT SET',
  };
  
  return NextResponse.json({ 
    message: 'Environment variables status',
    envVars 
  });
} 