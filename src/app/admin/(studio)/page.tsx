import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { requireOwnerPage } from '@/lib/auth/dal';
import { DOC_GROUPS, DOC_TYPES } from '@/lib/content/registry';
import { listAllSummaries } from '@/lib/content/store';
import { Badge } from '@/components/admin/ui';

export default async function Dashboard() {
    await requireOwnerPage();
    const stats = await listAllSummaries();

    return (
        <div className="h-full overflow-y-auto px-4 py-6 sm:px-8">
            <h1 className="pl-10 text-2xl font-semibold md:pl-0">Content</h1>
            <p className="mt-1 text-sm text-white/50">Edits are saved as drafts. Nothing is public until you publish.</p>
            {DOC_GROUPS.map((group) => (
                <section key={group} className="mt-8">
                    <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">{group}</h2>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {DOC_TYPES.filter((d) => d.group === group).map((d) => {
                            const s = stats.get(d.type);
                            return (
                                <Link key={d.type} href={`/admin/${d.type}`} className="rounded-lg border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/25">
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="font-medium">{d.title}</span>
                                        {!s ? <Badge tone="amber">Empty</Badge> : s.drafts > 0 ? <Badge tone="blue">{s.drafts} draft{s.drafts > 1 ? 's' : ''}</Badge> : null}
                                    </div>
                                    <p className="mt-2 text-xs text-white/40">
                                        {d.singleton ? 'Single document' : `${s?.count ?? 0} document${s?.count === 1 ? '' : 's'}`}
                                        {s?.updatedAt && ` · edited ${formatDistanceToNow(new Date(s.updatedAt), { addSuffix: true })}`}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            ))}
        </div>
    );
}
