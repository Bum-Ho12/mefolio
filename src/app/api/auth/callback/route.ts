import { NextResponse, type NextRequest } from 'next/server';
import { adminEnv } from '@/lib/auth/env';
import { callbackUrl, fetchGithubIdentity, safeEqual } from '@/lib/auth/github';
import {
    OAUTH_COOKIE,
    SESSION_COOKIE,
    SESSION_TTL_SECONDS,
    cookieOptions,
    createSessionToken,
    unseal,
} from '@/lib/auth/session';

export async function GET(request: NextRequest) {
    const env = adminEnv();
    if (!env) return new NextResponse(null, { status: 404 });

    const origin = env.baseUrl ?? request.nextUrl.origin;
    // One generic failure for every reason, so the response never reveals whether
    // the GitHub account exists, is the owner, or the state simply expired.
    const fail = (reason: string) => {
        console.warn(`[admin] login rejected: ${reason}`, { ip: request.headers.get('x-forwarded-for') ?? 'unknown' });
        const res = NextResponse.redirect(`${origin}/admin/login?error=1`);
        res.cookies.delete(OAUTH_COOKIE);
        return res;
    };

    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state');
    const sealed = request.cookies.get(OAUTH_COOKIE)?.value;
    if (!code || !state || !sealed) return fail('missing code/state/cookie');

    const pending = await unseal(env, 'oauth', sealed);
    if (!pending || typeof pending.state !== 'string' || typeof pending.verifier !== 'string') return fail('bad oauth cookie');
    if (!safeEqual(pending.state, state)) return fail('state mismatch');

    const identity = await fetchGithubIdentity(env, code, pending.verifier, callbackUrl(env, request.nextUrl.origin));
    if (!identity) return fail('github exchange failed');
    if (!safeEqual(identity.githubId, env.githubId)) return fail(`non-owner github id ${identity.githubId}`);

    console.info('[admin] login', { login: identity.login });
    const res = NextResponse.redirect(`${origin}/admin`);
    res.cookies.delete(OAUTH_COOKIE);
    res.cookies.set(SESSION_COOKIE, await createSessionToken(env, identity), cookieOptions(SESSION_TTL_SECONDS));
    return res;
}
