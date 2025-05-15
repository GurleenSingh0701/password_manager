import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });

    const isAuth = !!token;
    const isOnSignInPage = request.nextUrl.pathname === "/sign-in";

    if (isAuth && isOnSignInPage) {
        return NextResponse.redirect(new URL("/vault/view", request.url));
    }

    if (!isAuth && !isOnSignInPage) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    return NextResponse.next();
}


// Specify the paths where this middleware should apply
export const config = {
    matcher: ['/vault/view/:path*', '/sign-in', '/vault/:path*'], // Adjusted the paths as needed
};
