'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Copy, ExternalLink, Plus, Star, Trash2, X } from 'lucide-react';
import { linkRef, linkType, newKey, type Field } from '@/lib/content/fields';
import BlocksInput from './BlocksInput';
import { FileInput, ImageInput, ImagesInput, VideoSourceInput } from './MediaInputs';
import { useEditorContext } from './EditorContext';
import { Button, inputClass } from './ui';

/* eslint-disable @typescript-eslint/no-explicit-any -- values are schema-driven JSON */

type Values = Record<string, any>;

interface FieldProps {
    field: Field;
    value: any;
    onChange: (value: any) => void;
    path: string;
    siblings?: Values;
    // Updates several fields of the parent object at once.
    patch: (partial: Values) => void;
}

const slugify = (s: string) =>
    s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 96);

export function FieldList({ fields, values, onChange, path = '' }: { fields: Field[]; values: Values; onChange: (v: Values) => void; path?: string }) {
    return (
        <div className="space-y-5">
            {fields.filter((field) => !field.hidden).map((field) => (
                <FieldInput
                    key={field.name}
                    field={field}
                    value={values[field.name]}
                    siblings={values}
                    path={path ? `${path}.${field.name}` : field.name}
                    onChange={(v) => onChange({ ...values, [field.name]: v })}
                    patch={(partial) => onChange({ ...values, ...partial })}
                />
            ))}
        </div>
    );
}

