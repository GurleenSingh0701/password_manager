import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import connectDB from '@/lib/mongodb';
import PasswordRecord from '@/models/PasswordRecord';
import User from '@/models/User';
import { deriveKey, encryptData } from '@/utils/encryption';
import crypto from 'crypto';

export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recordId, website, username, password, masterPassword } = await req.json();
    if (!recordId || !password || !masterPassword) {
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

    const record = await PasswordRecord.findOne({ _id: recordId, userId: user._id });
    if (!record) {
        return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const key = deriveKey(masterPassword, record.salt);
    const { encryptedData, iv, authTag } = encryptData(password, key);

    record.website = website;
    record.username = username;
    record.encryptedPassword = encryptedData;
    record.iv = iv;
    record.authTag = authTag;

    await record.save();

    return NextResponse.json({ success: true, record });
}
