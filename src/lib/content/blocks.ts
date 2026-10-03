import type { Field } from './fields';

// Media blocks that can sit between paragraphs in a `blocks` field with `media: true`.
// The same descriptors drive the block's settings form (client) and validation (server).

export const LAYOUTS = [
    { value: 'left', label: 'Left' },
    { value: 'inline', label: 'Inline' },
    { value: 'wide', label: 'Wide' },
    { value: 'full', label: 'Full' },
    { value: 'right', label: 'Right' },
];

// A gallery is never floated beside text.
const GALLERY_LAYOUTS = LAYOUTS.filter((l) => l.value !== 'left' && l.value !== 'right');

// Edited through the segmented control on the block's card, not the settings form.
const layout = (options = LAYOUTS): Field => ({ kind: 'select', name: 'layout', title: 'Layout', options, hidden: true });

export interface MediaBlockDef {
    type: string;
    title: string;
    fields: Field[];
    // A new block starts with these, so it is kept in the draft before it has media.
    defaults: Record<string, string>;
}

export const MEDIA_BLOCKS: MediaBlockDef[] = [
    {
        type: 'imageBlock',
        title: 'Image',
        defaults: { layout: 'inline' },
        fields: [
            { kind: 'image', name: 'image', title: 'Image', required: true },
            { kind: 'string', name: 'alt', title: 'Alt text', required: true, max: 300, description: 'Describes the image for screen readers and when it fails to load.' },
            { kind: 'string', name: 'caption', title: 'Caption', max: 300 },
            layout(),
        ],
    },
    {
        type: 'videoBlock',
        title: 'Video',
        defaults: { layout: 'inline', playback: 'loop', aspect: '16:9' },
        fields: [
            { kind: 'videoSource', name: 'publicId', title: 'Video source', urlField: 'url', description: 'A Cloudinary public id, a direct https link to a video file, or a YouTube/Vimeo link.' },
            { kind: 'videoUrl', name: 'url', title: 'Video link', hidden: true },
            { kind: 'image', name: 'poster', title: 'Poster image', description: 'Shown before a linked video loads. Not needed for Cloudinary videos.' },
            {
                kind: 'select', name: 'playback', title: 'Playback',
                options: [{ value: 'loop', label: 'Muted loop while in view' }, { value: 'player', label: 'Player with controls and sound' }],
            },
            {
                kind: 'select', name: 'aspect', title: 'Shape',
                options: [{ value: '16:9', label: 'Landscape 16:9' }, { value: '9:16', label: 'Portrait 9:16' }, { value: '1:1', label: 'Square 1:1' }, { value: '4:5', label: 'Portrait 4:5' }],
            },
            { kind: 'string', name: 'caption', title: 'Caption', max: 300 },
            layout(),
        ],
    },
    {
        type: 'galleryBlock',
        title: 'Gallery',
        defaults: { layout: 'inline', columns: '2' },
        fields: [
            { kind: 'images', name: 'images', title: 'Images', required: true, description: 'Shown side by side. Add at least two.' },
            { kind: 'select', name: 'columns', title: 'Columns', options: [{ value: '2', label: '2' }, { value: '3', label: '3' }] },
            { kind: 'string', name: 'alt', title: 'Alt text', required: true, max: 300, description: 'One description for the whole set.' },
            { kind: 'string', name: 'caption', title: 'Caption', max: 300 },
            layout(GALLERY_LAYOUTS),
        ],
    },
];

const byType = new Map(MEDIA_BLOCKS.map((b) => [b.type, b]));

export const getMediaBlock = (type: unknown) => (typeof type === 'string' ? byType.get(type) : undefined);
