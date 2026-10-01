import 'server-only';

// Everything the admin needs. If any value is missing or malformed the admin is
// treated as disabled (every admin route 404s) instead of running half-configured.
export interface AdminEnv {
    githubId: string;
    githubClientId: string;
    githubClientSecret: string;
    sessionKey: Uint8Array;
    sessionVersion: string;
    baseUrl?: string;
}

let warned = false;

export function adminEnv(): AdminEnv | null {
    if (process.env.ADMIN_ENABLED !== 'true') return null;

    const githubId = process.env.ADMIN_GITHUB_ID ?? '';
    const githubClientId = process.env.GITHUB_CLIENT_ID ?? '';
    const githubClientSecret = process.env.GITHUB_CLIENT_SECRET ?? '';
    const secret = process.env.ADMIN_SESSION_SECRET ?? '';
    // Accepts 32 random bytes as base64 (`openssl rand -base64 32`) or hex (`openssl rand -hex 32`).
    const sessionKey = /^[0-9a-fA-F]{64}$/.test(secret) ? Buffer.from(secret, 'hex') : Buffer.from(secret, 'base64');

    const problems = [
        !/^\d+$/.test(githubId) && 'ADMIN_GITHUB_ID (numeric GitHub user id)',
        !githubClientId && 'GITHUB_CLIENT_ID',
        !githubClientSecret && 'GITHUB_CLIENT_SECRET',
        sessionKey.length !== 32 && 'ADMIN_SESSION_SECRET (32 bytes as base64 or hex)',
        !process.env.SANITY_WRITE_TOKEN && 'SANITY_WRITE_TOKEN',
    ].filter(Boolean);

    if (problems.length) {
        if (!warned) {
            console.warn(`[admin] disabled; missing or invalid env: ${problems.join(', ')}`);
            warned = true;
        }
        return null;
    }

    return {
        githubId,
        githubClientId,
        githubClientSecret,
        sessionKey: new Uint8Array(sessionKey),
        sessionVersion: process.env.ADMIN_SESSION_VERSION || '1',
        baseUrl: process.env.ADMIN_BASE_URL?.replace(/\/$/, '') || undefined,
    };
}
