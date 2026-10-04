import Image from 'next/image';
import Link from 'next/link';
import { format, isValid, parseISO } from 'date-fns';
import type { JourneySummary } from '@/utils/types';

// Dates are stored as YYYY-MM-DD; formatting from the parsed parts avoids the day
// shifting with the visitor's time zone.
export function formatJourneyDate(date: string) {
    const parsed = parseISO(date);
    return isValid(parsed) ? format(parsed, 'MMM d, yyyy') : '';
}

export default function JourneyCard({ journey, sizes = '(max-width: 768px) 80vw, 33vw', priority = false }: { journey: JourneySummary; sizes?: string; priority?: boolean }) {
    return (
        <Link
            href={`/journeys/${journey.slug}`}
            className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg outline-none transition-colors hover:border-white/25 focus-visible:ring-2 focus-visible:ring-[#FFD3AC]"
        >
            <div className="relative aspect-video overflow-hidden bg-white/5">
                {journey.cover && (
                    <Image src={journey.cover} alt="" fill sizes={sizes} priority={priority} className="object-cover transition-transform duration-500 group-hover:scale-105" />
                )}
            </div>
            <div className="flex flex-1 flex-col p-5">
                <p className="text-xs uppercase tracking-wider text-gray-400">{formatJourneyDate(journey.date)}</p>
                <h3 className="mt-1 text-xl font-semibold text-white">{journey.title}</h3>
                {journey.excerpt && <p className="mt-2 line-clamp-3 text-sm text-gray-300">{journey.excerpt}</p>}
                <span className="mt-auto pt-4 text-sm font-medium text-[#FFD3AC]">Read journey →</span>
            </div>
        </Link>
    );
}
