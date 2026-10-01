'use client';

import { useState, useEffect } from 'react';
import { getTermsConditionsPage } from '@/services/api/sanity';
import LegalPageView from '@/components/views/LegalPageView';
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

    return <LegalPageView data={termsData} heading="Terms & Conditions" />;
}
