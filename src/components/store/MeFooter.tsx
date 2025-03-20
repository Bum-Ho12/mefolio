import { getContactPage } from "@/services/api/sanity";
import { ContactData } from "@/utils/types";
import Link from "next/link";
import { useEffect, useState } from "react";

type StoreMeFooterProps = {
    setFilter: (filter: string) => void;
    getCategories: () => string[];
};

const MeStoreFooter = (
    { setFilter, getCategories }: StoreMeFooterProps
) => {
    const [contactData, setContactData] = useState<ContactData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
            }, 200);

            fetchData();

            return () => clearInterval(interval);
    }, []);

    return (
        <footer className="bg-white/5 border-t border-white/10 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">Shop</h3>
                        <ul className="space-y-2">
                            {getCategories().slice(1).map((category) => (
                                <li key={category}>
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
                            {/* <li><Link href="/shipping" className="text-gray-400 hover:text-white">Shipping & Returns</Link></li> */}
                            <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                            <li><Link href="/terms&conditions" className="text-gray-400 hover:text-white">Terms & Conditions</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-4">Connect</h3>
                        {!isLoading && contactData && contactData?.socialLinks?.length > 1 && (<div className="flex space-x-4">
                            {/* <a href="#" className="text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path></svg></a> */}
                            <a href={contactData.socialLinks[1].url} className="text-gray-400 hover:text-white">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm4.584 15.778h-3.172v-4.955h3.172v4.955zm-1.586-5.64a1.586 1.586 0 110-3.173 1.586 1.586 0 010 3.173zm6.241 5.64h-3.172v-7.444h3.172v7.444z">
                                    </path>
                                </svg>
                            </a>
                            <a href={contactData.socialLinks[2].url} className="text-gray-400 hover:text-white">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.055 10.055 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.691 8.15 4.066 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z">
                                    </path>
                                </svg>
                            </a>
                            {/* <a href="#" className="text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"></path></svg></a> */}
                        </div>)}
                        {/* <div className="mt-6">
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
                        </div> */}
                    </div>
                </div>
                <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
                    <p>© {new Date().getFullYear()} My Store. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default MeStoreFooter;