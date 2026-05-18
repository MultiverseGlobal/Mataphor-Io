import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

/**
 * Auth callback route
 * Handles OAuth redirects and email confirmations
 */
export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        const supabase = await createServerClient();
        await supabase.auth.exchangeCodeForSession(code);
    }

    // Redirect to dashboard after successful auth
    return NextResponse.redirect(new URL('/dashboard', request.url));
}
