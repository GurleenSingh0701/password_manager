import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { encryptData, generateSalt, deriveKey } from '@/utils/encryption';

const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET!;
const EMAIL_HMAC_SECRET = process.env.EMAIL_SECRET!;

export async function POST(req: Request) {
    const { email, masterPassword } = await req.json();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!email || !emailRegex.test(email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (!masterPassword || !passwordRegex.test(masterPassword)) {
        return NextResponse.json({
            error: 'Password must be at least 8 characters, with letters and numbers',
        }, { status: 400 });
    }

    await connectDB();

    const salt = generateSalt();
    const key = deriveKey(ENCRYPTION_SECRET, salt);
    const { encryptedData: encryptedEmail, iv, authTag } = encryptData(email, key);
    const emailHmac = crypto.createHmac('sha256', EMAIL_HMAC_SECRET).update(email).digest('hex');

    const existingUser = await User.findOne({ emailHmac });
    if (existingUser) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(masterPassword, 12);

    const newUser = await User.create({
        encryptedEmail,
        emailHmac,
        emailSalt: salt,
        emailIV: iv,
        emailAuthTag: authTag,
        masterPassword: hashedPassword,
    });
    await newUser.save();
    return NextResponse.json({ message: "User registered", user: { email: email } });
}
