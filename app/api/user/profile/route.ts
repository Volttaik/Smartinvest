import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { verifyToken } from '@/lib/server-auth';

export async function PUT(req: NextRequest) {
  try {
    const userId = verifyToken(req);
    await connectDB();
    const { date_of_birth, gender, address, phone, bio, nin } = await req.json();

    const user = await User.findByIdAndUpdate(
      userId,
      {
        date_of_birth, gender, address, phone, bio, nin,
        profile_completed: true,
        updated_at: new Date(),
      },
      { new: true }
    );
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({
      ok: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile_picture: user.profile_picture,
        balance: user.balance,
        referral_code: user.referral_code,
        profile_completed: user.profile_completed,
        date_of_birth: user.date_of_birth,
        gender: user.gender,
        address: user.address,
        phone: user.phone,
        bio: user.bio,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}
