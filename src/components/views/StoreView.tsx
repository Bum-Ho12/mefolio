'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { StoreData, StoreItem } from '@/utils/types';
import StoreFilter from '@/components/store/MeStoreFilter';
import StoreMeCard from '@/components/store/MeCard';
import MeStoreFooter from '@/components/store/MeFooter';
import MeAmbientBackground from '@/components/MeAmbientBackground';
import PageHero from './PageHero';

export default function StoreView({ storeData, items }: { storeData: StoreData | null; items: StoreItem[] }) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const filteredItems = activeCategory
        ? items.filter(item => item.category === activeCategory)
        : items;

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

    return (
        <MeAmbientBackground>
            <div className="min-h-screen bg-transparent text-white flex flex-col justify-between w-full overflow-y-auto">

                <PageHero
                    image={storeData?.heroImage}
                    title={storeData ? storeData.heroTitle : undefined}
                    subtitle={storeData?.heroSubtitle}
                    fallbackAlt="Hero Image"
                />
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