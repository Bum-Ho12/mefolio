'use client';

import { useState, useEffect } from 'react';
import { getContactPage } from '@/services/api/sanity';
import ContactView from '@/components/views/ContactView';
import CircularLoadingScreen from '@/components/MeCircularLoadingScreen';
import { ContactData } from '@/utils/types';


export default function ContactPage() {
    const [contactData, setContactData] = useState<ContactData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);

    useEffect(() => {
        // Fetch contact page data
        const fetchData = async () => {
        try {
            const data = await getContactPage();
            setContactData(data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching contact page data:', error);
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

    return <ContactView contactData={contactData} />;
}
