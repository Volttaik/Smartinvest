import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'smartinvest_fallback_secret';

export async function verifyAdmin(req: NextRequest): Promise<void> {
  const token = req.headers.get('x-admin-token');
  if (!token) {
    const err: any = new Error('Admin access required');
    err.status = 403;
    throw err;
  }
  try {
    const payload = jwt.verify(token, SECRET) as any;
    if (!payload.admin) {
      const err: any = new Error('Admin access required');
      err.status = 403;
      throw err;
    }
  } catch (e: any) {
    const err: any = new Error('Invalid or expired admin session');
    err.status = 403;
    throw err;
  }
}
