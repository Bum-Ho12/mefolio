'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import { TypedObject } from '@portabletext/types'
import { getAboutPage } from '@/services/api/sanity';
import MeStoreFooter from '@/components/store/MeFooter';
import CircularLoadingScreen from '@/components/MeCircularLoadingScreen';
import { AboutData } from '@/utils/types';


export default function AboutPage() {
    const [aboutData, setAboutData] = useState<AboutData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);

    useEffect(() => {
        // Fetch about page data
        const fetchData = async () => {
        try {
            const data = await getAboutPage();
            setAboutData(data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching about page data:', error);
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
                    {aboutData?.heroImage && (
                        <Image
                        src={aboutData.heroImage}
                        alt={aboutData.heroTitle || 'About Us'}
                        fill
                        className="object-cover h-96 w-full"
                        priority
                        />
                    )}
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-6xl mx-auto px-4 flex flex-col justify-center h-full">
                    {aboutData && <h1 className="text-4xl font-bold text-white">{aboutData.heroTitle}</h1>}
                    {aboutData?.heroSubtitle && (
                        <h2 className="text-3xl text-gray-300">{aboutData.heroSubtitle}</h2>
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
                        <h1 className="text-4xl font-bold mb-4">About Us</h1>
                        <div className="bg-white/5 h-1 w-24 mx-auto rounded-full"></div>
                    </motion.div>

                    {aboutData?.content && (
                        <div className="prose prose-invert max-w-none mb-16">
                        {Array.isArray(aboutData.content) && aboutData.content.every(item => typeof item === 'object') ? (
                            <PortableText value={aboutData.content as TypedObject[]} />
                        ) : null}
                        </div>
                    )}

                    {aboutData?.team && aboutData.team.length > 0 && (
                        <div className="mt-16">
                            <h2 className="text-3xl font-bold mb-8 text-center">Meet Our Team</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {aboutData.team.map((member, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="bg-white/5 rounded-lg p-4 backdrop-blur-sm border border-white/10"
                                >
                                    <div className="aspect-square relative mb-4 overflow-hidden rounded-lg">
                                        {member.image && (
                                            <Image
                                            src={member.image}
                                            alt={member.name}
                                            fill
                                            className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold">{member.name}</h3>
                                    <p className="text-blue-400 mb-2">{member.role}</p>
                                    <p className="text-gray-400 text-sm">{member.bio}</p>
                                </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <MeStoreFooter setFilter={() => {}} getCategories={() => ['All']} />
        </div>
    );
}