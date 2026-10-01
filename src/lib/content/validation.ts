import { z } from 'zod';
import { CLOUDINARY_ID, DOC_ID, FILE_REF, IMAGE_REF, KEY, type DocTypeDef, type Field } from './fields';

export type Mode = 'draft' | 'publish';

const ALLOWED_SCHEMES = new Set(['https:', 'http:', 'mailto:', 'tel:']);
const DECORATORS = new Set(['strong', 'em', 'code', 'underline', 'strike-through']);
const BLOCK_STYLES = ['normal', 'h1', 'h2', 'h3', 'h4', 'blockquote'] as const;
const MAX_ARRAY = 200;

// Values rendered into href attributes must never be javascript:/data: URLs.
const safeUrl = z.string().max(2048).refine((value) => {
    try {
        return ALLOWED_SCHEMES.has(new URL(value).protocol);
    } catch {
        return false;
    }
}, 'Must be an https://, http://, mailto: or tel: URL');

const key = z.string().regex(KEY);
const ref = z.string().regex(DOC_ID, 'Invalid reference');

const hotspotish = z.record(z.string(), z.union([z.number(), z.string()])).optional();

const image = z.strictObject({
    _type: z.literal('image'),
    asset: z.strictObject({ _type: z.literal('reference'), _ref: z.string().regex(IMAGE_REF, 'Invalid image asset') }),
    crop: hotspotish,
    hotspot: hotspotish,
});

const file = z.strictObject({
    _type: z.literal('file'),
    asset: z.strictObject({ _type: z.literal('reference'), _ref: z.string().regex(FILE_REF, 'Invalid file asset') }),
});

const reference = z.strictObject({ _type: z.literal('reference'), _ref: ref, _weak: z.boolean().optional() });

const blocks = z
    .array(
        z.strictObject({
            _type: z.literal('block'),
            _key: key,
            style: z.enum(BLOCK_STYLES).optional(),
            listItem: z.enum(['bullet', 'number']).optional(),
            level: z.number().int().min(1).max(6).optional(),
            markDefs: z.array(z.strictObject({ _type: z.literal('link'), _key: key, href: safeUrl })).max(50).optional(),
            children: z
                .array(
                    z.strictObject({
                        _type: z.literal('span'),
                        _key: key,
                        text: z.string().max(20_000),
                        marks: z.array(z.string().max(64)).max(10).optional(),
                    }),
                )
                .min(1)
                .max(500),
        }).superRefine((block, ctx) => {
            const linkKeys = new Set((block.markDefs ?? []).map((m) => m._key));
            for (const child of block.children) {
                for (const mark of child.marks ?? []) {
                    if (!DECORATORS.has(mark) && !linkKeys.has(mark)) {
                        ctx.addIssue({ code: 'custom', message: `Unknown mark "${mark}"` });
                    }
                }
            }
        }),
    )
    .max(2000);

function fieldSchema(field: Field, mode: Mode): z.ZodType {
    switch (field.kind) {
        case 'string':
            return z.string().max(field.max ?? 500);
        case 'text':
            return z.string().max(field.max ?? 10_000);
        case 'url':
            return safeUrl;
        case 'email':
            return z.email().max(320);
        case 'number': {
            let n = z.number();
            if (field.min !== undefined) n = n.min(field.min);
            if (field.max !== undefined) n = n.max(field.max);
            return n;
        }
        case 'boolean':
            return z.boolean();
        case 'date':
            return z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');
        case 'slug':
            return z.strictObject({
                _type: z.literal('slug'),
                current: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers and dashes').max(96),
            });
        case 'select':
            return z.enum(field.options.map((o) => o.value) as [string, ...string[]]);
        case 'tags':
            return z.array(z.string().min(1).max(100)).max(50);
        case 'color':
            return z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use #RRGGBB');
        case 'image':
            return image;
        case 'file':
            return file;
        case 'images':
            return z.array(image.extend({ _key: key })).max(50);
        case 'reference':
            return reference;
        case 'references':
            return z.array(reference.extend({ _key: key })).max(MAX_ARRAY);
        case 'objects':
            return z.array(objectSchema(field.of, mode, { _key: key })).max(MAX_ARRAY);
        case 'blocks':
            return blocks;
        case 'cloudinaryVideo':
            return z.string().regex(CLOUDINARY_ID, 'Invalid Cloudinary public id');
    }
}

function objectSchema(fields: Field[], mode: Mode, extra: Record<string, z.ZodType> = {}) {
    const shape: Record<string, z.ZodType> = { ...extra };
    for (const field of fields) {
        const schema = fieldSchema(field, mode);
        shape[field.name] = mode === 'publish' && field.required ? schema : schema.optional();
    }
    return z.strictObject(shape);
}

export function documentSchema(def: DocTypeDef, mode: Mode) {
    return objectSchema(def.fields, mode);
}

// Editors produce '' for cleared inputs; those become "unset" rather than empty strings.
export function normalize(value: unknown): unknown {
    if (value === '' || value === null || value === undefined) return undefined;
    if (typeof value === 'number' && Number.isNaN(value)) return undefined;
    if (Array.isArray(value)) {
        const items = value.map(normalize).filter((v) => v !== undefined);
        return items.length ? items : undefined;
    }
    if (typeof value === 'object') {
        // Portable Text blocks are kept verbatim: empty paragraphs are legitimate content.
        if ((value as { _type?: unknown })._type === 'block') return value;
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value)) {
            const n = normalize(v);
            if (n !== undefined) out[k] = n;
        }
        // An object left with only bookkeeping keys carries no content.
        const meaningful = Object.keys(out).filter((k) => k !== '_key' && k !== '_type');
        return meaningful.length ? out : undefined;
    }
    return value;
}

export interface FieldError {
    path: string;
    message: string;
}

export function validateDocument(def: DocTypeDef, data: unknown, mode: Mode) {
    const normalized = (normalize(data) ?? {}) as Record<string, unknown>;
    const result = documentSchema(def, mode).safeParse(normalized);
    if (result.success) return { ok: true as const, data: result.data as Record<string, unknown> };
    const errors: FieldError[] = result.error.issues.map((issue) => ({
        path: issue.path.map(String).join('.'),
        message: issue.message,
    }));
    return { ok: false as const, errors };
}
