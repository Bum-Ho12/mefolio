import { StoreItem } from '@/utils/types';

export type StoreCategory = StoreItem['category'];

// Single source for category order and labels, shared by the toolbar and footer.
export const STORE_CATEGORIES: { value: StoreCategory; label: string }[] = [
    { value: 'app', label: 'Apps' },
    { value: 'game', label: 'Games' },
    { value: 'merch', label: 'Merch' },
];

export const categoryLabel = (value: string) =>
    STORE_CATEGORIES.find((category) => category.value === value)?.label ?? value;
