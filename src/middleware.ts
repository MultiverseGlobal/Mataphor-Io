import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
    const res = NextResponse.next();

    // 1. Fast Cookie Pre-flight Check
    // If there is no Supabase auth cookie, we know for certain the user is not authenticated.
    const hasAuthCookie = request.cookies.getAll().some(cookie => 
        cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token')
    );

    const isDashboardPath = request.nextUrl.pathname.startsWith('/dashboard');
    const isAuthPath = request.nextUrl.pathname === '/auth';

    // Fast-path: Immediate redirect or pass-through for guest/unauthenticated users
    if (!hasAuthCookie) {
        if (isDashboardPath) {
            return NextResponse.redirect(new URL('/auth', request.url));
        }
        return res;
    }

    let user = null;
    try {
        const supabase = createMiddlewareClient({ req: request, res });

        // Race the auth check against a 2.5-second timeout to prevent blocking 504 errors on Vercel
        const getUserPromise = supabase.auth.getUser();
        const timeoutPromise = new Promise<{ data: { user: null } }>((_, reject) => 
            setTimeout(() => reject(new Error('Supabase Auth response timeout')), 2500)
        );

        const { data } = await Promise.race([getUserPromise, timeoutPromise]);
        user = data?.user;
    } catch (error) {
        console.error('Middleware auth check failed or timed out:', error);
        if (isDashboardPath) {
            return NextResponse.redirect(new URL('/auth', request.url));
        }
    }

    // Protect /dashboard routes
    if (isDashboardPath && !user) {
        return NextResponse.redirect(new URL('/auth', request.url));
    }

    // Redirect authenticated users away from auth page
    if (isAuthPath && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return res;
}

export const config = {
    matcher: ['/dashboard/:path*', '/auth'],
};

