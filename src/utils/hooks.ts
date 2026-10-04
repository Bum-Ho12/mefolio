'use client';

import { useCallback, useSyncExternalStore } from 'react';

// Phones get smaller video renditions.
export const MOBILE_QUERY = '(max-width: 767px)';
// Tailwind's `lg` breakpoint.
export const LARGE_QUERY = '(min-width: 1024px)';

// False on the server and during hydration, then follows the media query.
export function useMediaQuery(query: string) {
    const subscribe = useCallback((callback: () => void) => {
        const mql = window.matchMedia(query);
        mql.addEventListener('change', callback);
        return () => mql.removeEventListener('change', callback);
    }, [query]);
    return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}

function subscribeVisibility(callback: () => void) {
    document.addEventListener('visibilitychange', callback);
    return () => document.removeEventListener('visibilitychange', callback);
}

// False while the tab is in the background.
export function usePageVisible() {
    return useSyncExternalStore(subscribeVisibility, () => document.visibilityState === 'visible', () => true);
}
