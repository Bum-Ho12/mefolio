"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import JourneyCard from '@/components/journeys/JourneyCard';
import type { JourneysSectionData } from '@/utils/types';

// Home section: the featured journeys and a way to the full list. On phones the cards
// form a swipeable row so the section still fits one screen.
export default function JourneysSection({ journeys }: { journeys: JourneysSectionData }) {
    return (
        <div className="h-full w-full items-center overflow-y-auto max-h-screen scrollbar-hide pt-24 px-4 pb-10">
            <div className="max-w-6xl mx-auto">
                <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                    <h2 className="text-4xl font-bold">{journeys.title}</h2>
                    <Link href="/journeys" className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20">
                        More journeys <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 scrollbar-hide md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
                    {journeys.journeys.map((journey) => (
                        <div key={journey.slug} className="w-[80vw] max-w-sm shrink-0 snap-center md:w-auto md:max-w-none">
                            <JourneyCard journey={journey} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
