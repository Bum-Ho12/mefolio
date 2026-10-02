'use server';

import 'server-only';
import { revalidatePath } from 'next/cache';
import { requireOwner, UnauthorizedError } from '@/lib/auth/dal';
import { writeClient } from '@/lib/sanity/write';
import { DOC_ID, type DocTypeDef, type Field } from './fields';
import { getDocType } from './registry';
import { validateDocument, type FieldError } from './validation';
import { draftId, getDocumentPair, listReferenceOptions, pickFields, resolveSingletonId, stripSystem, type SanityDoc } from './store';

export type ActionResult =
    | { ok: true; rev?: string }
    | { ok: false; error: string; errors?: FieldError[]; conflict?: boolean };

class UserError extends Error {}

// Every action: authenticate, resolve an allowlisted type, validate the id, and never
// let Sanity error details (or anything else) leak back to the browser.
async function guarded(action: string, type: unknown, id: unknown, run: (def: DocTypeDef, id: string) => Promise<ActionResult>): Promise<ActionResult> {
    let login = 'unknown';
    try {
        login = (await requireOwner()).login;
        const def = typeof type === 'string' ? getDocType(type) : undefined;
        if (!def) throw new UserError('Unknown document type');
        if (typeof id !== 'string' || !DOC_ID.test(id)) throw new UserError('Invalid document id');
        const result = await run(def, id);
        console.info(`[admin] ${action}`, { login, type: def.type, id, ok: result.ok });
        return result;
    } catch (error) {
        if (error instanceof UserError) return { ok: false, error: error.message };
        if (error instanceof UnauthorizedError) {
            console.warn(`[admin] unauthenticated ${action} rejected`);
            return { ok: false, error: 'Not found' };
        }
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 409) return { ok: false, conflict: true, error: 'This document changed elsewhere. Reload to get the latest version.' };
        console.error(`[admin] ${action} failed`, { login, type, id, error });
        return { ok: false, error: 'Something went wrong. Check the server logs.' };
    }
}

async function assertTypeMatches(def: DocTypeDef, id: string) {
    const { published, draft } = await getDocumentPair(id);
    for (const doc of [published, draft]) {
        if (doc && doc._type !== def.type) throw new UserError('Document type mismatch');
    }
    if (def.singleton) {
        const existing = await resolveSingletonId(def.type);
        if (existing && existing !== id) throw new UserError(`Only one ${def.title} document is allowed`);
    }
    return { published, draft };
}

function collectRefs(fields: Field[], data: Record<string, unknown>, out: Map<string, Set<string>>) {
    for (const field of fields) {
        const value = data[field.name];
        if (value === undefined) continue;
        const add = (to: string, refValue: unknown) => {
            const r = (refValue as { _ref?: string })?._ref;
            if (r) (out.get(to) ?? out.set(to, new Set()).get(to)!).add(r);
        };
        if (field.kind === 'reference') add(field.to, value);
        if (field.kind === 'references') for (const item of value as unknown[]) add(field.to, item);
        if (field.kind === 'objects') for (const item of value as Record<string, unknown>[]) collectRefs(field.of, item, out);
    }
    return out;
}

// References must point at published documents of the declared type; otherwise the
// publish would fail (strong refs) or the site would render holes.
async function assertReferences(def: DocTypeDef, data: Record<string, unknown>) {
    for (const [to, ids] of collectRefs(def.fields, data, new Map())) {
        const found = await writeClient().fetch<string[]>('*[_id in $ids && _type == $to]._id', { ids: [...ids], to });
        const missing = [...ids].filter((i) => !found.includes(i));
        if (missing.length) throw new UserError(`Referenced ${getDocType(to)?.title ?? to} is not published (${missing.length})`);
    }
}

async function assertUniqueSlugs(def: DocTypeDef, id: string, data: Record<string, unknown>) {
    for (const field of def.fields) {
        if (field.kind !== 'slug') continue;
        const current = (data[field.name] as { current?: string } | undefined)?.current;
        if (!current) continue;
        const clash = await writeClient().fetch<number>(
            `count(*[_type == $type && !(_id in [$id, $draft]) && ${field.name}.current == $current])`,
            { type: def.type, id, draft: draftId(id), current },
        );
        if (clash) throw new UserError(`${field.title} "${current}" is already used`);
    }
}

