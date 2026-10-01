import { requireOwnerPage } from '@/lib/auth/dal';
import Sidebar from '@/components/admin/Sidebar';

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
    const owner = await requireOwnerPage();
    return (
        <div className="flex h-screen overflow-hidden bg-black text-white">
            <Sidebar login={owner.login} />
            <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
        </div>
    );
}
