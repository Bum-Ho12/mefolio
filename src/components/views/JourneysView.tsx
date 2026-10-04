'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import MeStoreFooter from '@/components/store/MeFooter';
import JourneyCard from '@/components/journeys/JourneyCard';
import type { JourneysPageData } from '@/utils/types';

// The /journeys page: every published journey, newest first.
export default function JourneysView({ data }: { data: JourneysPageData }) {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col justify-between">
            <div className="pt-10 sm:pt-16 px-4 pb-16">
                <div className="max-w-6xl mx-auto">
                    <Link href="/#journeys" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white">
                        <ArrowLeft className="h-4 w-4" /> Home
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-12 mt-6 text-center"
                    >
                        <h1 className="text-4xl font-bold mb-4">{data.title}</h1>
                        <div className="bg-white/5 h-1 w-24 mx-auto rounded-full"></div>
                        {data.description && <p className="text-gray-400 max-w-2xl mx-auto mt-4">{data.description}</p>}
                    </motion.div>

                    {data.journeys.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.journeys.map((journey, index) => (
                                // The first cover is the largest image on load now that the hero is gone.
                                <JourneyCard key={journey.slug} journey={journey} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" priority={index === 0} />
                            ))}
                        </div>
                    ) : (
                        <p className="py-16 text-center text-xl text-gray-400">No journeys yet.</p>
                    )}
                </div>
            </div>

            <MeStoreFooter />
        </div>
    );
}
