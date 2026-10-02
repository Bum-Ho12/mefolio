'use client';

import Image from 'next/image';
import { useId, useRef, useState, type DragEvent, type KeyboardEvent, type ReactNode } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowDown, ArrowUp, Bold, ChevronDown, ChevronRight, Code, GripVertical, Images, ImageIcon, Italic, Link2, Loader2, Plus, Strikethrough, Trash2, Underline, Video } from 'lucide-react';
import { getMediaBlock, MEDIA_BLOCKS, type MediaBlockDef } from '@/lib/content/blocks';
import { newKey } from '@/lib/content/fields';
import { blockToMarkup, markupToBlock, type Block } from '@/lib/content/portableText';
import { assetUrl } from '@/lib/sanity/config';
import { useEditorContext } from './EditorContext';
import { FieldList } from './FieldInput';
import { inputClass } from './ui';
import { uploadAsset } from './upload';

/* eslint-disable @typescript-eslint/no-explicit-any -- values are schema-driven JSON */

// Block editor for Portable Text. Each row is one block: a paragraph with a style and
// inline markup, or (when `media` is on) an image, video or gallery with its own
// layout. Rows are dragged to reorder and converted back to blocks on every change.

const STYLES = [
    { value: 'normal', label: 'Paragraph' },
    { value: 'h1', label: 'Heading 1' },
    { value: 'h2', label: 'Heading 2' },
    { value: 'h3', label: 'Heading 3' },
    { value: 'h4', label: 'Heading 4' },
    { value: 'blockquote', label: 'Quote' },
    { value: 'bullet', label: '• Bullet' },
    { value: 'number', label: '1. Numbered' },
] as const;

const FORMATS = [
    { token: '**', label: 'Bold', hint: '⌘B', key: 'b', icon: Bold },
    { token: '*', label: 'Italic', hint: '⌘I', key: 'i', icon: Italic },
    { token: '__', label: 'Underline', hint: '⌘U', key: 'u', icon: Underline },
    { token: '~~', label: 'Strikethrough', hint: '', key: '', icon: Strikethrough },
    { token: '`', label: 'Code', hint: '', key: '', icon: Code },
    { token: 'link', label: 'Link', hint: '⌘K', key: 'k', icon: Link2 },
] as const;

const BLOCK_ICONS: Record<string, typeof ImageIcon> = { imageBlock: ImageIcon, videoBlock: Video, galleryBlock: Images };

type Values = Record<string, any>;

interface TextRow {
    key: string;
    kind: string;
    text: string;
    level?: number;
}
// Anything that is not a paragraph is carried through untouched, including block types
// this editor does not know, so loading and saving never drops content silently.
interface ObjectRow {
    key: string;
    value: Values;
}
type Row = TextRow | ObjectRow;

const isObject = (row: Row): row is ObjectRow => 'value' in row;

function toRow(item: Values): Row {
    if (item._type !== 'block') {
        const key = typeof item._key === 'string' ? item._key : newKey();
        return { key, value: { ...item, _key: key } };
    }
    const block = item as Block;
    return { key: block._key, kind: block.listItem ?? block.style ?? 'normal', text: blockToMarkup(block), level: block.level };
}

const toBlock = (r: Row) =>
    isObject(r)
        ? r.value
        : markupToBlock(
            r.text,
            r.kind === 'bullet' || r.kind === 'number'
                ? { _key: r.key, style: 'normal', listItem: r.kind, level: r.level ?? 1 }
                : { _key: r.key, style: r.kind },
        );

// Wraps the selection in a markup token, or removes the token if it is already there.
function applyFormat(el: HTMLTextAreaElement, token: string) {
    const { selectionStart: start, selectionEnd: end, value } = el;
    const before = value.slice(0, start);
    const selected = value.slice(start, end);
    const after = value.slice(end);

    if (token === 'link') {
        const text = `${before}[${selected}](https://)${after}`;
        // Leaves the address selected, ready to be typed or pasted over.
        const from = start + selected.length + 3;
        return { text, from, to: from + 8 };
    }
    // A lone * is italic, but ** is bold: only an odd run of stars means italic is on.
    const stars = /\*+$/.exec(before)?.[0].length ?? 0;
    const wrapped = token === '*' ? stars % 2 === 1 && after.startsWith('*') : before.endsWith(token) && after.startsWith(token);
    if (wrapped) {
        return { text: before.slice(0, -token.length) + selected + after.slice(token.length), from: start - token.length, to: end - token.length };
    }
    return { text: before + token + selected + token + after, from: start + token.length, to: end + token.length };
}

