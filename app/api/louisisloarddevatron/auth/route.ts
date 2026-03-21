import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const ADMIN_EMAIL = 'louisisloarddevatron@devatron.com';
const SECRET = process.env.JWT_SECRET || 'smartinvest_fallback_secret';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || email.toLowerCase().trim() !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    const token = jwt.sign({ admin: true, email: ADMIN_EMAIL }, SECRET, { expiresIn: '12h' });
    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