export function FieldInput(props: FieldProps) {
    const { field, path } = props;
    const { errors } = useEditorContext();
    // Errors are reported at the field path or somewhere beneath it.
    const error = errors[path] ?? Object.entries(errors).find(([p]) => p.startsWith(`${path}.`))?.[1];
    const inline = field.kind === 'boolean';

    return (
        <div className={inline ? 'flex items-center justify-between gap-4' : 'space-y-1.5'} data-path={path}>
            <label className="block text-sm font-medium text-white/80" htmlFor={path}>
                {field.title}
                {field.required && <span className="ml-0.5 text-red-400">*</span>}
            </label>
            {field.description && !inline && <p className="text-xs text-white/40">{field.description}</p>}
            <Control {...props} />
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
}

function Control({ field, value, onChange, path, siblings, patch }: FieldProps) {
    const { refOptions } = useEditorContext();

    switch (field.kind) {
        case 'string':
            return <input id={path} className={inputClass} value={value ?? ''} maxLength={field.max ?? 500} onChange={(e) => onChange(e.target.value)} />;
        case 'text':
            return <textarea id={path} className={inputClass} rows={field.rows ?? 4} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
        case 'url':
            return <input id={path} type="url" className={inputClass} value={value ?? ''} placeholder="https://" onChange={(e) => onChange(e.target.value.trim())} />;
        case 'email':
            return <input id={path} type="email" className={inputClass} value={value ?? ''} onChange={(e) => onChange(e.target.value.trim())} />;
        case 'number':
            return (
                <input
                    id={path}
                    type="number"
                    className={`${inputClass} max-w-[12rem]`}
                    value={value ?? ''}
                    min={field.min}
                    max={field.max}
                    step={field.step ?? 1}
                    onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                />
            );
        case 'boolean':
            return (
                <button
                    id={path}
                    type="button"
                    role="switch"
                    aria-checked={!!value}
                    onClick={() => onChange(!value)}
                    className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-white/15'}`}
                >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${value ? 'left-[1.375rem]' : 'left-0.5'}`} />
                </button>
            );
        case 'date':
            return <input id={path} type="date" className={`${inputClass} max-w-[12rem] [color-scheme:dark]`} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
        case 'color':
            return (
                <div className="flex items-center gap-2">
                    <input type="color" className="h-9 w-12 cursor-pointer rounded border border-white/15 bg-transparent" value={/^#[0-9a-f]{6}$/i.test(value ?? '') ? value : '#000000'} onChange={(e) => onChange(e.target.value)} />
                    <input id={path} className={`${inputClass} max-w-[8rem] font-mono`} value={value ?? ''} placeholder="#RRGGBB" onChange={(e) => onChange(e.target.value)} />
                </div>
            );
        case 'select':
            return (
                <select id={path} className={`${inputClass} max-w-xs`} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
                    <option value="">Select…</option>
                    {field.options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            );
        case 'slug': {
            const source = siblings?.[field.source];
            return (
                <div className="flex gap-2">
                    <input
                        id={path}
                        className={`${inputClass} font-mono`}
                        value={value?.current ?? ''}
                        onChange={(e) => onChange({ _type: 'slug', current: e.target.value.toLowerCase() })}
                    />
                    <Button disabled={typeof source !== 'string' || !source} onClick={() => onChange({ _type: 'slug', current: slugify(String(source)) })}>
                        Generate
                    </Button>
                </div>
            );
        }
        case 'tags':
            return <TagsInput id={path} value={value} onChange={onChange} suggestions={field.suggestions} />;
        case 'image':
            return <ImageInput value={value} onChange={onChange} svg={field.svg} />;
        case 'images':
            return <ImagesInput value={value} onChange={onChange} />;
        case 'file':
            return <FileInput value={value} onChange={onChange} />;
        case 'videoSource':
            return (
                <VideoSourceInput
                    publicId={value}
                    url={siblings?.[field.urlField]}
                    poster={siblings?.poster}
                    onChange={(source) => patch({ [field.name]: source.publicId, [field.urlField]: source.url })}
                />
            );
        case 'videoUrl':
            // Edited through its videoSource sibling.
            return null;
        case 'blocks':
            return <BlocksInput value={value} onChange={onChange} path={path} media={field.media} />;
        case 'reference': {
            const options = refOptions[field.to] ?? [];
            return (
                <div className="flex gap-2">
                    <select
                        id={path}
                        className={inputClass}
                        value={value?._ref ?? ''}
                        onChange={(e) => onChange(e.target.value ? { _type: 'reference', _ref: e.target.value } : undefined)}
                    >
                        <option value="">None</option>
                        {options.map((o) => (
                            <option key={o.id} value={o.id}>{o.title}</option>
                        ))}
                        {value?._ref && !options.some((o) => o.id === value._ref) && <option value={value._ref}>Missing or unpublished ({value._ref.slice(0, 8)}…)</option>}
                    </select>
                    {value?._ref && (
                        <Link href={`/admin/${field.to}/${value._ref}`} className="inline-flex items-center rounded-md border border-white/15 px-2 text-white/60 hover:text-white" title="Open referenced document">
                            <ExternalLink className="h-4 w-4" />
                        </Link>
                    )}
                </div>
            );
        }
        case 'references':
            return <ReferencesInput to={field.to} flag={field.flag} value={value} onChange={onChange} />;
        case 'objects':
            return <ObjectsInput field={field} value={value} onChange={onChange} path={path} />;
    }
}

function TagsInput({ id, value, onChange, suggestions }: { id: string; value: string[] | undefined; onChange: (v: string[]) => void; suggestions?: string[] }) {
    const tags = value ?? [];
    const [draft, setDraft] = useState('');
    const add = (tag: string) => {
        const t = tag.trim();
        if (t && !tags.includes(t)) onChange([...tags, t]);
        setDraft('');
    };
    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs">
                        {tag}
                        <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))} aria-label={`Remove ${tag}`}>
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}
            </div>
            <input
                id={id}
                className={inputClass}
                value={draft}
                placeholder="Type and press Enter"
                list={suggestions ? `${id}-suggestions` : undefined}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        add(draft);
                    }
                }}
                onBlur={() => draft && add(draft)}
            />
            {suggestions && (
                <datalist id={`${id}-suggestions`}>
                    {suggestions.filter((s) => !tags.includes(s)).map((s) => <option key={s} value={s} />)}
                </datalist>
            )}
        </div>
    );
}

function moveItem<T>(items: T[], from: number, to: number) {
    const next = [...items];
    next.splice(to, 0, next.splice(from, 1)[0]);
    return next;
}

function ItemControls({ index, count, onMove, onRemove, onDuplicate }: { index: number; count: number; onMove: (to: number) => void; onRemove: () => void; onDuplicate?: () => void }) {
    const cls = 'rounded p-1 text-white/40 hover:bg-white/10 hover:text-white disabled:opacity-20';
    return (
        <div className="flex flex-shrink-0 items-center">
            <button type="button" className={cls} disabled={index === 0} onClick={() => onMove(index - 1)} aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
            <button type="button" className={cls} disabled={index === count - 1} onClick={() => onMove(index + 1)} aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
            {onDuplicate && <button type="button" className={cls} onClick={onDuplicate} aria-label="Duplicate"><Copy className="h-4 w-4" /></button>}
            <button type="button" className={`${cls} hover:text-red-400`} onClick={onRemove} aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
        </div>
    );
}

function ReferencesInput({ to, flag, value, onChange }: { to: string; flag?: Extract<Field, { kind: 'references' }>['flag']; value: any[] | undefined; onChange: (v: any[]) => void }) {
    const { refOptions } = useEditorContext();
    const items = value ?? [];
    const options = refOptions[to] ?? [];
    const byId = new Map(options.map((o) => [o.id, o]));
    const available = options.filter((o) => !items.some((i) => linkRef(i, to) === o.id));
    // With a switch, links wrap their reference (see linkRef); a plain one is converted when toggled.
    const makeLink = (key: string, id: string, on?: boolean) =>
        flag ? { _key: key, _type: linkType(to), [to]: { _type: 'reference', _ref: id }, [flag.name]: on ?? flag.default } : { _key: key, _type: 'reference', _ref: id };

    return (
        <div className="space-y-2">
            {items.map((item, index) => {
                const id = linkRef(item, to) ?? '';
                const option = byId.get(id);
                return (
                    <div key={item._key} className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
                        <span className="w-6 text-xs text-white/30">{index + 1}</span>
                        <Link href={`/admin/${to}/${id}`} className="min-w-0 flex-1 truncate text-sm hover:text-blue-300">
                            {option?.title ?? <span className="text-amber-300">Missing or unpublished document</span>}
                            {option?.subtitle && <span className="ml-2 text-white/40">{option.subtitle}</span>}
                        </Link>
                        {flag && (() => {
                            const on = item[flag.name] ?? flag.default;
                            return (
                                <button
                                    type="button"
                                    aria-pressed={on}
                                    title={flag.title}
                                    onClick={() => onChange(items.map((it, i) => (i === index ? makeLink(it._key, id, !on) : it)))}
                                    className={`flex flex-shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${on ? 'border-amber-300/50 bg-amber-300/10 text-amber-200' : 'border-white/10 text-white/40 hover:text-white/70'}`}
                                >
                                    <Star className={`h-3.5 w-3.5 ${on ? 'fill-current' : ''}`} /> {flag.title}
                                </button>
                            );
                        })()}
                        <ItemControls
                            index={index}
                            count={items.length}
                            onMove={(t) => onChange(moveItem(items, index, t))}
                            onRemove={() => onChange(items.filter((_, i) => i !== index))}
                        />
                    </div>
                );
            })}
            <select
                className={`${inputClass} max-w-sm`}
                value=""
                onChange={(e) => e.target.value && onChange([...items, makeLink(newKey(), e.target.value)])}
                disabled={!available.length}
            >
                <option value="">{available.length ? '+ Add existing…' : 'No more published documents to add'}</option>
                {available.map((o) => (
                    <option key={o.id} value={o.id}>{o.title}</option>
                ))}
            </select>
            <Link href={`/admin/${to}/new`} className="ml-3 text-xs text-blue-300 hover:underline">
                Create new
            </Link>
        </div>
    );
}

function ObjectsInput({ field, value, onChange, path }: { field: Extract<Field, { kind: 'objects' }>; value: any[] | undefined; onChange: (v: any[]) => void; path: string }) {
    const items: Values[] = value ?? [];
    const [open, setOpen] = useState<Set<string>>(new Set());
    const toggle = (key: string) => setOpen((s) => {
        const next = new Set(s);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
    });
    const add = () => {
        const key = newKey();
        onChange([...items, { _key: key }]);
        setOpen((s) => new Set(s).add(key));
    };

    return (
        <div className="space-y-2">
            {items.map((item, index) => {
                const isOpen = open.has(item._key);
                const title = String(item[field.itemTitle] ?? '').trim() || `Item ${index + 1}`;
                const subtitle = field.itemSubtitle ? String(item[field.itemSubtitle] ?? '') : '';
                return (
                    <div key={item._key} className="rounded-md border border-white/10 bg-white/[0.03]">
                        <div className="flex items-center gap-2 px-3 py-2">
                            <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={() => toggle(item._key)} aria-expanded={isOpen}>
                                {isOpen ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />}
                                <span className="truncate text-sm font-medium">{title}</span>
                                {subtitle && <span className="truncate text-xs text-white/40">{subtitle}</span>}
                            </button>
                            <ItemControls
                                index={index}
                                count={items.length}
                                onMove={(t) => onChange(moveItem(items, index, t))}
                                onRemove={() => onChange(items.filter((_, i) => i !== index))}
                                onDuplicate={() => {
                                    const copy = { ...structuredClone(item), _key: newKey() };
                                    onChange([...items.slice(0, index + 1), copy, ...items.slice(index + 1)]);
                                }}
                            />
                        </div>
                        {isOpen && (
                            <div className="border-t border-white/10 p-4">
                                <FieldList
                                    fields={field.of}
                                    values={item}
                                    path={`${path}.${index}`}
                                    onChange={(next) => onChange(items.map((it, i) => (i === index ? next : it)))}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
            <Button onClick={add}>
                <Plus className="h-4 w-4" /> Add {field.title.toLowerCase().replace(/s$/, '')}
            </Button>
        </div>
    );
}
