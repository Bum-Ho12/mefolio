'use client';

import { motion } from 'framer-motion';
import MeStoreFooter from '@/components/store/MeFooter';
import RichText from '@/components/RichText';
import PageHero from './PageHero';

export interface LegalPageData {
    heroImage?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    lastUpdated?: string;
    content?: unknown;
}

// Privacy Policy and Terms & Conditions share this layout.
export default function LegalPageView({ data, heading }: { data: LegalPageData | null; heading: string }) {
    const content = data?.content;

    return (
        <div className="min-h-screen bg-black text-white flex flex-col justify-between">
            <PageHero
                image={data?.heroImage}
                title={data ? data.heroTitle : undefined}
                subtitle={data?.heroSubtitle}
                fallbackAlt={heading}
            />

            {/* Main content */}
            <div className="pt-24 px-4 pb-16">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-12 text-center"
                    >
                        <h1 className="text-4xl font-bold mb-4">{heading}</h1>
                        <div className="bg-white/5 h-1 w-24 mx-auto rounded-full"></div>
                        {data?.lastUpdated && (
                            <p className="text-gray-400 mt-4">Last updated: {new Date(data.lastUpdated).toLocaleDateString()}</p>
                        )}
                    </motion.div>

                    <div className="bg-white/5 rounded-lg p-8 backdrop-blur-sm border border-white/10">
                        {Array.isArray(content) ? <RichText value={content} /> : content ? <p>{String(content)}</p> : null}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <MeStoreFooter />
        </div>
    );
}
