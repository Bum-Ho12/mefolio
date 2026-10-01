'use client';

import { useState, useEffect } from 'react';
import { getAboutPage } from '@/services/api/sanity';
import AboutView from '@/components/views/AboutView';
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

    return <AboutView data={aboutData} />;
}
