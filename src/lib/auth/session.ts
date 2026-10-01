import 'server-only';
import { EncryptJWT, jwtDecrypt, type JWTPayload } from 'jose';
import type { AdminEnv } from './env';

const secure = process.env.NODE_ENV === 'production';

// `__Host-` cookies must be Secure, host-only and Path=/, so a sibling subdomain
// (e.g. the store subdomain) cannot plant or overwrite them. Browsers only accept
// the prefix over HTTPS, so plain names are used in local development.
export const SESSION_COOKIE = secure ? '__Host-mefolio_admin' : 'mefolio_admin';
export const OAUTH_COOKIE = secure ? '__Host-mefolio_oauth' : 'mefolio_oauth';

export const SESSION_TTL_SECONDS = 8 * 60 * 60;
export const OAUTH_TTL_SECONDS = 10 * 60;

export const cookieOptions = (maxAge: number) => ({
    httpOnly: true,
    secure,
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
});

type Purpose = 'session' | 'oauth';

// Tokens are encrypted (JWE, A256GCM), not just signed: contents are opaque to the
// browser and any tampering fails decryption. `purpose` stops an OAuth-state token
// from being replayed as a session.
export async function seal(env: AdminEnv, purpose: Purpose, claims: JWTPayload, ttlSeconds: number) {
    return new EncryptJWT({ ...claims, purpose })
        .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
        .setIssuedAt()
        .setExpirationTime(`${ttlSeconds}s`)
        .encrypt(env.sessionKey);
}

export async function unseal(env: AdminEnv, purpose: Purpose, token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtDecrypt(token, env.sessionKey, { keyManagementAlgorithms: ['dir'], contentEncryptionAlgorithms: ['A256GCM'] });
        return payload.purpose === purpose ? payload : null;
    } catch {
        return null;
    }
}

export interface Owner {
    githubId: string;
    login: string;
}

export async function createSessionToken(env: AdminEnv, owner: Owner) {
    return seal(env, 'session', { sub: owner.githubId, login: owner.login, ver: env.sessionVersion }, SESSION_TTL_SECONDS);
}

// A session is valid only for the configured owner and the current session version,
// so rotating ADMIN_SESSION_VERSION (or the secret) logs out every browser.
export async function verifySessionToken(env: AdminEnv, token: string | undefined): Promise<Owner | null> {
    if (!token) return null;
    const payload = await unseal(env, 'session', token);
    if (!payload || payload.sub !== env.githubId || payload.ver !== env.sessionVersion) return null;
    return { githubId: payload.sub, login: String(payload.login ?? '') };
}