const controlClass = 'rounded p-1 text-white/40 hover:bg-white/10 hover:text-white disabled:opacity-20';

function SortableRow({ id, children }: { id: string; children: (handle: ReactNode) => ReactNode }) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
    const handle = (
        <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            className={`${controlClass} flex-shrink-0 cursor-grab touch-none active:cursor-grabbing`}
            aria-label="Drag to reorder"
            title="Drag to reorder"
        >
            <GripVertical className="h-4 w-4" />
        </button>
    );
    return (
        <div ref={setNodeRef} data-block-row style={{ transform: CSS.Translate.toString(transform), transition }} className={isDragging ? 'relative z-10 opacity-70' : undefined}>
            {children(handle)}
        </div>
    );
}

function RowControls({ index, count, onMove, onRemove }: { index: number; count: number; onMove: (to: number) => void; onRemove: () => void }) {
    return (
        <>
            <button type="button" className={controlClass} disabled={index === 0} onClick={() => onMove(index - 1)} aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
            <button type="button" className={controlClass} disabled={index === count - 1} onClick={() => onMove(index + 1)} aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
            <button type="button" className={`${controlClass} hover:text-red-400`} onClick={onRemove} aria-label="Delete block"><Trash2 className="h-4 w-4" /></button>
        </>
    );
}

// Between two rows this stays out of the way until hovered or focused; the one at the
// end of the list is always visible.
function InsertBar({ media, pinned = false, disabled = false, onText, onMedia }: { media: boolean; pinned?: boolean; disabled?: boolean; onText: () => void; onMedia: (def: MediaBlockDef) => void }) {
    const button = 'inline-flex items-center gap-1 rounded-full border border-white/15 bg-neutral-900 px-2.5 py-1 text-xs text-white/70 hover:bg-white/10 hover:text-white';
    const reveal = pinned ? 'py-1' : `h-3 overflow-hidden opacity-0 transition-all hover:h-9 hover:opacity-100 focus-within:h-9 focus-within:opacity-100 ${disabled ? 'pointer-events-none' : ''}`;
    return (
        <div className={`flex flex-wrap items-center gap-1.5 ${pinned ? '' : 'justify-center'} ${reveal}`}>
            <button type="button" className={button} onClick={onText}><Plus className="h-3 w-3" /> Text</button>
            {media && MEDIA_BLOCKS.map((def) => (
                <button key={def.type} type="button" className={button} onClick={() => onMedia(def)}><Plus className="h-3 w-3" /> {def.title}</button>
            ))}
        </div>
    );
}

function MediaThumb({ value }: { value: Values }) {
    const ref = value.image?.asset?._ref ?? value.images?.[0]?.asset?._ref ?? value.poster?.asset?._ref;
    const url = assetUrl(ref);
    const Icon = BLOCK_ICONS[value._type] ?? ImageIcon;
    return (
        <div className="relative h-9 w-12 flex-shrink-0 overflow-hidden rounded border border-white/10 bg-white/5">
            {url ? <Image src={`${url}?w=96&h=72&fit=crop`} alt="" fill sizes="48px" className="object-cover" unoptimized /> : <Icon className="absolute inset-0 m-auto h-4 w-4 text-white/30" />}
        </div>
    );
}

interface BlocksInputProps {
    value: Values[] | undefined;
    onChange: (v: Values[]) => void;
    path: string;
    // Allows image, video and gallery blocks between the paragraphs.
    media?: boolean;
}

