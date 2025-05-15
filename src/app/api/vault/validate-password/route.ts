// // /api/vault/validate-password.ts

// import { NextRequest, NextResponse } from 'next/server';
// import connectDB from '@/lib/mongodb';
// import User from '@/models/User';
// import bcrypt from 'bcryptjs'; // Use bcrypt or another library you're using for password hashing
// import { decryptData } from '@/utils/encryption';
// import { getServerSession } from 'next-auth';
// import crypto from 'crypto';
// import { authOptions } from '@/app/api/auth/[...nextauth]/options';
// export async function POST(req: NextRequest) {
//     const { masterPassword } = await req.json();
//     const EMAIL_HMAC_SECRET = process.env.EMAIL_SECRET!;

//     if (!masterPassword) {
//         return NextResponse.json({ error: 'Email and master password are required' }, { status: 400 });
//     }
//     try {
//         await connectDB();

//         const session = await getServerSession(authOptions);

//         if (!session || !session.user || !session.user.email) {
//             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//         }

//         const emailHmac = crypto.createHmac('sha256', EMAIL_HMAC_SECRET).update(session.user.email).digest('hex');



//         // Retrieve user using the hashed email
//         const user = await User.findOne({ emailHmac });


//         if (!user) {
//             return NextResponse.json({ error: 'User not found' }, { status: 404 });
//         }

//         // Compare the provided master password with the stored hashed master password
//         const isPasswordValid = await bcrypt.compare(masterPassword, user?.masterPassword);
//         console.log('Is Password Valid:', isPasswordValid);
//         if (!isPasswordValid) {
//             return NextResponse.json({ error: 'Invalid master password' }, { status: 401 });
//         }

//         return NextResponse.json({ success: true });
//     } catch (error) {
//         console.error('[Validate Password] Error:', error);
//         return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//     }
// }
// /api/vault/validate-password.ts

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function POST(req: NextRequest) {
    try {
        const { masterPassword } = await req.json();
        console.log('Master Password:', masterPassword);
        if (!masterPassword) {
            return NextResponse.json({ error: 'Master password is required' }, { status: 400 });
        }

        const EMAIL_HMAC_SECRET = process.env.EMAIL_SECRET;
        if (!EMAIL_HMAC_SECRET) {
            return NextResponse.json({ error: 'Missing server configuration.' }, { status: 500 });
        }

        await connectDB();

        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const emailHmac = crypto
            .createHmac('sha256', EMAIL_HMAC_SECRET)
            .update(session.user.email)
            .digest('hex');

        const user = await User.findOne({ emailHmac });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isPasswordValid = await bcrypt.compare(masterPassword, user.masterPassword);
        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Invalid master password' }, { status: 401 });
        }


        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Validate Password] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
