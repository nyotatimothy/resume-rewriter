import { NextRequest } from 'next/server';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyPrefix: string;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(req: NextRequest, options: RateLimitOptions) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const key = `${options.keyPrefix}:${ip}`;
  const now = Date.now();
  
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + options.windowMs,
    });
    return { limited: false };
  }
  
  if (current.count >= options.max) {
    return { limited: true };
  }
  
  // Increment count
  current.count++;
  rateLimitStore.set(key, current);
  
  return { limited: false };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute 