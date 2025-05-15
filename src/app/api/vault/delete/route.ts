import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import VaultModel from '@/models/PasswordRecord';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';
import crypto from 'crypto';

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recordId } = await req.json();
    if (!recordId) {
        return NextResponse.json({ error: 'Missing record ID' }, { status: 400 });
    }

    try {
        await connectDB();

        // Compute emailHmac from session email
        const EMAIL_SECRET = process.env.EMAIL_SECRET!;
        const emailHmac = crypto
            .createHmac('sha256', EMAIL_SECRET)
            .update(session.user.email)
            .digest('hex');

        // Find user by emailHmac
        const user = await User.findOne({ emailHmac });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Delete only if the record belongs to the user
        const deleted = await VaultModel.findOneAndDelete({
            _id: recordId,
            userId: user._id,
        });

        if (!deleted) {
            return NextResponse.json({ error: 'Record not found or deletion failed' }, { status: 400 });
        }

        return NextResponse.json({
            message: 'Record deleted successfully',
        });
    } catch (error) {
        console.error('[Vault Delete] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