export default function BlocksInput({ value, onChange, path, media = false }: BlocksInputProps) {
    const { errors } = useEditorContext();
    // Rows are the source of truth while typing so the markup text never jumps; the
    // editor remounts this component (via key) whenever the document is reloaded.
    const [rows, setRows] = useState<Row[]>(() => (value ?? []).filter((b) => b && typeof b === 'object').map(toRow));
    // Mirrors `rows` for work that finishes later (uploads), which must not overwrite
    // edits made in the meantime.
    const latest = useRef(rows);
    const [open, setOpen] = useState<Set<string>>(new Set());
    const [dragging, setDragging] = useState(false);
    const [fileOver, setFileOver] = useState(false);
    const [upload, setUpload] = useState<{ busy?: string; error?: string }>({});
    // The paragraph the formatting toolbar acts on: the one focused last.
    const focused = useRef<{ key: string; el: HTMLTextAreaElement } | null>(null);
    const list = useRef<HTMLDivElement>(null);
    const dndId = useId();
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const commit = (next: Row[]) => {
        latest.current = next;
        setRows(next);
        onChange(next.map(toBlock));
    };
    const update = (key: string, patch: Partial<TextRow>) => commit(latest.current.map((r) => (r.key === key && !isObject(r) ? { ...r, ...patch } : r)));
    const setValue = (key: string, next: Values) => commit(latest.current.map((r) => (r.key === key ? { key, value: next } : r)));
    const insertAt = (index: number, row: Row) => {
        const next = [...latest.current];
        next.splice(index, 0, row);
        commit(next);
    };
    const insertText = (index: number) => {
        // A new list item continues the list it was added to.
        const prev = latest.current[index - 1];
        const kind = prev && !isObject(prev) && (prev.kind === 'bullet' || prev.kind === 'number') ? prev.kind : 'normal';
        insertAt(index, { key: newKey(), kind, text: '' });
    };
    const insertMedia = (index: number, def: MediaBlockDef, content: Values = {}) => {
        const key = newKey();
        insertAt(index, { key, value: { _key: key, _type: def.type, ...def.defaults, ...content } });
        setOpen((s) => new Set(s).add(key));
    };
    const toggle = (key: string) => setOpen((s) => {
        const next = new Set(s);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
    });

    const onDragEnd = ({ active, over }: DragEndEvent) => {
        setDragging(false);
        if (!over || active.id === over.id) return;
        const current = latest.current;
        commit(arrayMove(current, current.findIndex((r) => r.key === active.id), current.findIndex((r) => r.key === over.id)));
    };

    const format = (token: string) => {
        const target = focused.current;
        const row = target && latest.current.find((r) => r.key === target.key);
        if (!target || !row || isObject(row) || !target.el.isConnected) return;
        const { text, from, to } = applyFormat(target.el, token);
        update(row.key, { text });
        // The textarea is controlled; restore the selection once React has written the text.
        requestAnimationFrame(() => {
            target.el.focus();
            target.el.setSelectionRange(from, to);
        });
    };

    const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>, index: number) => {
        if (!(e.metaKey || e.ctrlKey) || e.altKey) return;
        if (e.key === 'Enter') {
            e.preventDefault();
            insertText(index + 1);
            return;
        }
        const match = FORMATS.find((f) => f.key && f.key === e.key.toLowerCase());
        if (match && !e.shiftKey) {
            e.preventDefault();
            format(match.token);
        }
    };

    // Image files dropped on the list become a block at the position they were dropped:
    // one file an image, several a gallery.
    const hasFiles = (e: DragEvent) => media && e.dataTransfer.types.includes('Files');
    const onDrop = async (e: DragEvent) => {
        if (!hasFiles(e)) return;
        e.preventDefault();
        setFileOver(false);
        const files = [...e.dataTransfer.files].filter((f) => f.type.startsWith('image/'));
        if (!files.length) {
            setUpload({ error: 'Only image files can be dropped here. Add a video with “+ Video”.' });
            return;
        }
        // Remember the row above the drop point; indexes may shift while uploading.
        const elements = [...(list.current?.querySelectorAll<HTMLElement>('[data-block-row]') ?? [])];
        const above = elements.filter((el) => el.getBoundingClientRect().top + el.offsetHeight / 2 < e.clientY).length;
        const anchor = latest.current[above - 1]?.key;

        const images: Values[] = [];
        try {
            for (const [i, file] of files.entries()) {
                setUpload({ busy: `Uploading ${i + 1} of ${files.length}…` });
                const asset = await uploadAsset(file, 'image');
                images.push({ _type: 'image', asset: { _type: 'reference', _ref: asset.ref } });
            }
            setUpload({});
        } catch (error) {
            setUpload({ error: error instanceof Error ? error.message : 'Upload failed' });
        }
        if (!images.length) return;
        const index = anchor ? latest.current.findIndex((r) => r.key === anchor) + 1 : 0;
        if (images.length === 1) insertMedia(index, getMediaBlock('imageBlock')!, { image: images[0] });
        else insertMedia(index, getMediaBlock('galleryBlock')!, { images: images.map((image) => ({ ...image, _key: newKey() })) });
    };

    const errorAt = (index: number) => {
        const own = `${path}.${index}`;
        return Object.entries(errors).find(([p]) => p === own || p.startsWith(`${own}.`))?.[1];
    };

    const insertBar = (index: number, pinned = false) => (
        <InsertBar media={media} pinned={pinned} disabled={dragging} onText={() => insertText(index)} onMedia={(def) => insertMedia(index, def)} />
    );

    return (
        <div className="space-y-2">
            <div className="sticky -top-4 z-20 -mx-1 flex flex-wrap items-center gap-1 rounded-md border border-white/10 bg-neutral-950 px-1.5 py-1 sm:-top-6">
                {FORMATS.map((f) => (
                    <button
                        key={f.token}
                        type="button"
                        className="rounded p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                        // Keeps the paragraph focused, so its selection is still there to format.
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => format(f.token)}
                        aria-label={f.label}
                        title={f.hint ? `${f.label} (${f.hint})` : f.label}
                    >
                        <f.icon className="h-4 w-4" />
                    </button>
                ))}
                <span className="ml-auto pr-1 text-xs text-white/30">
                    <code>**bold**</code> <code>*italic*</code> <code>__underline__</code> <code>~~strike~~</code> <code>`code`</code> <code>[text](https://…)</code> · escape with <code>\</code>
                </span>
            </div>

            <div
                ref={list}
                className={`rounded-md ${fileOver ? 'outline-dashed outline-2 outline-offset-4 outline-blue-400' : ''}`}
                onDragOver={(e) => {
                    if (!hasFiles(e)) return;
                    e.preventDefault();
                    setFileOver(true);
                }}
                onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFileOver(false);
                }}
                onDrop={onDrop}
            >
                <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragStart={() => setDragging(true)} onDragCancel={() => setDragging(false)} onDragEnd={onDragEnd}>
                    <SortableContext items={rows.map((r) => r.key)} strategy={verticalListSortingStrategy}>
                        {rows.map((row, index) => {
                            const error = errorAt(index);
                            const controls = (
                                <RowControls
                                    index={index}
                                    count={rows.length}
                                    onMove={(to) => commit(arrayMove(latest.current, index, to))}
                                    onRemove={() => commit(latest.current.filter((r) => r.key !== row.key))}
                                />
                            );
                            return (
                                <div key={row.key}>
                                    {index > 0 && insertBar(index)}
                                    <SortableRow id={row.key}>
                                        {(handle) =>
                                            isObject(row) ? (
                                                <ObjectCard
                                                    row={row}
                                                    def={media ? getMediaBlock(row.value._type) : undefined}
                                                    path={`${path}.${index}`}
                                                    error={error}
                                                    isOpen={open.has(row.key) || !!error}
                                                    onToggle={() => toggle(row.key)}
                                                    onChange={(next) => setValue(row.key, next)}
                                                    handle={handle}
                                                    controls={controls}
                                                />
                                            ) : (
                                                <div>
                                                    <div className="flex items-start gap-1.5">
                                                        <div className="pt-1.5">{handle}</div>
                                                        <select
                                                            className={`${inputClass} !w-32 flex-shrink-0`}
                                                            value={row.kind}
                                                            onChange={(e) => update(row.key, { kind: e.target.value })}
                                                            aria-label="Block style"
                                                        >
                                                            {STYLES.map((s) => (
                                                                <option key={s.value} value={s.value}>{s.label}</option>
                                                            ))}
                                                        </select>
                                                        <textarea
                                                            className={`${inputClass} min-h-[2.5rem] min-w-0 flex-1 ${row.kind.startsWith('h') ? 'font-semibold' : ''} ${error ? 'border-red-400/60' : ''}`}
                                                            rows={Math.min(8, Math.max(1, Math.ceil(row.text.length / 80)))}
                                                            value={row.text}
                                                            onChange={(e) => update(row.key, { text: e.target.value })}
                                                            onFocus={(e) => { focused.current = { key: row.key, el: e.currentTarget }; }}
                                                            onKeyDown={(e) => onKeyDown(e, index)}
                                                        />
                                                        <div className="flex flex-col">{controls}</div>
                                                    </div>
                                                    {error && <p className="pl-8 pt-1 text-xs text-red-400">{error}</p>}
                                                </div>
                                            )
                                        }
                                    </SortableRow>
                                </div>
                            );
                        })}
                    </SortableContext>
                </DndContext>
            </div>

            {insertBar(rows.length, true)}
            {upload.busy && <p className="flex items-center gap-1.5 text-xs text-white/50"><Loader2 className="h-3.5 w-3.5 animate-spin" /> {upload.busy}</p>}
            {upload.error && <p className="text-xs text-red-400">{upload.error}</p>}
            <p className="text-xs text-white/30">
                Drag the handle to reorder. Ctrl/⌘ + Enter adds a paragraph below.
                {media && ' Drop image files onto the list to place them where you drop.'}
            </p>
        </div>
    );
}

