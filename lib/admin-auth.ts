import { NextRequest } from 'next/server';
import { verifyToken } from './server-auth';
import { connectDB } from './db';
import { User } from './models/User';

export async function verifyAdmin(req: NextRequest): Promise<string> {
  const userId = verifyToken(req);
  await connectDB();
  const user = await User.findById(userId).select('is_admin is_active');
  if (!user) {
    const err: any = new Error('User not found');
    err.status = 404;
    throw err;
  }
  if (!user.is_admin) {
    const err: any = new Error('Admin access required');
    err.status = 403;
    throw err;
  }
  if (!user.is_active) {
    const err: any = new Error('Account suspended');
    err.status = 403;
    throw err;
  }
  return userId;
}
