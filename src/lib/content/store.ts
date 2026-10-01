import 'server-only';
import { writeClient } from '@/lib/sanity/write';
import { DOC_TYPES, getDocType } from './registry';
import type { DocTypeDef } from './fields';

export type SanityDoc = Record<string, unknown> & { _id: string; _type: string; _rev?: string; _updatedAt?: string };

export const DRAFT_PREFIX = 'drafts.';
export const draftId = (id: string) => `${DRAFT_PREFIX}${id}`;
export const baseId = (id: string) => (id.startsWith(DRAFT_PREFIX) ? id.slice(DRAFT_PREFIX.length) : id);

const SYSTEM_FIELDS = ['_id', '_rev', '_createdAt', '_updatedAt'];

export function stripSystem(doc: SanityDoc | null | undefined): Record<string, unknown> {
    if (!doc) return {};
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(doc)) if (!SYSTEM_FIELDS.includes(k)) out[k] = v;
    return out;
}

// Only the fields the admin knows about are sent to the editor and validated.
export function pickFields(def: DocTypeDef, doc: SanityDoc | null | undefined): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    if (!doc) return out;
    for (const field of def.fields) if (doc[field.name] !== undefined) out[field.name] = doc[field.name];
    return out;
}

export interface DocSummary {
    id: string;
    title: string;
    subtitle?: string;
    imageRef?: string;
    hasDraft: boolean;
    isPublished: boolean;
    updatedAt?: string;
}

function summarize(def: DocTypeDef, id: string, published?: SanityDoc, draft?: SanityDoc): DocSummary {
    const doc = draft ?? published!;
    const text = (name?: string) => (name && typeof doc[name] === 'string' ? (doc[name] as string) : undefined);
    const image = def.imageField ? (doc[def.imageField] as { asset?: { _ref?: string } } | undefined) : undefined;
    return {
        id,
        title: text(def.titleField)?.trim() || def.title,
        subtitle: text(def.subtitleField)?.slice(0, 120),
        imageRef: image?.asset?._ref,
        hasDraft: !!draft,
        isPublished: !!published,
        updatedAt: doc._updatedAt,
    };
}

// Pairs published documents with their drafts, newest edits first.
export async function listDocuments(type: string): Promise<DocSummary[]> {
    const def = getDocType(type);
    if (!def) return [];
    const docs = await writeClient().fetch<SanityDoc[]>('*[_type == $type]', { type });
    const pairs = new Map<string, { published?: SanityDoc; draft?: SanityDoc }>();
    for (const doc of docs) {
        const id = baseId(doc._id);
        const entry = pairs.get(id) ?? {};
        if (doc._id.startsWith(DRAFT_PREFIX)) entry.draft = doc;
        else entry.published = doc;
        pairs.set(id, entry);
    }
    return [...pairs.entries()]
        .map(([id, { published, draft }]) => summarize(def, id, published, draft))
        .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
}

export async function listAllSummaries() {
    const docs = await writeClient().fetch<{ _id: string; _type: string; _updatedAt: string }[]>(
        '*[_type in $types]{_id, _type, _updatedAt}',
        { types: DOC_TYPES.map((d) => d.type) },
    );
    const stats = new Map<string, { count: number; drafts: number; updatedAt?: string }>();
    const seen = new Set<string>();
    for (const doc of docs) {
        const s = stats.get(doc._type) ?? { count: 0, drafts: 0 };
        const id = baseId(doc._id);
        if (!seen.has(`${doc._type}:${id}`)) {
            seen.add(`${doc._type}:${id}`);
            s.count += 1;
        }
        if (doc._id.startsWith(DRAFT_PREFIX)) s.drafts += 1;
        if (!s.updatedAt || doc._updatedAt > s.updatedAt) s.updatedAt = doc._updatedAt;
        stats.set(doc._type, s);
    }
    return stats;
}

// Mirrors the site's `*[_type == X][0]`: the first published id wins, then drafts.
export async function resolveSingletonId(type: string): Promise<string | null> {
    const ids = await writeClient().fetch<string[]>('*[_type == $type]._id', { type });
    const published = ids.filter((id) => !id.startsWith(DRAFT_PREFIX)).sort();
    if (published.length) return published[0];
    const drafts = ids.map(baseId).sort();
    return drafts[0] ?? null;
}

export async function getDocumentPair(id: string) {
    const docs = await writeClient().fetch<SanityDoc[]>('*[_id in [$id, $draft]]', { id, draft: draftId(id) });
    return {
        published: docs.find((d) => d._id === id) ?? null,
        draft: docs.find((d) => d._id === draftId(id)) ?? null,
    };
}

// Documents the preview needs to resolve references (drafts win over published).
export async function getPreviewLookup(def: DocTypeDef): Promise<Record<string, SanityDoc>> {
    const types = def.previewDeps ?? [];
    if (!types.length) return {};
    const docs = await writeClient().fetch<SanityDoc[]>('*[_type in $types]', { types });
    const lookup: Record<string, SanityDoc> = {};
    for (const doc of docs) {
        const id = baseId(doc._id);
        if (doc._id.startsWith(DRAFT_PREFIX) || !lookup[id]) lookup[id] = { ...doc, _id: id };
    }
    return lookup;
}

export async function listReferenceOptions(type: string) {
    const summaries = await listDocuments(type);
    return summaries.filter((s) => s.isPublished).map(({ id, title, subtitle }) => ({ id, title, subtitle }));
}
