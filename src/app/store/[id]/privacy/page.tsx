import { getStoreItem } from '@/services/api/sanity';
import StoreItemPrivacyPage from '@/components/store/StoreItemPrivacy';
import Link from 'next/link';

type tParams = Promise<{id:string}>;

export default async function StoreItemPrivacyRoute({
    params,
}: {
    params:tParams;
}) {
    try {
        const { id } = await params;
        const itemData = await getStoreItem(id);

        return <StoreItemPrivacyPage item={itemData} />;
    } catch (error) {
        console.error('Error fetching item data:', error);

        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-3xl font-bold mb-4">Unable to Load Privacy Policy</h1>
                <p className="text-xl text-gray-300 mb-6">
                    We {"couldn't"} retrieve the privacy policy at this time.
                    Please check the item ID or try again later.
                </p>
                <Link
                    href="/store"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
                >
                    Return to Store
                </Link>
            </div>
        );
    }
}