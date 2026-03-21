import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { verifyToken } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  try {
    const userId = verifyToken(req);
    await connectDB();
    const user = await User.findById(userId).select('-password_hash');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({
      id: user._id,
      username: user.username,
      email: user.email,
      profile_picture: user.profile_picture,
      balance: user.balance,
      referral_code: user.referral_code,
      referral_earnings: user.referral_earnings,
      total_earnings: user.total_earnings,
      profile_completed: user.profile_completed,
      date_of_birth: user.date_of_birth,
      gender: user.gender,
      address: user.address,
      phone: user.phone,
      bio: user.bio,
      nin: user.nin,
      is_active: user.is_active,
      is_admin: user.is_admin,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unauthorized' }, { status: err.status || 401 });
  }
}
