'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import { getTermsConditionsPage } from '@/services/api/sanity';
import MeStoreFooter from '@/components/store/MeFooter';
import CircularLoadingScreen from '@/components/MeCircularLoadingScreen';
import { TermsConditionsData } from '@/utils/types';


export default function TermsConditionsPage() {
    const [termsData, setTermsData] = useState<TermsConditionsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);

    useEffect(() => {
        // Fetch terms & conditions data
        const fetchData = async () => {
            try {
                const data = await getTermsConditionsPage();
                setTermsData(data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching terms & conditions data:', error);
                setIsLoading(false);
            }
        };

        // Simulate loading progress
        const interval = setInterval(() => {
            setLoadingProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 10;
            });
        }, 200);

        fetchData();

        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return (
            <CircularLoadingScreen
                progress={loadingProgress}
                isDataLoaded={loadingProgress === 90}
                onLoadingComplete={() => setLoadingProgress(100)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col justify-between">
            {/* Hero section */}
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border-b border-white/10 h-[400px]">
                {/* Image Background */}
                <div className="absolute inset-0">
                    {termsData?.heroImage && (
                        <Image
                        src={termsData.heroImage}
                        alt={termsData.heroTitle || 'Terms & Conditions'}
                        fill
                        className="object-cover h-96 w-full"
                        priority
                        />
                    )}
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-6xl mx-auto px-4 flex flex-col justify-center h-full">
                    {termsData && <h1 className="text-4xl font-bold text-white">{termsData.heroTitle}</h1>}
                    {termsData?.heroSubtitle && (
                        <h2 className="text-3xl text-gray-300">{termsData.heroSubtitle}</h2>
                    )}
                </div>
            </div>

            {/* Main content */}
            <div className="pt-24 px-4 pb-16">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-12 text-center"
                    >
                        <h1 className="text-4xl font-bold mb-4">Terms & Conditions</h1>
                        <div className="bg-white/5 h-1 w-24 mx-auto rounded-full"></div>
                        {termsData?.lastUpdated && (
                            <p className="text-gray-400 mt-4">Last updated: {new Date(termsData.lastUpdated).toLocaleDateString()}</p>
                        )}
                    </motion.div>

                    <div className="bg-white/5 rounded-lg p-8 backdrop-blur-sm border border-white/10">
                        {termsData?.content && (
                            <div className="prose prose-invert max-w-none">
                                {Array.isArray(termsData.content) ? (
                                    <PortableText value={Array.isArray(termsData.content) ? termsData.content.filter(item => typeof item === 'object') : []} />
                                ) : (
                                    <p>{termsData.content}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <MeStoreFooter setFilter={() => {}} getCategories={() => ['All']} />
        </div>
    );
}