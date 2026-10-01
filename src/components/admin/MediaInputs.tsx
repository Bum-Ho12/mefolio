'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { FileText, ImagePlus, Loader2, Trash2, Upload, Video } from 'lucide-react';
import { assetUrl } from '@/lib/sanity/config';
import { posterUrl } from '@/utils/cloudinary';
import { newKey } from '@/lib/content/fields';
import { Button, inputClass } from './ui';
import { uploadAsset, uploadVideo } from './upload';
import { useEditorContext } from './EditorContext';

type ImageValue = { _type: 'image'; asset: { _type: 'reference'; _ref: string }; _key?: string } | undefined;
type FileValue = { _type: 'file'; asset: { _type: 'reference'; _ref: string } } | undefined;

function useUploader() {
    const [progress, setProgress] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const run = async <T,>(task: (onProgress: (f: number) => void) => Promise<T>): Promise<T | undefined> => {
        setError(null);
        setProgress(0);
        try {
            return await task(setProgress);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Upload failed');
        } finally {
            setProgress(null);
        }
    };
    return { progress, error, run };
}

function PickButton({ accept, onFile, busy, children }: { accept: string; onFile: (f: File) => void; busy: boolean; children: React.ReactNode }) {
    const input = useRef<HTMLInputElement>(null);
    return (
        <>
            <input
                ref={input}
                type="file"
                accept={accept}
                hidden
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (file) onFile(file);
                }}
            />
            <Button onClick={() => input.current?.click()} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {children}
            </Button>
        </>
    );
}

const Progress = ({ value }: { value: number | null }) =>
    value === null ? null : (
        <div className="h-1 w-full overflow-hidden rounded bg-white/10">
            <div className="h-full bg-blue-500 transition-all" style={{ width: `${Math.round(value * 100)}%` }} />
        </div>
    );

const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/avif,image/gif';

export function ImageInput({ value, onChange }: { value: ImageValue; onChange: (v: ImageValue) => void }) {
    const { progress, error, run } = useUploader();
    const url = assetUrl(value?.asset?._ref);

    const upload = async (file: File) => {
        const asset = await run((p) => uploadAsset(file, 'image', p));
        if (asset) onChange({ ...(value?._key ? { _key: value._key } : {}), _type: 'image', asset: { _type: 'reference', _ref: asset.ref } });
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-3">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/5">
                    {url ? (
                        <Image src={`${url}?w=160&h=160&fit=max`} alt="" fill sizes="80px" className="object-contain" unoptimized />
                    ) : (
                        <ImagePlus className="absolute inset-0 m-auto h-6 w-6 text-white/30" />
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    <PickButton accept={IMAGE_ACCEPT} onFile={upload} busy={progress !== null}>
                        <Upload className="h-4 w-4" /> {url ? 'Replace' : 'Upload'}
                    </PickButton>
                    {url && (
                        <Button variant="ghost" onClick={() => onChange(undefined)}>
                            <Trash2 className="h-4 w-4" /> Remove
                        </Button>
                    )}
                </div>
            </div>
            <Progress value={progress} />
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
}

export function ImagesInput({ value, onChange }: { value: NonNullable<ImageValue>[] | undefined; onChange: (v: NonNullable<ImageValue>[]) => void }) {
    const items = value ?? [];
    const { progress, error, run } = useUploader();

    const add = async (file: File) => {
        const asset = await run((p) => uploadAsset(file, 'image', p));
        if (asset) onChange([...items, { _key: newKey(), _type: 'image', asset: { _type: 'reference', _ref: asset.ref } }]);
    };
    const move = (from: number, to: number) => {
        const next = [...items];
        next.splice(to, 0, next.splice(from, 1)[0]);
        onChange(next);
    };

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {items.map((img, index) => {
                    const url = assetUrl(img.asset?._ref);
                    return (
                        <div key={img._key} className="group relative aspect-square overflow-hidden rounded-md border border-white/10 bg-white/5">
                            {url && <Image src={`${url}?w=240&h=240&fit=max`} alt="" fill sizes="120px" className="object-contain" unoptimized />}
                            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/70 p-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                                <button type="button" className="px-1 text-xs disabled:opacity-30" disabled={index === 0} onClick={() => move(index, index - 1)} aria-label="Move left">←</button>
                                <button type="button" className="px-1 text-xs text-red-300" onClick={() => onChange(items.filter((_, i) => i !== index))} aria-label="Remove image">✕</button>
                                <button type="button" className="px-1 text-xs disabled:opacity-30" disabled={index === items.length - 1} onClick={() => move(index, index + 1)} aria-label="Move right">→</button>
                            </div>
                        </div>
                    );
                })}
            </div>
            <PickButton accept={IMAGE_ACCEPT} onFile={add} busy={progress !== null}>
                <ImagePlus className="h-4 w-4" /> Add image
            </PickButton>
            <Progress value={progress} />
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
}

export function FileInput({ value, onChange }: { value: FileValue; onChange: (v: FileValue) => void }) {
    const { progress, error, run } = useUploader();
    const url = assetUrl(value?.asset?._ref);

    const upload = async (file: File) => {
        const asset = await run((p) => uploadAsset(file, 'file', p));
        if (asset) onChange({ _type: 'file', asset: { _type: 'reference', _ref: asset.ref } });
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
                {url && (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-sm text-blue-300 hover:bg-white/5">
                        <FileText className="h-4 w-4" /> Current file
                    </a>
                )}
                <PickButton accept="application/pdf" onFile={upload} busy={progress !== null}>
                    <Upload className="h-4 w-4" /> {url ? 'Replace PDF' : 'Upload PDF'}
                </PickButton>
                {url && (
                    <Button variant="ghost" onClick={() => onChange(undefined)}>
                        <Trash2 className="h-4 w-4" /> Remove
                    </Button>
                )}
            </div>
            <Progress value={progress} />
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
}

export function CloudinaryVideoInput({ value, onChange }: { value: string | undefined; onChange: (v: string) => void }) {
    const { cloudinaryEnabled } = useEditorContext();
    const { progress, error, run } = useUploader();

    const upload = async (file: File) => {
        const publicId = await run((p) => uploadVideo(file, p));
        if (publicId) onChange(publicId);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-3">
                <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/5">
                    {value ? (
                        <Image src={posterUrl(value, 240)} alt="" fill sizes="112px" className="object-cover" unoptimized />
                    ) : (
                        <Video className="absolute inset-0 m-auto h-6 w-6 text-white/30" />
                    )}
                </div>
                <input className={inputClass} value={value ?? ''} placeholder="folder/public-id (no extension)" onChange={(e) => onChange(e.target.value)} />
            </div>
            {cloudinaryEnabled && (
                <PickButton accept="video/mp4,video/webm,video/quicktime" onFile={upload} busy={progress !== null}>
                    <Upload className="h-4 w-4" /> Upload video to Cloudinary
                </PickButton>
            )}
            <Progress value={progress} />
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
}
