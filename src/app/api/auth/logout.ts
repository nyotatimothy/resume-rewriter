import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/session';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true });
  clearAuthCookie(response);
  return response;
} 