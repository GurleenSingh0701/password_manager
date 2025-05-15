import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";
import crypto from "crypto";
export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                masterPassword: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials) return null;

                await connectDB();

                const { email, masterPassword } = credentials;

                // 🔒 Compute HMAC of email for lookup
                const emailHmac = crypto.createHmac('sha256', process.env.EMAIL_SECRET!)
                    .update(email)
                    .digest('hex');

                // 🔍 Find user by email HMAC
                const user = await User.findOne({ emailHmac });
                if (!user) {
                    throw new Error('Invalid email or password');
                }

                const isPasswordValid = await bcrypt.compare(masterPassword, user.masterPassword);
                if (!isPasswordValid) {
                    throw new Error('Invalid email or password');
                }

                return {
                    id: user._id.toString(),
                    email: email,  // decrypted or raw as needed
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/sign-in",
        newUser: "/vault/view",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.email = token.email;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET!,
};
