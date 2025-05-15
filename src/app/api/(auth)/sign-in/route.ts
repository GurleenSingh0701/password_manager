import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();
    const EMAIL_HMAC_SECRET = process.env.EMAIL_SECRET!;

    if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    try {
        await connectDB();

        // Hash the email with HMAC to match stored format
        const emailHmac = crypto.createHmac('sha256', EMAIL_HMAC_SECRET).update(email).digest('hex');
        const user = await User.findOne({ emailHmac });

        if (!user) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user.hashedPassword);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // If using NextAuth.js for sessions, sign in is handled on client
        // Otherwise, set a session/cookie/token here

        return NextResponse.json({ success: true, message: 'Sign-in successful' });
    } catch (err) {
        console.error('[SignIn] Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
