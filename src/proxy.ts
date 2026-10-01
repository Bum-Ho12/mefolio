import { NextResponse, type NextRequest } from 'next/server';
import { adminEnv } from '@/lib/auth/env';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth/session';
import { rateLimit } from '@/lib/auth/rateLimit';

// Optimistic gate for the admin surface. Real authorization happens again in every
// page, action and route handler via lib/auth/dal.ts; this only keeps strangers from
// reaching admin code at all and attaches hardening headers.
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const env = adminEnv();
    if (!env) return new NextResponse(null, { status: 404 });

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (pathname.startsWith('/api/auth/') && !rateLimit(`auth:${ip}`, 10, 60_000)) {
        return withHeaders(new NextResponse('Too many requests', { status: 429 }));
    }
    if (pathname.startsWith('/api/admin/') && !rateLimit(`api:${ip}`, 120, 60_000)) {
        return withHeaders(new NextResponse('Too many requests', { status: 429 }));
    }

    const isPublicAdminPath = pathname === '/admin/login' || pathname.startsWith('/api/auth/');
    if (!isPublicAdminPath) {
        const owner = await verifySessionToken(env, request.cookies.get(SESSION_COOKIE)?.value);
        if (!owner) {
            if (pathname.startsWith('/api/')) return withHeaders(new NextResponse(null, { status: 404 }));
            return withHeaders(NextResponse.redirect(new URL('/admin/login', request.url)));
        }
    }

    return withHeaders(NextResponse.next());
}

function withHeaders(response: NextResponse) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('Referrer-Policy', 'no-referrer');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    // The preview iframe is same-origin; nothing else may frame the admin.
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('Content-Security-Policy', "frame-ancestors 'self'");
    return response;
}

export const config = {
    matcher: ['/admin/:path*', '/admin', '/api/admin/:path*', '/api/auth/:path*'],
};
