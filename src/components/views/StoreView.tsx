'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { StoreData, StoreItem } from '@/utils/types';
import StoreToolbar, { StoreTab } from '@/components/store/StoreToolbar';
import { STORE_CATEGORIES, StoreCategory, categoryLabel } from '@/components/store/categories';
import StoreMeCard from '@/components/store/MeCard';
import MeStoreFooter from '@/components/store/MeFooter';
import MeAmbientBackground from '@/components/MeAmbientBackground';

const RESULTS_ID = 'store-results';

const matchesQuery = (item: StoreItem, query: string) =>
    item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);

export default function StoreView({ storeData, items }: { storeData: StoreData | null; items: StoreItem[] }) {
    const [activeCategory, setActiveCategory] = useState<StoreCategory | null>(null);
    const [query, setQuery] = useState('');
    const toolbarRef = useRef<HTMLDivElement>(null);
    const normalizedQuery = query.trim().toLowerCase();

    // Items matching the search; tab counts and the grid both derive from this.
    const searchedItems = useMemo(
        () => (normalizedQuery ? items.filter((item) => matchesQuery(item, normalizedQuery)) : items),
        [items, normalizedQuery],
    );

    const visibleItems = activeCategory
        ? searchedItems.filter((item) => item.category === activeCategory)
        : searchedItems;

    // A category gets a tab when the store has items in it, so tabs stay put while searching.
    const tabs = useMemo<StoreTab[]>(() => {
        const countIn = (category: StoreCategory) => searchedItems.filter((item) => item.category === category).length;
        return [
            { value: null, label: 'All', count: searchedItems.length },
            ...STORE_CATEGORIES
                .filter(({ value }) => items.some((item) => item.category === value))
                .map(({ value, label }) => ({ value, label, count: countIn(value) })),
        ];
    }, [items, searchedItems]);

    const clearFilters = () => {
        setActiveCategory(null);
        setQuery('');
    };

    // Footer links pick a category and bring the toolbar back into view.
    const selectFromFooter = (category: StoreCategory) => {
        setActiveCategory(category);
        setQuery('');
        toolbarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const footerCategories = STORE_CATEGORIES.filter(({ value }) => items.some((item) => item.category === value));

    const resultSummary = normalizedQuery
        ? `${visibleItems.length} ${visibleItems.length === 1 ? 'result' : 'results'} for “${query.trim()}”`
        : `${visibleItems.length} ${visibleItems.length === 1 ? 'item' : 'items'}`;

    const emptyMessage = items.length === 0
        ? 'The store is empty right now.'
        : normalizedQuery
            ? `No results for “${query.trim()}”${activeCategory ? ` in ${categoryLabel(activeCategory)}` : ''}.`
            : `Nothing in ${categoryLabel(activeCategory ?? '')} yet.`;

    return (
        <MeAmbientBackground>
            <div className="min-h-screen text-white flex flex-col w-full">
                <main className="flex-1 px-4 pt-10 pb-16 sm:pt-16">
                    <div className="max-w-6xl mx-auto">
                        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white">
                            <ArrowLeft className="h-4 w-4" /> Home
                        </Link>

                        <motion.header
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="mt-6 mb-8 text-center sm:text-left"
                        >
                            <h1 className="text-3xl sm:text-4xl font-bold">{storeData?.title || 'Store'}</h1>
                            <p className="mt-3 text-gray-400 max-w-2xl mx-auto sm:mx-0">
                                {storeData?.description || 'Browse my collection of apps, games, and merchandise.'}
                            </p>
                        </motion.header>

                        <StoreToolbar
                            ref={toolbarRef}
                            tabs={tabs}
                            activeCategory={activeCategory}
                            onCategoryChange={setActiveCategory}
                            query={query}
                            onQueryChange={setQuery}
                            resultsId={RESULTS_ID}
                        />

                        <div id={RESULTS_ID} role="tabpanel" aria-live="polite">
                            {visibleItems.length > 0 ? (
                                <>
                                    <p className="mb-4 text-sm text-gray-500 text-center sm:text-left">{resultSummary}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                        {visibleItems.map((item) => (
                                            <StoreMeCard key={item.id.current} item={item} />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="py-16 text-center">
                                    <p className="text-gray-400 text-lg">{emptyMessage}</p>
                                    {items.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            className="mt-3 text-sm font-medium text-blue-400 hover:text-blue-300"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                <MeStoreFooter categories={footerCategories} onSelectCategory={selectFromFooter} />
            </div>
        </MeAmbientBackground>
    );
}
