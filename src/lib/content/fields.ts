// Field descriptors shared by the editor UI (client) and validation (server).
// They mirror the Sanity schema that the live dataset was authored with.

interface Base {
    name: string;
    title: string;
    description?: string;
    required?: boolean;
    // Stored and validated, but edited through another field's control.
    hidden?: boolean;
}

export type Field =
    | (Base & { kind: 'string'; max?: number })
    | (Base & { kind: 'text'; max?: number; rows?: number })
    | (Base & { kind: 'url' })
    | (Base & { kind: 'email' })
    | (Base & { kind: 'number'; min?: number; max?: number; step?: number })
    | (Base & { kind: 'boolean' })
    | (Base & { kind: 'date' })
    | (Base & { kind: 'slug'; source: string })
    | (Base & { kind: 'select'; options: { value: string; label: string }[] })
    | (Base & { kind: 'tags'; suggestions?: string[] })
    | (Base & { kind: 'color' })
    | (Base & { kind: 'image' })
    | (Base & { kind: 'file'; accept: 'pdf' })
    | (Base & { kind: 'images' })
    | (Base & { kind: 'reference'; to: string })
    | (Base & { kind: 'references'; to: string })
    | (Base & { kind: 'objects'; of: Field[]; itemTitle: string; itemSubtitle?: string })
    | (Base & { kind: 'blocks' })
    // One control for a video's source: writes a Cloudinary public id to this field, or
    // an https link to the sibling field named by `urlField`. Exactly one is kept.
    | (Base & { kind: 'videoSource'; urlField: string })
    | (Base & { kind: 'videoUrl' });

export type FieldKind = Field['kind'];

export interface DocTypeDef {
    type: string;
    title: string;
    group: 'Portfolio' | 'Store' | 'Pages';
    // Singletons are read by the site as `*[_type == X][0]`; the admin keeps exactly one.
    singleton: boolean;
    fields: Field[];
    // Field used as the document's label in lists and reference pickers.
    titleField?: string;
    subtitleField?: string;
    imageField?: string;
    // Other document types the preview needs to resolve references.
    previewDeps?: string[];
    // Public paths to revalidate after publishing.
    paths?: string[];
}

export const IMAGE_REF = /^image-[a-f0-9]{20,64}-\d{1,5}x\d{1,5}-(png|jpe?g|webp|gif|avif)$/;
export const FILE_REF = /^file-[a-f0-9]{20,64}-pdf$/;
export const DOC_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;
export const KEY = /^[A-Za-z0-9_-]{1,64}$/;

export function newKey() {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
