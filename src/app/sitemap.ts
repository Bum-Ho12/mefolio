import type { MetadataRoute } from "next";
import { getJourneysPage } from "@/services/api/sanity";
import { SITE_URL } from "@/lib/site";

// Rebuilt at most hourly so newly published journeys appear without a redeploy.
export const revalidate = 3600;

// Public routes that always exist. Add new top-level pages here.
// /terms&conditions is left out: Next writes it as /terms%26conditions, which 404s.
const STATIC_ROUTES = ["", "/journeys", "/store", "/about", "/contact", "/privacy"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // If Sanity is unreachable, still serve the static routes.
    const { journeys } = await getJourneysPage().catch(() => ({ journeys: [] as { slug: string; date?: string }[] }));
    return [
        ...STATIC_ROUTES.map((path) => ({ url: `${SITE_URL}${path}` })),
        ...journeys.map((j) => ({
            url: `${SITE_URL}/journeys/${j.slug}`,
            lastModified: j.date || undefined,
        })),
    ];
}
