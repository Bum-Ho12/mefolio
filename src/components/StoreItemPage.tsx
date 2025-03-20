"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowLeft, ExternalLink, Download, Heart, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StoreItem } from '@/utils/types';
import RelatedProducts from './store/MeRelatedProducts';
import CircularLoadingScreen from './MeCircularLoadingScreen';

interface StoreItemPageProps {
    item: StoreItem;
}

export default function StoreItemPage({ item }: StoreItemPageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [selectedImage, setSelectedImage] = useState(0);
    // const [selectedSize, setSelectedSize] = useState<string | null>(null);
    // const [selectedColor, setSelectedColor] = useState<{name: string, hex: string} | null>(null);
    const [isWishlist, setIsWishlist] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const categories = ['all', 'merch', 'app', 'game'];

    useEffect(() => {
        // Simulate loading progress for consistent UX
        const timer = setTimeout(() => {
            setLoadingProgress(100);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Set default size and color if available
        // if (item.size && item.size.length > 0) {
        //     setSelectedSize(item.size[0]);
        // }

        // if (item.color && item.color.length > 0) {
        //     setSelectedColor(item.color[0]);
        // }
    }, [item]);

    const handleLoadingComplete = () => {
        setIsLoading(false);
    };

    const toggleWishlist = () => {
        setIsWishlist(!isWishlist);
    };

    if (!item) {
        return (
            <CircularLoadingScreen
                progress={loadingProgress}
                isDataLoaded={true}
                onLoadingComplete={handleLoadingComplete}
            />
        );
    }
    // Get images array with mainImage first, followed by additional images
    const images = [
        { url: item.mainImage ? item.mainImage : '/empty_img.png' },
        ...(item.images?.map(img => ({
            url: img ? img : '/empty_img.png'
        })) || [])
    ];

    const getCategories = () => {
        return categories;
    };

    const setFilter = (filter: string) => {
        // This function would be implemented in the parent component
        console.log(`Filter set to: ${filter}`);
    };

    if (isLoading) {
        return (
            <CircularLoadingScreen
                progress={loadingProgress}
                isDataLoaded={true}
                onLoadingComplete={handleLoadingComplete}
            />
        );
    }

    return (
        <div  className="min-h-screen bg-black text-white flex flex-col justify-between">
            {/* Back button and wishlist */}
            <div className="fixed top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
                    <Link href="/store" className="text-gray-300 hover:text-white flex items-center gap-2">
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Store</span>
                    </Link>
                    <div className="ml-auto flex items-center gap-4">
                        <button
                            onClick={toggleWishlist}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 transition-colors"
                        >
                            <Heart className={`w-5 h-5 ${isWishlist ? 'fill-red-500 text-red-500' : 'text-gray-300'}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="pt-20 pb-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left column - Image gallery */}
                        <div className="w-full lg:w-1/2 space-y-4">
                            <motion.div
                                className="aspect-square bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl overflow-hidden relative"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Image
                                    src={images[selectedImage]?.url || '/empty_img.png'}
                                    alt={item.name}
                                    fill
                                    className="object-contain p-4"
                                />
                            </motion.div>

                            {/* Thumbnail gallery */}
                            {images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-2 mt-4">
                                    {images.map((image, index) => (
                                        <button
                                            key={index}
                                            className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 ${
                                                selectedImage === index ? 'border-blue-500' : 'border-white/10 hover:border-white/30'
                                            }`}
                                            onClick={() => setSelectedImage(index)}
                                        >
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={image.url}
                                                    alt={`${item.name} thumbnail ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right column - Product details */}
                        <div className="w-full lg:w-1/2">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                {/* Product title, price, and badges */}
                                <div className="mb-6">
                                    <span className="text-sm text-gray-400 uppercase tracking-wider">{item.category}</span>
                                    <h1 className="text-4xl font-bold mb-4">{item.name}</h1>

                                    <div className="flex flex-wrap items-center gap-4 mb-4">
                                        <span className="text-3xl font-bold text-blue-400">
                                            {item.price > 0 ? `$${item.price.toFixed(2)}` : 'Free'}
                                        </span>

                                        <div className="flex items-center space-x-2">
                                            <span className={`w-3 h-3 rounded-full ${item.inStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            <span className="text-sm text-gray-300">{item.inStock ? 'In Stock' : 'Out of Stock'}</span>
                                        </div>

                                        {item.version && (
                                            <span className="text-sm text-gray-300 px-2 py-1 bg-white/10 rounded-full">
                                                v{item.version}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Tabs for product details */}
                                <div className="mb-6 border-b border-white/10">
                                    <div className="flex gap-4">
                                        <button
                                            className={`pb-2 px-2 font-medium ${activeTab === 'description' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
                                            onClick={() => setActiveTab('description')}
                                        >
                                            Description
                                        </button>

                                        {((item.features && item.features.length > 0) || (item.platform && item.platform.length > 0)) && (
                                            <button
                                                className={`pb-2 px-2 font-medium ${activeTab === 'details' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
                                                onClick={() => setActiveTab('details')}
                                            >
                                                Details
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Tab content */}
                                <div className="mb-8">
                                    {activeTab === 'description' && (
                                        <div className="text-gray-300 leading-relaxed">
                                            <p className="whitespace-pre-line">{item.description}</p>
                                        </div>
                                    )}

                                    {activeTab === 'details' && (
                                        <div className="space-y-6">
                                            {item.platform && item.platform.length > 0 && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-2">Available on</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {item.platform.map(platform => (
                                                            <span key={platform} className="text-sm px-3 py-1 bg-white/10 rounded-full">
                                                                {platform}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {item.features && item.features.length > 0 && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-2">Features</h3>
                                                    <ul className="space-y-2 text-gray-300">
                                                        {item.features.map((feature, index) => (
                                                            <li key={index} className="flex items-start gap-2">
                                                                <ExternalLink className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                                                <span>{feature}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {item.material && (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-2">Material</h3>
                                                    <p className="text-gray-300">{item.material}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Product options */}
                                {item.category === 'merch' && (
                                    <div className="space-y-6 mb-8">
                                        {item.size && item.size.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-medium uppercase tracking-wider text-gray-400 mb-3">Available Sizes</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {item.size.map(size => (
                                                        <span
                                                            key={size}
                                                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 text-gray-300"
                                                        >
                                                            {size}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {item.color && item.color.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-medium uppercase tracking-wider text-gray-400 mb-3">Available Colors</h3>
                                                <div className="flex flex-wrap gap-3 items-center">
                                                    {item.color.map(color => (
                                                        <div
                                                            key={color.name}
                                                            className="flex flex-col items-center gap-1"
                                                        >
                                                            <div
                                                                className="w-10 h-10 rounded-full"
                                                                style={{ backgroundColor: color.hex }}
                                                                title={color.name}
                                                            ></div>
                                                            <span className="text-xs text-gray-400">{color.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="space-y-4">
                                    {/* Contact info for merch items */}
                                    {item.category === 'merch' && (
                                        <div className="p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                                            <h3 className="text-lg font-semibold mb-2 text-blue-300">How to Purchase</h3>
                                            <p className="text-gray-300 mb-4">
                                                To purchase this merchandise, please contact us directly via phone or email with the item name and your desired specifications.
                                            </p>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <a href="tel:+1234567890" className="py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white transition-colors">
                                                    <Phone className="w-5 h-5" />
                                                    Call Us
                                                </a>
                                                <a href="mailto:store@example.com" className="py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white transition-colors">
                                                    <Mail className="w-5 h-5" />
                                                    Email Us
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {/* Digital download/store links for apps and games */}
                                    {(item.category === 'app' || item.category === 'game') && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {item.appStoreUrl && (
                                                <a
                                                    href={item.appStoreUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                                                >
                                                    <ExternalLink className="w-5 h-5" />
                                                    App Store
                                                </a>
                                            )}

                                            {item.playStoreUrl && (
                                                <a
                                                    href={item.playStoreUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white transition-colors"
                                                >
                                                    <ExternalLink className="w-5 h-5" />
                                                    Play Store
                                                </a>
                                            )}

                                            {item.webAppUrl && (
                                                <a
                                                    href={item.webAppUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                                                >
                                                    <ExternalLink className="w-5 h-5" />
                                                    Launch Web App
                                                </a>
                                            )}

                                            {item.downloadUrl && (
                                                <a
                                                    href={item.downloadUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white transition-colors"
                                                >
                                                    <Download className="w-5 h-5" />
                                                    Download
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            <RelatedProducts
                currentItemId={item.id.current}
                currentCategory={item.category}
                limit={3}
            />

            {/* Footer */}
            <footer className="bg-white/5 border-t border-white/10 py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">Shop</h3>
                            <ul className="space-y-2">
                                {getCategories().slice(1).map((category) => (
                                    <li key={category.toString()}>
                                        <button
                                            onClick={() => {
                                                setFilter(category);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">Information</h3>
                            <ul className="space-y-2">
                                <li><Link href="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
                                <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
                                <li><Link href="/shipping" className="text-gray-400 hover:text-white">Shipping & Returns</Link></li>
                                <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">Connect</h3>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path></svg></a>
                                <a href="#" className="text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm4.584 15.778h-3.172v-4.955h3.172v4.955zm-1.586-5.64a1.586 1.586 0 110-3.173 1.586 1.586 0 010 3.173zm6.241 5.64h-3.172v-7.444h3.172v7.444z"></path></svg></a>
                                <a href="#" className="text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.055 10.055 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.691 8.15 4.066 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z"></path></svg></a>
                                <a href="#" className="text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"></path></svg></a>
                            </div>
                            <div className="mt-6">
                                <h4 className="font-medium mb-2">Subscribe to our newsletter</h4>
                                <div className="flex">
                                    <input
                                        type="email"
                                        placeholder="Your email"
                                        className="bg-white/10 border border-white/20 rounded-l px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-white/30"
                                    />
                                    <button className="bg-white text-black px-4 py-2 rounded-r font-medium hover:bg-gray-200">
                                        Subscribe
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
                        <p>© {new Date().getFullYear()} My Store. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}