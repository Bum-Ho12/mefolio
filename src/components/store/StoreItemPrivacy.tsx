'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import { StoreItem } from '@/utils/types';
import { Shield } from 'lucide-react';
import Link from 'next/link';
import MeStoreFooter from '@/components/store/MeFooter';
import { TypedObject } from '@portabletext/types';

export default function StoreItemPrivacyPage({
    item
}: {
    item: StoreItem
}) {
    // Check if privacy policy exists
    if (!item?.privacyPolicy) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">No Privacy Policy Available</h1>
                    <Link
                        href={`/store/${item.id.current}`}
                        className="text-blue-400 hover:text-blue-300 flex items-center justify-center gap-2"
                    >
                        <Shield className="w-5 h-5" />
                        Back to Product
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col justify-between">
            {/* Hero section */}
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border-b border-white/10 h-[400px]">
                {/* Image Background */}
                <div className="absolute inset-0">
                    {item.privacyPolicy.heroImage && (
                        <Image
                            src={item.privacyPolicy.heroImage}
                            alt={item.privacyPolicy.heroTitle || 'Privacy Policy'}
                            fill
                            className="object-cover h-96 w-full"
                            priority
                        />
                    )}
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-6xl mx-auto px-4 flex flex-col justify-center h-full">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/store/${item.id.current}`}
                            className="text-gray-300 hover:text-white flex items-center gap-2"
                        >
                            <Shield className="w-6 h-6" />
                            <span className="text-xl">Back to {item.name}</span>
                        </Link>
                    </div>
                    {item.privacyPolicy && (
                        <>
                            <h1 className="text-4xl font-bold text-white mt-4">{item.privacyPolicy.heroTitle || 'Privacy Policy'}</h1>
                            {item.privacyPolicy.heroSubtitle && (
                                <h2 className="text-3xl text-gray-300">{item.privacyPolicy.heroSubtitle}</h2>
                            )}
                        </>
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
                        <h1 className="text-4xl font-bold mb-4">{item.name} Privacy Policy</h1>
                        <div className="bg-white/5 h-1 w-24 mx-auto rounded-full"></div>
                        {item.privacyPolicy?.lastUpdated && (
                            <p className="text-gray-400 mt-4">
                                Last updated: {new Date(item.privacyPolicy.lastUpdated).toISOString().split('T')[0]}
                            </p>
                        )}
                    </motion.div>

                    <div className="bg-white/5 rounded-lg p-8 backdrop-blur-sm border border-white/10">
                        {item.privacyPolicy?.content && (
                    <div className="prose prose-invert max-w-none">
                        {/* Ensure type safety and proper rendering */}
                        {Array.isArray(item.privacyPolicy.content) && (
                            <PortableText
                                value={item.privacyPolicy.content as TypedObject[]}
                                components={{
                                    // Optional: Customize rendering of different block types
                                    block: {
                                        h1: ({children}) => <h2 className="text-2xl font-bold text-white mb-4">{children}</h2>,
                                        h2: ({children}) => <h3 className="text-xl font-semibold text-gray-200 mt-6 mb-3">{children}</h3>,
                                        normal: ({children}) => <p className="mb-4 text-gray-300">{children}</p>,
                                    }
                                }}
                            />
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