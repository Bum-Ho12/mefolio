import type { Metadata } from 'next';
import { getJourneysPage } from '@/services/api/sanity';
import JourneysView from '@/components/views/JourneysView';
import type { JourneysPageData } from '@/utils/types';

// Publishing revalidates this page straight away; the interval also picks up anything
// the Sanity CDN had not caught up with at that moment.
export const revalidate = 60;

export const metadata: Metadata = {
    title: 'Journeys | Bum ho',
    description: 'Stories from along the way.',
};

export default async function JourneysRoute() {
    let data: JourneysPageData;
    try {
        data = await getJourneysPage();
    } catch (error) {
        console.error('Error fetching journeys:', error);
        data = { title: 'Journeys', journeys: [] };
    }
    return <JourneysView data={data} />;
}
