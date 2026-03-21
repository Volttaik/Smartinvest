import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Notification } from '@/lib/models/Notification';
import { signToken } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return NextResponse.json({ error: 'No account found with that email address' }, { status: 400 });
    if (!user.is_active) return NextResponse.json({ error: 'Account suspended. Contact support.' }, { status: 403 });
    if (!user.password_hash) return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 400 });

    await Notification.create({
      user_id: user._id,
      type: 'login',
      title: 'New Sign-In',
      message: `You signed in to your SmartInvest account. ${new Date().toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}`,
    });

    const token = signToken(String(user._id));
    return NextResponse.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile_picture: user.profile_picture,
        balance: user.balance,
        referral_code: user.referral_code,
        profile_completed: user.profile_completed ?? false,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
