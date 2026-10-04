// Canonical origin of the deployed site, used by metadata, robots.txt and sitemap.xml.
// NEXT_PUBLIC_SITE_URL wins; on Vercel the production domain is the fallback.
function resolveSiteUrl(): string {
    const explicit = process.env.NEXT_PUBLIC_SITE_URL;
    if (explicit) return explicit.replace(/\/+$/, '');
    const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    if (vercel) return `https://${vercel}`;
    return 'http://localhost:3000';
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = 'Bumho Nisubire';