interface ObjectCardProps {
    row: ObjectRow;
    // Undefined when this field cannot hold the block's type.
    def: MediaBlockDef | undefined;
    path: string;
    error: string | undefined;
    isOpen: boolean;
    onToggle: () => void;
    onChange: (next: Values) => void;
    handle: ReactNode;
    controls: ReactNode;
}

function ObjectCard({ row, def, path, error, isOpen, onToggle, onChange, handle, controls }: ObjectCardProps) {
    const { value } = row;
    const frame = `rounded-md border bg-white/[0.03] ${error ? 'border-red-400/60' : 'border-white/10'}`;

    if (!def) {
        return (
            <div className={`${frame} flex items-center gap-1.5 px-2 py-2`}>
                {handle}
                <p className="min-w-0 flex-1 text-sm text-amber-200">
                    Unsupported block “{String(value._type)}”. It cannot be edited or saved here; delete it to continue.
                </p>
                <div className="flex flex-shrink-0 items-center">{controls}</div>
            </div>
        );
    }

    const layouts = def.fields.find((f) => f.name === 'layout');
    const summary = String(value.caption ?? value.alt ?? '').trim();

    return (
        <div className={frame}>
            <div className="flex flex-wrap items-center gap-1.5 px-2 py-2">
                {handle}
                <button type="button" className="flex min-w-[9rem] flex-1 items-center gap-2 text-left" onClick={onToggle} aria-expanded={isOpen}>
                    {isOpen ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />}
                    <MediaThumb value={value} />
                    <span className="text-sm font-medium">{def.title}</span>
                    {summary && <span className="truncate text-xs text-white/40">{summary}</span>}
                </button>
                {layouts?.kind === 'select' && (
                    <div className="flex flex-shrink-0 overflow-hidden rounded-md border border-white/15" role="group" aria-label="Layout">
                        {layouts.options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onChange({ ...value, layout: option.value })}
                                aria-pressed={value.layout === option.value}
                                className={`px-2 py-1 text-xs ${value.layout === option.value ? 'bg-blue-600 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
                <div className="flex flex-shrink-0 items-center">{controls}</div>
            </div>
            {isOpen && (
                <div className="border-t border-white/10 p-4">
                    <FieldList fields={def.fields} values={value} path={path} onChange={onChange} />
                </div>
            )}
        </div>
    );
}
