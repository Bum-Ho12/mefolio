import { randomUUID } from 'node:crypto';
import { notFound, redirect } from 'next/navigation';
import { requireOwnerPage } from '@/lib/auth/dal';
import { DOC_ID, type Field } from '@/lib/content/fields';
import { getDocType } from '@/lib/content/registry';
import { getDocumentPair, getPreviewLookup, listReferenceOptions, pickFields, resolveSingletonId } from '@/lib/content/store';
import Editor from '@/components/admin/Editor';

function referencedTypes(fields: Field[], out = new Set<string>()) {
    for (const f of fields) {
        if (f.kind === 'reference' || f.kind === 'references') out.add(f.to);
        if (f.kind === 'objects') referencedTypes(f.of, out);
    }
    return out;
}

export default async function EditPage({ params }: { params: Promise<{ type: string; id: string }> }) {
    await requireOwnerPage();
    const { type, id } = await params;
    const def = getDocType(type);
    if (!def) notFound();

    if (id === 'new') {
        // Nothing is written until the first edit is saved as a draft.
        const existing = def.singleton ? await resolveSingletonId(type) : null;
        redirect(`/admin/${type}/${existing ?? randomUUID()}`);
    }
    if (!DOC_ID.test(id)) notFound();

    const { published, draft } = await getDocumentPair(id);
    const current = draft ?? published;
    if (current && current._type !== type) notFound();

    const refTypes = [...referencedTypes(def.fields)];
    const [lookup, refLists] = await Promise.all([
        getPreviewLookup(def),
        Promise.all(refTypes.map((t) => listReferenceOptions(t))),
    ]);

    return (
        <Editor
            key={current?._rev ?? id}
            type={type}
            id={id}
            initialValues={pickFields(def, current)}
            initialRev={draft?._rev ?? null}
            isPublished={!!published}
            hasDraft={!!draft}
            lookup={lookup}
            refOptions={Object.fromEntries(refTypes.map((t, i) => [t, refLists[i]]))}
            cloudinaryEnabled={!!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)}
        />
    );
}
