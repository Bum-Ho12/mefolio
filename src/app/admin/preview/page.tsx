import { requireOwnerPage } from '@/lib/auth/dal';
import PreviewRenderer from '@/components/admin/PreviewRenderer';

// Rendered inside the editor's iframe; content arrives via postMessage.
export default async function PreviewPage() {
    await requireOwnerPage();
    return <PreviewRenderer />;
}
