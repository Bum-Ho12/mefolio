'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import MeStoreFooter from '@/components/store/MeFooter';
import RichText from '@/components/RichText';
import { formatJourneyDate } from '@/components/journeys/JourneyCard';
import type { Journey, JourneyLink } from '@/utils/types';

function Neighbour({ journey, label, align }: { journey: JourneyLink; label: string; align: 'left' | 'right' }) {
    return (
        <Link
            href={`/journeys/${journey.slug}`}
            className={`flex-1 rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-white/25 ${align === 'right' ? 'text-right' : ''}`}
        >
            <span className={`flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-400 ${align === 'right' ? 'justify-end' : ''}`}>
                {align === 'left' && <ArrowLeft className="h-3.5 w-3.5" />}
                {label}
                {align === 'right' && <ArrowRight className="h-3.5 w-3.5" />}
            </span>
            <span className="mt-1 block font-medium">{journey.title}</span>
        </Link>
    );
}

// A single journey: cover, title, then the body in a reading column that media can
// break out of. overflow-x-clip keeps full-bleed media from adding a horizontal scrollbar.
export default function JourneyView({ journey }: { journey: Journey }) {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col justify-between overflow-x-clip">
            <article className="px-4 pb-16 pt-10">
                <div className="mx-auto max-w-3xl">
                    <Link href="/journeys" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white">
                        <ArrowLeft className="h-4 w-4" /> All journeys
                    </Link>

                    <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-8">
                        <p className="text-sm uppercase tracking-wider text-gray-400">{formatJourneyDate(journey.date)}</p>
                        <h1 className="mt-2 text-4xl font-bold sm:text-5xl">{journey.title}</h1>
                        {journey.excerpt && <p className="mt-4 text-lg text-gray-300">{journey.excerpt}</p>}
                        {journey.tags.length > 0 && (
                            <ul className="mt-5 flex flex-wrap gap-2">
                                {journey.tags.map((tag) => (
                                    <li key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">{tag}</li>
                                ))}
                            </ul>
                        )}
                    </motion.header>

                    {journey.cover && (
                        <div className="relative mt-10 aspect-video overflow-hidden rounded-2xl bg-white/5 lg:-mx-24">
                            <Image src={journey.cover} alt="" fill priority sizes="(max-width: 1024px) 100vw, 960px" className="object-cover" />
                        </div>
                    )}

                    <RichText value={journey.body} className="mt-10 text-lg" />

                    {(journey.older || journey.newer) && (
                        <nav aria-label="More journeys" className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row">
                            {journey.older ? <Neighbour journey={journey.older} label="Earlier" align="left" /> : <span className="hidden flex-1 sm:block" />}
                            {journey.newer ? <Neighbour journey={journey.newer} label="Later" align="right" /> : <span className="hidden flex-1 sm:block" />}
                        </nav>
                    )}
                </div>
            </article>

            <MeStoreFooter setFilter={() => {}} getCategories={() => ['All']} />
        </div>
    );
}
