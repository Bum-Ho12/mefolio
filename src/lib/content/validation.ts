import { z } from 'zod';
import { CLOUDINARY_ID, resolveVideo } from '@/utils/video';
import { MEDIA_BLOCKS } from './blocks';
import { DOC_ID, FILE_REF, IMAGE_REF, KEY, SVG_IMAGE_REF, type DocTypeDef, type Field } from './fields';

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

const imageRef = z.string().regex(IMAGE_REF, 'Invalid image asset');
const imageOrSvgRef = z.string().refine((r) => IMAGE_REF.test(r) || SVG_IMAGE_REF.test(r), 'Invalid image asset');

const imageSchema = (svg = false) => z.strictObject({
    _type: z.literal('image'),
    asset: z.strictObject({ _type: z.literal('reference'), _ref: svg ? imageOrSvgRef : imageRef }),
    crop: hotspotish,
    hotspot: hotspotish,
});
const image = imageSchema();

const file = z.strictObject({
    _type: z.literal('file'),
    asset: z.strictObject({ _type: z.literal('reference'), _ref: z.string().regex(FILE_REF, 'Invalid file asset') }),
});

const reference = z.strictObject({ _type: z.literal('reference'), _ref: ref, _weak: z.boolean().optional() });

const textBlock = z.strictObject({
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
});

const MAX_BLOCKS = 2000;
const blocks = z.array(textBlock).max(MAX_BLOCKS);

// Paragraphs mixed with media blocks. Each item is checked against the schema for its
// own `_type`, so errors point at the field inside the block rather than at a union.
function mediaBlocks(mode: Mode) {
    const schemas = new Map<string, z.ZodType>([['block', textBlock]]);
    for (const def of MEDIA_BLOCKS) schemas.set(def.type, objectSchema(def.fields, mode, { _key: key, _type: z.literal(def.type) }));

    return z
        .array(
            z.looseObject({ _type: z.string() }).superRefine((item, ctx) => {
                const schema = schemas.get(item._type);
                if (!schema) {
                    ctx.addIssue({ code: 'custom', message: `Unknown block type "${item._type.slice(0, 40)}"` });
                    return;
                }
                const result = schema.safeParse(item);
                if (!result.success) {
                    for (const issue of result.error.issues) ctx.addIssue({ code: 'custom', path: [...issue.path], message: issue.message });
                }
                if (mode === 'publish' && item._type === 'galleryBlock' && (!Array.isArray(item.images) || item.images.length < 2)) {
                    ctx.addIssue({ code: 'custom', path: ['images'], message: 'Add at least two images' });
                }
            }),
        )
        .max(MAX_BLOCKS);
}

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
            return imageSchema(field.svg);
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
            return field.media ? mediaBlocks(mode) : blocks;
        case 'videoSource':
            return z.string().regex(CLOUDINARY_ID, 'Invalid Cloudinary public id');
        case 'videoUrl':
            // https only, and it must be something the site can actually play.
            return z.string().max(2048).superRefine((url, ctx) => {
                const source = resolveVideo({ url });
                if (source.kind === 'unsupported') ctx.addIssue({ code: 'custom', message: source.reason });
            });
    }
}

function objectSchema(fields: Field[], mode: Mode, extra: Record<string, z.ZodType> = {}): z.ZodType {
    const shape: Record<string, z.ZodType> = { ...extra };
    for (const field of fields) {
        const schema = fieldSchema(field, mode);
        shape[field.name] = mode === 'publish' && field.required ? schema : schema.optional();
    }
    const object = z.strictObject(shape);

    // A video has exactly one source: never both, and one is required to publish.
    const sources = fields.filter((f) => f.kind === 'videoSource');
    if (!sources.length) return object;
    return object.superRefine((value, ctx) => {
        const record = value as Record<string, unknown>;
        for (const source of sources) {
            const hasId = record[source.name] !== undefined;
            const hasUrl = record[source.urlField] !== undefined;
            if (hasId && hasUrl) ctx.addIssue({ code: 'custom', path: [source.name], message: 'Use a Cloudinary id or a link, not both' });
            if (mode === 'publish' && !hasId && !hasUrl) ctx.addIssue({ code: 'custom', path: [source.name], message: 'Add a video source' });
        }
    });
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
