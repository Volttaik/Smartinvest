import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { signToken } from '@/lib/server-auth';

function generateReferralCode(username: string) {
  return username.toUpperCase().slice(0, 4) + Math.random().toString(36).substring(2, 7).toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { username, email, password, profilePicture, referralCode } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Username, email, and password are required' }, { status: 400 });
    }

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] });
    if (existing) return NextResponse.json({ error: 'Email or username already taken' }, { status: 400 });

    const password_hash = await bcrypt.hash(password, 12);
    const myReferralCode = generateReferralCode(username);
    let referredById = null;

    if (referralCode) {
      const referrer = await User.findOne({ referral_code: referralCode.toUpperCase() });
      if (referrer) referredById = referrer._id;
    }

    const newUser = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password_hash,
      profile_picture: profilePicture || 'avatar1',
      referral_code: myReferralCode,
      referred_by: referredById,
    });

    const token = signToken(String(newUser._id));
    return NextResponse.json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        profile_picture: newUser.profile_picture,
        balance: newUser.balance,
        referral_code: newUser.referral_code,
      },
    }, { status: 201 });
  } catch (err: any) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
