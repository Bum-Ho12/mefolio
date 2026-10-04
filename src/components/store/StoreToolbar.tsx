'use client';

import { KeyboardEvent, Ref, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { StoreCategory } from './categories';

export interface StoreTab {
    value: StoreCategory | null;
    label: string;
    count: number;
}

interface StoreToolbarProps {
    ref?: Ref<HTMLDivElement>;
    tabs: StoreTab[];
    activeCategory: StoreCategory | null;
    onCategoryChange: (category: StoreCategory | null) => void;
    query: string;
    onQueryChange: (query: string) => void;
    resultsId: string;
}

// Flat category tabs (underlined, like the item page) with search on the right.
// Tabs centre on small screens and sit on the left from `sm` up.
const StoreToolbar = ({ ref, tabs, activeCategory, onCategoryChange, query, onQueryChange, resultsId }: StoreToolbarProps) => {
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.value === activeCategory));

    // Arrow keys move between tabs, as expected of a tablist.
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
        if (!step) return;
        event.preventDefault();
        const next = (activeIndex + step + tabs.length) % tabs.length;
        onCategoryChange(tabs[next].value);
        tabRefs.current[next]?.focus();
    };

    // "All" plus a single category would be two tabs showing the same items.
    const showTabs = tabs.length > 2;

    return (
        <div ref={ref} className="mb-4 scroll-mt-6 border-b border-white/10">
            <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-end sm:justify-between">
                {showTabs ? (
                    <div className="overflow-x-auto scrollbar-hide">
                        {/* w-max + mx-auto centres without clipping the first tabs once the row overflows. */}
                        <div
                            role="tablist"
                            aria-label="Store categories"
                            onKeyDown={handleKeyDown}
                            className="mx-auto flex w-max gap-6 px-1 sm:mx-0"
                        >
                            {tabs.map((tab, index) => {
                                const isActive = index === activeIndex;
                                return (
                                    <button
                                        key={tab.label}
                                        ref={(el) => { tabRefs.current[index] = el; }}
                                        type="button"
                                        role="tab"
                                        aria-selected={isActive}
                                        aria-controls={resultsId}
                                        tabIndex={isActive ? 0 : -1}
                                        onClick={() => onCategoryChange(tab.value)}
                                        className={`-mb-px h-11 rounded-sm border-b-2 px-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 ${
                                            isActive
                                                ? 'border-blue-500 text-white'
                                                : 'border-transparent text-gray-400 hover:text-gray-200'
                                        }`}
                                    >
                                        {tab.label}
                                        <span className="ml-1.5 text-xs tabular-nums text-gray-500">{tab.count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="hidden sm:block" />
                )}

                <div className={`relative w-full sm:w-64 ${showTabs ? 'sm:mb-2' : 'mb-4'}`}>
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" aria-hidden="true" />
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        placeholder="Search store"
                        aria-label="Search store"
                        aria-controls={resultsId}
                        className="h-10 w-full rounded-md border border-white/10 bg-white/[0.04] pl-9 pr-8 text-sm text-white placeholder:text-gray-500 focus:border-white/30 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => onQueryChange('')}
                            aria-label="Clear search"
                            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-gray-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StoreToolbar;
