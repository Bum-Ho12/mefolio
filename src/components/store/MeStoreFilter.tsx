'use client';

import { motion } from 'framer-motion';

interface StoreFilterProps {
    onFilterChange: (category: string | null) => void;
    activeCategory: string | null;
}

const StoreFilter = ({ onFilterChange, activeCategory }: StoreFilterProps) => {
    const categories = [
        { name: 'All', value: null },
        { name: 'Apps', value: 'app' },
        { name: 'Games', value: 'game' },
        { name: 'Merch', value: 'merch' }
    ];

    return (
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/10 rounded-full p-1 flex justify-between mb-8 overflow-x-auto">
            {categories.map((category) => (
                <button
                    key={category.name}
                    className={`relative px-4 py-2 rounded-full transition-colors ${
                        activeCategory === category.value
                            ? 'text-white'
                            : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => onFilterChange(category.value)}
                >
                    {activeCategory === category.value && (
                        <motion.div
                            layoutId="activeCategory"
                            className="absolute inset-0 bg-blue-500 rounded-full"
                            initial={false}
                            transition={{ type: 'spring', duration: 0.5 }}
                        />
                    )}
                    <span className="relative z-10">{category.name}</span>
                </button>
            ))}
        </div>
    );
};

export default StoreFilter;