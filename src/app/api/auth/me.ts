import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/session';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  return NextResponse.json({ user });
} 