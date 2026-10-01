import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { adminEnv } from './env';
import { SESSION_COOKIE, verifySessionToken, type Owner } from './session';

// The single authorization check for the admin. Proxy only does an optimistic
// redirect; every page, Server Action and route handler must call one of these.
export const getOwner = cache(async (): Promise<Owner | null> => {
    // Admin output must never be prerendered: the env and session are per request.
    await connection();
    const env = adminEnv();
    if (!env) return null;
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    return verifySessionToken(env, token);
});

// For admin pages: unknown visitors are sent to the login page, and if the admin is
// disabled the route does not exist at all.
export async function requireOwnerPage(): Promise<Owner> {
    await connection();
    if (!adminEnv()) notFound();
    const owner = await getOwner();
    if (!owner) redirect('/admin/login');
    return owner;
}

export class UnauthorizedError extends Error {
    constructor() {
        super('Not found');
    }
}

// For Server Actions and route handlers. The message is deliberately generic.
export async function requireOwner(): Promise<Owner> {
    const owner = await getOwner();
    if (!owner) throw new UnauthorizedError();
    return owner;
}
