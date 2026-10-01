import { NextResponse, type NextRequest } from 'next/server';
import { adminEnv } from '@/lib/auth/env';
import { authorizeUrl, callbackUrl, randomToken } from '@/lib/auth/github';
import { OAUTH_COOKIE, OAUTH_TTL_SECONDS, cookieOptions, seal } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
    const env = adminEnv();
    if (!env) return new NextResponse(null, { status: 404 });

    const state = randomToken();
    const verifier = randomToken();
    const redirectUri = callbackUrl(env, request.nextUrl.origin);

    const response = NextResponse.redirect(authorizeUrl(env, redirectUri, state, verifier));
    response.cookies.set(OAUTH_COOKIE, await seal(env, 'oauth', { state, verifier }, OAUTH_TTL_SECONDS), cookieOptions(OAUTH_TTL_SECONDS));
    return response;
}
