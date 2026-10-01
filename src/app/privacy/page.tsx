'use client';

import { useState, useEffect } from 'react';
import { getPrivacyPolicyPage } from '@/services/api/sanity';
import LegalPageView from '@/components/views/LegalPageView';
import CircularLoadingScreen from '@/components/MeCircularLoadingScreen';
import { PrivacyPolicyData } from '@/utils/types';


export default function PrivacyPolicyPage() {
    const [policyData, setPolicyData] = useState<PrivacyPolicyData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);

    useEffect(() => {
        // Fetch privacy policy data
        const fetchData = async () => {
            try {
                const data = await getPrivacyPolicyPage();
                setPolicyData(data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching privacy policy data:', error);
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

    return <LegalPageView data={policyData} heading="Privacy Policy" />;
}
