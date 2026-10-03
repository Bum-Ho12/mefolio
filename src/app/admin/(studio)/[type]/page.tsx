import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Plus } from 'lucide-react';
import { requireOwnerPage } from '@/lib/auth/dal';
import { getDocType } from '@/lib/content/registry';
import { listDocuments, resolveSingletonId } from '@/lib/content/store';
import { assetUrl } from '@/lib/sanity/config';
import { StatusBadges } from '@/components/admin/ui';

export default async function TypePage({ params }: { params: Promise<{ type: string }> }) {
    await requireOwnerPage();
    const { type } = await params;
    const def = getDocType(type);
    if (!def) notFound();

    // Singletons skip the list and open their one document (or a fresh one).
    if (def.singleton) redirect(`/admin/${type}/${(await resolveSingletonId(type)) ?? 'new'}`);

    const docs = await listDocuments(type);

    return (
        <div className="h-full overflow-y-auto px-4 py-6 sm:px-8">
            <div className="flex items-center justify-between gap-4 pl-10 md:pl-0">
                <h1 className="text-2xl font-semibold">{def.pluralTitle ?? `${def.title}s`}</h1>
                <Link href={`/admin/${type}/new`} className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium hover:bg-blue-500">
                    <Plus className="h-4 w-4" /> New
                </Link>
            </div>
            {docs.length === 0 ? (
                <p className="mt-10 text-center text-white/40">No documents yet.</p>
            ) : (
                <ul className="mt-6 divide-y divide-white/10 rounded-lg border border-white/10">
                    {docs.map((doc) => {
                        const thumb = assetUrl(doc.imageRef);
                        return (
                            <li key={doc.id}>
                                <Link href={`/admin/${type}/${doc.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.03]">
                                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-white/5">
                                        {thumb && <Image src={`${thumb}?w=80&h=80&fit=crop`} alt="" fill sizes="40px" className="object-cover" unoptimized />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium">{doc.title}</p>
                                        {doc.subtitle && <p className="truncate text-sm text-white/40">{doc.subtitle}</p>}
                                    </div>
                                    <div className="hidden flex-shrink-0 flex-col items-end gap-1 sm:flex">
                                        <StatusBadges isPublished={doc.isPublished} hasDraft={doc.hasDraft} />
                                        {doc.updatedAt && <span className="text-xs text-white/30">{formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}</span>}
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
