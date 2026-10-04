// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { getJourneysPage } from "@/services/api/sanity";
const BASE = "https://mefolio-three.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const { journeys } = await getJourneysPage().catch(() => ({ journeys: [] as { slug: string }[] }));
    return [
        { url: BASE }, { url: `${BASE}/journeys` }, { url: `${BASE}/store` },
        ...journeys.map((j) => ({ url: `${BASE}/journeys/${j.slug}` })),
    ];
}