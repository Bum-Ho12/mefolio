'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import { TypedObject } from '@portabletext/types';
import MeStoreFooter from '@/components/store/MeFooter';
import PageHero from './PageHero';
import { AboutData } from '@/utils/types';

export default function AboutView({ data }: { data: AboutData | null }) {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col justify-between">
            <PageHero
                image={data?.heroImage}
                title={data ? data.heroTitle : undefined}
                subtitle={data?.heroSubtitle}
                fallbackAlt="About Us"
            />

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

                    {data?.content && (
                        <div className="prose prose-invert max-w-none mb-16">
                            {Array.isArray(data.content) && data.content.every(item => typeof item === 'object') ? (
                                <PortableText value={data.content as TypedObject[]} />
                            ) : null}
                        </div>
                    )}

                    {data?.team && data.team.length > 0 && (
                        <div className="mt-16">
                            <h2 className="text-3xl font-bold mb-8 text-center">Meet Our Team</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {data.team.map((member, index) => (
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
