import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'smartinvest_fallback_secret';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('x-admin-token');
    if (!token) return NextResponse.json({ valid: false }, { status: 401 });
    const payload = jwt.verify(token, SECRET) as any;
    if (!payload.admin) return NextResponse.json({ valid: false }, { status: 401 });
    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}
