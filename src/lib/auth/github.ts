import 'server-only';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { AdminEnv } from './env';

const AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const TOKEN_URL = 'https://github.com/login/oauth/access_token';
const USER_URL = 'https://api.github.com/user';

export const randomToken = () => randomBytes(32).toString('base64url');

export function pkceChallenge(verifier: string) {
    return createHash('sha256').update(verifier).digest('base64url');
}

export function safeEqual(a: string, b: string) {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function callbackUrl(env: AdminEnv, requestOrigin: string) {
    return `${env.baseUrl ?? requestOrigin}/api/auth/callback`;
}

// No scopes are requested: the public profile (numeric id + login) is all we need,
// and the access token is discarded right after the identity check.
export function authorizeUrl(env: AdminEnv, redirectUri: string, state: string, verifier: string) {
    const url = new URL(AUTHORIZE_URL);
    url.searchParams.set('client_id', env.githubClientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('state', state);
    url.searchParams.set('scope', '');
    url.searchParams.set('allow_signup', 'false');
    url.searchParams.set('code_challenge', pkceChallenge(verifier));
    url.searchParams.set('code_challenge_method', 'S256');
    return url.toString();
}

export async function fetchGithubIdentity(env: AdminEnv, code: string, verifier: string, redirectUri: string) {
    const tokenRes = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_id: env.githubClientId,
            client_secret: env.githubClientSecret,
            code,
            redirect_uri: redirectUri,
            code_verifier: verifier,
        }),
        cache: 'no-store',
    });
    if (!tokenRes.ok) return null;
    const token = (await tokenRes.json()) as { access_token?: string };
    if (!token.access_token) return null;

    const userRes = await fetch(USER_URL, {
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token.access_token}`,
            'X-GitHub-Api-Version': '2022-11-28',
        },
        cache: 'no-store',
    });
    if (!userRes.ok) return null;
    const user = (await userRes.json()) as { id?: number; login?: string };
    if (typeof user.id !== 'number') return null;
    return { githubId: String(user.id), login: user.login ?? '' };
}
