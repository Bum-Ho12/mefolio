'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StoreData, StoreItem } from '@/utils/types';
import StoreFilter from '@/components/store/MeStoreFilter';
import { getStore, getStoreItems } from '@/services/api/sanity';
import StoreMeCard from '@/components/store/MeCard';
import MeStoreFooter from '@/components/store/MeFooter';
import Image from 'next/image';
import CircularLoadingScreen from '@/components/MeCircularLoadingScreen';
import MeAmbientBackground from '@/components/MeAmbientBackground';

export default function StorePage() {
    const [storeData, setStoreData] = useState<StoreData | null>(null);
    const [items, setItems] = useState<StoreItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<StoreItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);

    useEffect(() => {
        // Fetch store items
        const fetchItems = async () => {
            try {
                const data = await getStoreItems();
                const store = await getStore();
                setStoreData(store);
                setItems(data);
                setFilteredItems(data);
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

    useEffect(() => {
        // Filter items based on active category
        if (activeCategory) {
            setFilteredItems(items.filter(item => item.category === activeCategory));
        } else {
            setFilteredItems(items);
        }
    }, [activeCategory, items]);

    const handleFilterChange = (category: string | null) => {
        setActiveCategory(category);
    };

    // Function to set filter from footer
    const setFilter = (category: string) => {
        setActiveCategory(category);
    };

    // Function to get all unique categories
    const getCategories = () => {
        const categories = ['All'];
        items.forEach(item => {
            if (item.category && !categories.includes(item.category)) {
                categories.push(item.category);
            }
        });
        return categories;
    };

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
        <MeAmbientBackground>
            <div className="min-h-screen bg-transparent text-white flex flex-col justify-between w-full overflow-y-auto">

                {/* Hero section */}
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border-b border-white/10 h-[400px]">
                    {/* Image Background */}
                    <div className="absolute inset-0">
                        {storeData?.heroImage && (
                            <Image
                                src={storeData.heroImage}
                                alt={storeData.heroTitle || 'Hero Image'}
                                fill
                                className="object-cover h-96 w-full"
                                priority
                            />
                        )}
                        <div className="absolute inset-0 bg-black/40"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 max-w-6xl mx-auto px-4 flex flex-col justify-center h-full">
                        {storeData && <h1 className="text-4xl font-bold text-white">{storeData.heroTitle}</h1>}
                        {storeData?.heroSubtitle && (
                            <h2 className="text-3xl text-gray-300 ">{storeData.heroSubtitle}</h2>
                        )}
                    </div>
                </div>
                <div className="pt-24 px-4 pb-16">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mb-8 text-center"
                        >
                            <h1 className="text-4xl font-bold mb-4">{ storeData?.title }</h1>
                            <p className="text-gray-400 max-w-2xl mx-auto">
                                Browse my collection of apps, games, and merchandise.
                            </p>
                        </motion.div>

                        <StoreFilter onFilterChange={handleFilterChange} activeCategory={activeCategory} />

                        {filteredItems.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredItems.map((item) => (
                                    <StoreMeCard key={item.id.current} item={item} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <p className="text-gray-400 text-xl">
                                    No items found in this category.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                {/* Footer */}
                <MeStoreFooter setFilter={setFilter} getCategories={getCategories} />
            </div>
        </MeAmbientBackground>
    );
}