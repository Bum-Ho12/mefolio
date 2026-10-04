import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getJourney } from '@/services/api/sanity';
import JourneyView from '@/components/views/JourneyView';

type Params = Promise<{ slug: string }>;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Shared by generateMetadata and the page, so each request queries once.
const loadJourney = cache(async (slug: string) => (SLUG.test(slug) && slug.length <= 96 ? getJourney(slug) : null));

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const journey = await loadJourney((await params).slug);
    if (!journey) return { title: 'Journey not found' };
    return {
        title: `${journey.title}`,
        description: journey.excerpt,
        openGraph: {
            type: 'article',
            title: journey.title,
            description: journey.excerpt,
            images: journey.cover ? [`${journey.cover}?w=1200&h=630&fit=crop`] : undefined,
        },
    };
}

export default async function JourneyRoute({ params }: { params: Params }) {
    const journey = await loadJourney((await params).slug);
    if (!journey) notFound();
    return <JourneyView journey={journey} />;
}
