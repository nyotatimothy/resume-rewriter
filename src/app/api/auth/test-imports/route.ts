import { NextRequest, NextResponse } from 'next/server';

// Test imports one by one
try {
  const { rateLimit } = require('@/lib/rateLimit');
  console.log('rateLimit import successful');
} catch (error) {
  console.log('rateLimit import failed:', error);
}

try {
  const { signJwt } = require('@/lib/jwt');
  console.log('signJwt import successful');
} catch (error) {
  console.log('signJwt import failed:', error);
}

try {
  const { resend } = require('@/lib/resend');
  console.log('resend import successful');
} catch (error) {
  console.log('resend import failed:', error);
}

try {
  const { env } = require('@/lib/env');
  console.log('env import successful');
} catch (error) {
  console.log('env import failed:', error);
}

try {
  const { locale } = require('@/lib/localization');
  console.log('locale import successful');
} catch (error) {
  console.log('locale import failed:', error);
}

export async function GET() {
  return NextResponse.json({ message: 'Import test completed - check server logs' });
} 