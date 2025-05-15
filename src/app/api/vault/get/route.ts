import { NextRequest, NextResponse } from 'next/server';
import { deriveKey } from '@/utils/encryption';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import VaultModel from '@/models/PasswordRecord';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recordId, masterPassword } = await req.json();
    if (!recordId || !masterPassword) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const emailHmac = crypto
        .createHmac('sha256', process.env.EMAIL_SECRET!)
        .update(session.user.email)
        .digest('hex');

    const user = await User.findOne({ emailHmac });
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const record = await VaultModel.findOne({ _id: recordId, userId: user._id });
    if (!record) {
        return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    try {
        // Verify the master password by attempting to derive the key
        const derivedKey = deriveKey(masterPassword, record.salt);
        if (!derivedKey) {
            throw new Error('Invalid master password');
        }
        return NextResponse.json({
            record: {
                _id: record._id,
                website: record.website,
                username: record.username,
                password: record.encryptedPassword, // encrypted string
                iv: record.iv,                      // hex string
                authTag: record.authTag,            // hex string
                salt: record.salt,                  // hex string
            },
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
}
