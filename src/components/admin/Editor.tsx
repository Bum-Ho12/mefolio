'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, CircleAlert, Eye, EyeOff, Loader2, PencilLine } from 'lucide-react';
import { getDocType } from '@/lib/content/registry';
import { deleteDocument, discardDraft, publishDocument, saveDraft, unpublishDocument, type ActionResult } from '@/lib/content/actions';
import type { Lookup } from '@/lib/content/adapters';
import { hiddenOnSite } from '@/lib/content/visibility';
import { EditorContext, type RefOption } from './EditorContext';
import { FieldList } from './FieldInput';
import PreviewPane from './PreviewPane';
import SplitHandle, { useSplitRatio } from './SplitHandle';
import { Button, StatusBadges } from './ui';

type Values = Record<string, unknown>;
type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'conflict';

export interface EditorProps {
    type: string;
    id: string;
    initialValues: Values;
    initialRev: string | null;
    isPublished: boolean;
    hasDraft: boolean;
    lookup: Lookup;
    refOptions: Record<string, RefOption[]>;
    cloudinaryEnabled: boolean;
}

const AUTOSAVE_MS = 1500;

export default function Editor(props: EditorProps) {
    const def = getDocType(props.type)!;
    const router = useRouter();

    const [values, setValues] = useState<Values>(props.initialValues);
    const [saveState, setSaveState] = useState<SaveState>('idle');
    const [message, setMessage] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [status, setStatus] = useState({ isPublished: props.isPublished, hasDraft: props.hasDraft });
    const [busy, setBusy] = useState<string | null>(null);
    const [tab, setTab] = useState<'edit' | 'preview'>('edit');
    const [focusPreview, setFocusPreview] = useState(false);
    const splitRatio = useSplitRatio();
    const row = useRef<HTMLDivElement>(null);

    // Refs hold the latest values for the save loop without re-creating callbacks.
    const rev = useRef(props.initialRev);
    const latest = useRef(values);
    const dirty = useRef(false);
    const inFlight = useRef<Promise<boolean> | null>(null);

    const applyResult = useCallback((result: ActionResult) => {
        if (result.ok) {
            setErrors({});
            setMessage(null);
            return true;
        }
        setMessage(result.error);
        setErrors(Object.fromEntries((result.errors ?? []).map((e) => [e.path, e.message])));
        setSaveState(result.conflict ? 'conflict' : 'error');
        return false;
    }, []);

    // Saves are serialized: if edits land while a save is running, one more save follows.
    const save = useCallback(async (): Promise<boolean> => {
        if (inFlight.current) await inFlight.current;
        if (!dirty.current) return true;
        dirty.current = false;
        setSaveState('saving');
        const task = (async () => {
            const result = await saveDraft(def.type, props.id, latest.current, rev.current);
            if (!applyResult(result)) {
                dirty.current = true;
                return false;
            }
            if (result.ok && result.rev) rev.current = result.rev;
            setStatus((s) => ({ ...s, hasDraft: true }));
            setSaveState(dirty.current ? 'dirty' : 'saved');
            return true;
        })();
        inFlight.current = task;
        try {
            return await task;
        } finally {
            inFlight.current = null;
        }
    }, [def.type, props.id, applyResult]);

    const onChange = (next: Values) => {
        latest.current = next;
        dirty.current = true;
        setValues(next);
        setSaveState((s) => (s === 'conflict' ? s : 'dirty'));
    };

    // Autosave after a pause in typing (not while a conflict needs resolving).
    useEffect(() => {
        if (saveState !== 'dirty') return;
        const timer = setTimeout(save, AUTOSAVE_MS);
        return () => clearTimeout(timer);
    }, [values, saveState, save]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                save();
            }
            if (e.key === 'Escape') setFocusPreview(false);
        };
        const onUnload = (e: BeforeUnloadEvent) => {
            if (dirty.current || inFlight.current) e.preventDefault();
        };
        window.addEventListener('keydown', onKey);
        window.addEventListener('beforeunload', onUnload);
        return () => {
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('beforeunload', onUnload);
        };
    }, [save]);

    const run = async (label: string, task: () => Promise<ActionResult>, after?: () => void) => {
        setBusy(label);
        try {
            if (applyResult(await task())) after?.();
        } finally {
            setBusy(null);
        }
    };

    const publish = () =>
        run('publish', async () => {
            if (!(await save())) return { ok: false, error: 'Save failed; fix errors before publishing' };
            return publishDocument(def.type, props.id, rev.current);
        }, () => {
            rev.current = null;
            setStatus({ isPublished: true, hasDraft: false });
            setSaveState('idle');
            setMessage('Published');
            router.refresh();
        });

    const discard = () => {
        if (!confirm(status.isPublished ? 'Discard all unpublished changes?' : 'This document was never published. Discarding deletes it. Continue?')) return;
        run('discard', () => discardDraft(def.type, props.id), () => {
            dirty.current = false;
            if (status.isPublished) window.location.reload();
            else router.push(`/admin/${def.type}`);
        });
    };

    const unpublish = () => {
        if (!confirm('Unpublish? The content is kept as a draft but disappears from the site.')) return;
        run('unpublish', () => unpublishDocument(def.type, props.id), () => window.location.reload());
    };

    const remove = () => {
        const answer = prompt(`Type DELETE to permanently delete this ${def.title.toLowerCase()} (published and draft).`);
        if (answer !== 'DELETE') return;
        run('delete', () => deleteDocument(def.type, props.id), () => {
            dirty.current = false;
            router.push(`/admin/${def.type}`);
        });
    };

    const context = useMemo(() => ({ refOptions: props.refOptions, errors, cloudinaryEnabled: props.cloudinaryEnabled }), [props.refOptions, errors, props.cloudinaryEnabled]);
    const hiddenNotice = hiddenOnSite(def.type, values, props.lookup);
    const canPublish = status.hasDraft || saveState === 'dirty' || saveState === 'saved';

    return (
        <EditorContext.Provider value={context}>
            <div className="flex h-full flex-col">
                <header className="flex flex-wrap items-center gap-3 border-b border-white/10 py-3 pl-14 pr-4 md:pl-4">
                    <Link href={`/admin/${def.singleton ? '' : def.type}`} className="text-white/50 hover:text-white" aria-label="Back">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-lg font-semibold">
                            {(def.titleField && typeof values[def.titleField] === 'string' && (values[def.titleField] as string)) || def.title}
                        </h1>
                        <div className="flex items-center gap-2 text-xs">
                            <StatusBadges {...status} />
                            <SaveIndicator state={saveState} />
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {status.hasDraft && <Button variant="ghost" onClick={discard} disabled={!!busy}>Discard draft</Button>}
                        {status.isPublished && <Button variant="ghost" onClick={unpublish} disabled={!!busy}>Unpublish</Button>}
                        {!def.singleton && (status.isPublished || status.hasDraft) && <Button variant="danger" onClick={remove} disabled={!!busy}>Delete</Button>}
                        <Button variant="primary" onClick={publish} disabled={!!busy || !canPublish || saveState === 'conflict'}>
                            {busy === 'publish' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            Publish
                        </Button>
                    </div>
                </header>

                {message && (
                    <div className={`flex items-center gap-2 px-4 py-2 text-sm ${message === 'Published' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>
                        {message === 'Published' ? <Check className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />}
                        <span className="flex-1">{message}</span>
                        {saveState === 'conflict' && <Button onClick={() => window.location.reload()}>Reload</Button>}
                    </div>
                )}

                <div className="flex border-b border-white/10 lg:hidden">
                    {(['edit', 'preview'] as const).map((t) => (
                        <button key={t} type="button" onClick={() => setTab(t)} className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-sm ${tab === t ? 'border-b-2 border-blue-500 text-white' : 'text-white/50'}`}>
                            {t === 'edit' ? <PencilLine className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {t === 'edit' ? 'Edit' : 'Preview'}
                        </button>
                    ))}
                </div>

                {/* Desktop: form | handle | preview. The form keeps a fixed share and never
                    shrinks; the preview takes the rest and may shrink (min-w-0). In focus mode
                    the form is only hidden, so its state and unsaved edits are kept. */}
                <div ref={row} className="flex min-h-0 min-w-0 flex-1" style={{ '--form-w': `${(splitRatio * 100).toFixed(2)}%` } as React.CSSProperties}>
                    <div className={`min-h-0 w-full overflow-y-auto p-4 sm:p-6 lg:w-[var(--form-w)] lg:min-w-[360px] lg:flex-shrink-0 ${focusPreview ? 'lg:hidden' : 'lg:block'} ${tab === 'edit' ? 'block' : 'hidden'}`}>
                        <FieldList fields={def.fields} values={values} onChange={onChange} />
                    </div>
                    {!focusPreview && <SplitHandle row={row} />}
                    <div className={`min-h-0 min-w-0 flex-1 flex-col lg:flex ${tab === 'preview' ? 'flex' : 'hidden'}`}>
                        {hiddenNotice && (
                            <p className="flex items-center gap-2 border-b border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                                <EyeOff className="h-4 w-4 flex-shrink-0" /> {hiddenNotice}
                            </p>
                        )}
                        <div className="min-h-0 flex-1">
                        <PreviewPane
                            type={def.type}
                            values={values}
                            lookup={props.lookup}
                            focused={focusPreview}
                            onToggleFocus={() => setFocusPreview((f) => !f)}
                        />
                        </div>
                    </div>
                </div>
            </div>
        </EditorContext.Provider>
    );
}

function SaveIndicator({ state }: { state: SaveState }) {
    const map: Record<SaveState, [string, string]> = {
        idle: ['', ''],
        dirty: ['Unsaved changes', 'text-white/40'],
        saving: ['Saving draft…', 'text-white/40'],
        saved: ['Draft saved', 'text-emerald-400'],
        error: ['Not saved', 'text-red-400'],
        conflict: ['Conflict', 'text-red-400'],
    };
    const [label, cls] = map[state];
    return label ? <span className={cls}>{label}</span> : null;
}
