import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import connectDB from '@/lib/mongodb';
import PasswordRecord from '@/models/PasswordRecord';
import User from '@/models/User';
import crypto from 'crypto';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // 🔒 Recompute HMAC(email) to find user
        const EMAIL_SECRET = process.env.EMAIL_SECRET!;
        const emailHmac = crypto
            .createHmac('sha256', EMAIL_SECRET)
            .update(session.user.email)
            .digest('hex');

        // 🔍 Find user by emailHmac
        const user = await User.findOne({ emailHmac });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // ✅ Get vault records for the user
        const records = await PasswordRecord.find({ userId: user._id });

        return NextResponse.json({ records });
    } catch (error) {
        console.error('[Vault View] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
