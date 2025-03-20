'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { StoreItem } from '@/utils/types';
import { getStoreItems } from '@/services/api/sanity';
import StoreMeCard from './MeCard';

interface RelatedProductsProps {
    currentItemId: string;
    currentCategory: string;
    limit?: number;
}

export default function RelatedProducts({ currentItemId, currentCategory, limit = 3 }: RelatedProductsProps) {
    const [relatedItems, setRelatedItems] = useState<StoreItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch related items - this would come from your API
        const fetchRelatedItems = async () => {
        try {
            // This should be replaced with your actual API call
            // Example: const data = await getRelatedStoreItems(currentItemId, currentCategory);

            // For now we'll simulate this with getStoreItems and filter client-side
            const data =  await getStoreItems();

            // Filter out current item and get items in the same category
            const filtered = data
            .filter(item => item.id.current !== currentItemId)
            // .filter(item => item.category === currentCategory)
            .slice(0, limit);

            setRelatedItems(filtered);
            setIsLoading(false);
            console.log('Related items:', filtered);
        } catch (error) {
            console.error('Error fetching related items:', error);
            setIsLoading(false);
        }
        };

        fetchRelatedItems();
    }, [currentItemId, currentCategory, limit]);

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold">You might also like</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array(3).fill(0).map((_, index) => (
                        <div key={index} className="bg-white/5 rounded-xl h-64 animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (relatedItems.length === 0) {
        return null;
    }

    return (
        <div className="bg-white/5 py-12 border-t border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4">
                <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                >
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold">You might also like</h2>
                        <Link href="/store" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
                            <span>View all</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {relatedItems.map((item) => (
                            <StoreMeCard key={item.id.current} item={item} />
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}