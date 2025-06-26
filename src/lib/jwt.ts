import * as jwt from 'jsonwebtoken';

export function signJwt(payload: any, expiresIn: string = '1h') {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export function verifyJwt<T = any>(token: string): T | null {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    return jwt.verify(token, secret) as T;
  } catch (error) {
    return null;
  }
} 