import { StoreItem } from "@/utils/types";
import { motion } from "framer-motion";
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

const StoreMeCard = ({ item }: { item: StoreItem }) => {
    // Function to render category-specific badges or buttons
    const renderCategorySpecificElements = () => {
        switch (item.category) {
            case 'app':
            case 'game':
                return (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {item.platform?.map((platform, index) => (
                            <span key={index} className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300">
                                {platform}
                            </span>
                        ))}
                        {item.version && (
                            <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                                v{item.version}
                            </span>
                        )}
                    </div>
                );
            case 'merch':
                return (
                    <div className="mt-2 mb-3">
                        {item.inStock ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300">
                                In Stock
                            </span>
                        ) : (
                            <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-300">
                                Out of Stock
                            </span>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    // Function to render appropriate action button based on category
    const renderActionButton = () => {
        switch (item.category) {
            case 'app':
            case 'game':
                return (
                    <div className="flex gap-2">
                        <Link
                            href={`/store/${item.id.current}`}
                            className="flex-1 py-2 text-center rounded-full transition-colors bg-white/10 hover:bg-white/20 flex items-center justify-center gap-1"
                        >
                            <ExternalLink className="w-4 h-4" />
                            {item.price > 0 ? 'Buy' : 'Get'}
                        </Link>
                    </div>
                );
            case 'merch':
                return (
                    <div className="flex gap-2">
                        <Link
                            href={`/store/${item.id.current}`}
                            className="flex-1 py-2 text-center rounded-full transition-colors bg-white/10 hover:bg-white/20"
                        >
                            View Details
                        </Link>
                        {/* {item.inStock && (
                            <Link
                                href={`/store/${item.id.current}`}
                                className="py-2 px-4 rounded-full transition-colors bg-blue-500 hover:bg-blue-600 flex items-center"
                            >
                                <ShoppingCart className="w-4 h-4" />
                            </Link>
                        )} */}
                    </div>
                );
            default:
                return (
                    <Link
                        href={`/store/${item.id.current}`}
                        className="flex-1 py-2 text-center rounded-full transition-colors bg-white/10 hover:bg-white/20"
                    >
                        View Details
                    </Link>
                );
        }
    };

    return (
        <motion.div
            key={item.id.current}
            className="rounded-3xl overflow-hidden relative group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/10 rounded-3xl" />

            <div className="relative p-6 h-full flex flex-col">
                <Link href={`/store/${item.id.current}`} className="block">
                    <div className="relative w-full h-40 mb-4">
                        <Image
                            src={item.mainImage ? item.mainImage : '/empty_img.png'}
                            alt={item.name}
                            fill
                            className="object-cover rounded-xl"
                        />
                    </div>
                </Link>
                <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                            <Link href={`/store/${item.id.current}`} className="hover:text-blue-300 transition-colors">
                                <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                            </Link>
                            <span className="text-blue-400 font-bold">
                                {item.price > 0 ? `$${item.price.toFixed(2)}` : 'Free'}
                            </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{item.description.length > 100 ? `${item.description.substring(0, 100)}...` : item.description}</p><span className="text-xs px-2 py-1 rounded-full bg-white/10 mb-2 inline-block capitalize">
                        {item.category}
                    </span>
                    {renderCategorySpecificElements()}
                </div>

                <div className="mt-auto">
                    {renderActionButton()}
                </div>
            </div>
        </motion.div>
    );
};

export default StoreMeCard;
