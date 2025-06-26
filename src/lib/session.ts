import { NextResponse } from 'next/server';
import { signJwt, verifyJwt } from './jwt';
import { User } from '@/types/user';

const COOKIE_NAME = 'auth_token';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export function setAuthCookie(response: NextResponse, user: User) {
  const token = signJwt({ userId: user.id, email: user.email }, `${COOKIE_MAX_AGE}s`);
  
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
  
  return response;
}

export function getUserFromRequest(req: Request): User | null {
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  
  const payload = verifyJwt(token);
  if (!payload || !payload.userId || !payload.email) return null;
  
  return {
    id: payload.userId,
    email: payload.email,
    isPro: payload.isPro || false,
    createdAt: payload.createdAt || new Date().toISOString(),
  };
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  
  return response;
} 