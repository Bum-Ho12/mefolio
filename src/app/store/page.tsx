'use client';

import { useState, useEffect } from 'react';
import { StoreData, StoreItem } from '@/utils/types';
import { getStore, getStoreItems } from '@/services/api/sanity';
import StoreView from '@/components/views/StoreView';
import CircularLoadingScreen from '@/components/MeCircularLoadingScreen';

export default function StorePage() {
    const [storeData, setStoreData] = useState<StoreData | null>(null);
    const [items, setItems] = useState<StoreItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);

    useEffect(() => {
        // Fetch store items
        const fetchItems = async () => {
            try {
                const [data, store] = await Promise.all([getStoreItems(), getStore()]);
                setStoreData(store);
                setItems(data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching store items:', error);
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

        fetchItems();

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

    return <StoreView storeData={storeData} items={items} />;
}
