import { getStoreItem } from '@/services/api/sanity';
import StoreItemPage from '@/components/StoreItemPage';

type tParams = Promise<{id:string}>;

export default async function StoreItemRoute({
    params,
}: {
    params:tParams;
}) {
    const { id } = await params;
    const itemData = await getStoreItem(id);
    return <StoreItemPage item={itemData} />;
}
