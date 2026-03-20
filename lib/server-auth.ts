import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'smartinvest_fallback_secret';

export function getJwtSecret() {
  return JWT_SECRET;
}

export function verifyToken(req: NextRequest): string {
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    const err: any = new Error('No token provided');
    err.status = 401;
    throw err;
  }
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    const err: any = new Error('Invalid or expired token');
    err.status = 401;
    throw err;
  }
}

export function signToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}