function revalidate(def: DocTypeDef) {
    for (const path of def.paths ?? ['/']) revalidatePath(path);
    if (def.type === 'storeItem' || def.type === 'privacyPolicy') revalidatePath('/store/[id]', 'page');
    if (def.type === 'journey') revalidatePath('/journeys/[slug]', 'page');
}

export async function saveDraft(type: string, id: string, data: unknown, baseRev: string | null): Promise<ActionResult> {
    return guarded('save', type, id, async (def, id) => {
        const result = validateDocument(def, data, 'draft');
        if (!result.ok) return { ok: false, error: 'Fix the highlighted fields', errors: result.errors };
        const { published, draft } = await assertTypeMatches(def, id);

        const values = result.data;
        const unset = def.fields.map((f) => f.name).filter((name) => values[name] === undefined);
        const tx = writeClient().transaction();

        if (draft) {
            // Optimistic lock: a stale tab cannot overwrite newer edits.
            if (!baseRev || baseRev !== draft._rev) return { ok: false, conflict: true, error: 'This draft changed elsewhere. Reload to get the latest version.' };
            tx.patch(draftId(id), (p) => p.ifRevisionId(baseRev).set(values).unset(unset));
        } else {
            // `create` fails if a draft appeared meanwhile, which surfaces as a conflict.
            // Starting from the published doc keeps fields the admin does not manage.
            tx.create({ ...stripSystem(published), _id: draftId(id), _type: def.type } as SanityDoc);
            if (Object.keys(values).length) tx.patch(draftId(id), (p) => p.set(values));
            if (unset.length) tx.patch(draftId(id), (p) => p.unset(unset));
        }

        const res = await tx.commit({ visibility: 'sync' });
        return { ok: true, rev: res.transactionId };
    });
}

export async function publishDocument(type: string, id: string, rev: string | null): Promise<ActionResult> {
    return guarded('publish', type, id, async (def, id) => {
        const { draft } = await assertTypeMatches(def, id);
        if (!draft) throw new UserError('There are no unpublished changes');
        if (rev && draft._rev !== rev) return { ok: false, conflict: true, error: 'This draft changed elsewhere. Reload before publishing.' };

        const result = validateDocument(def, pickFields(def, draft), 'publish');
        if (!result.ok) return { ok: false, error: 'Fix the highlighted fields before publishing', errors: result.errors };
        await assertReferences(def, result.data);
        await assertUniqueSlugs(def, id, result.data);

        await writeClient()
            .transaction()
            .createOrReplace({ ...stripSystem(draft), _id: id, _type: def.type } as SanityDoc)
            .delete(draftId(id))
            .commit({ visibility: 'sync' });
        revalidate(def);
        return { ok: true };
    });
}

export async function discardDraft(type: string, id: string): Promise<ActionResult> {
    return guarded('discard', type, id, async (def, id) => {
        await assertTypeMatches(def, id);
        await writeClient().delete(draftId(id));
        return { ok: true };
    });
}

export async function unpublishDocument(type: string, id: string): Promise<ActionResult> {
    return guarded('unpublish', type, id, async (def, id) => {
        const { published } = await assertTypeMatches(def, id);
        if (!published) throw new UserError('Document is not published');
        try {
            await writeClient()
                .transaction()
                .createIfNotExists({ ...stripSystem(published), _id: draftId(id), _type: def.type } as SanityDoc)
                .delete(id)
                .commit({ visibility: 'sync' });
        } catch (error) {
            if ((error as { statusCode?: number }).statusCode === 409) throw new UserError('Other documents reference this one. Remove those references first.');
            throw error;
        }
        revalidate(def);
        return { ok: true };
    });
}

export async function deleteDocument(type: string, id: string): Promise<ActionResult> {
    return guarded('delete', type, id, async (def, id) => {
        if (def.singleton) throw new UserError('Singletons can be unpublished but not deleted');
        await assertTypeMatches(def, id);
        try {
            await writeClient().transaction().delete(id).delete(draftId(id)).commit({ visibility: 'sync' });
        } catch (error) {
            if ((error as { statusCode?: number }).statusCode === 409) throw new UserError('Other documents reference this one. Remove those references first.');
            throw error;
        }
        revalidate(def);
        return { ok: true };
    });
}

export async function fetchReferenceOptions(type: string) {
    await requireOwner();
    if (!getDocType(type)) return [];
    return listReferenceOptions(type);
}
