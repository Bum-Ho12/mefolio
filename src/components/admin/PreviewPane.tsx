'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Monitor, RotateCw, Smartphone, Tablet } from 'lucide-react';
import type { Lookup } from '@/lib/content/adapters';

export const PREVIEW_MESSAGE = 'mefolio-preview';
export const PREVIEW_READY = 'mefolio-preview-ready';

const VIEWPORTS = [
    { id: 'mobile', label: 'Mobile', width: 390, icon: Smartphone },
    { id: 'tablet', label: 'Tablet', width: 820, icon: Tablet },
    { id: 'desktop', label: 'Desktop', width: 1280, icon: Monitor },
] as const;

// The preview renders in a same-origin iframe so Tailwind breakpoints and
// matchMedia see a real viewport width. The iframe is scaled down to fit the pane.
export default function PreviewPane({ type, values, lookup }: { type: string; values: Record<string, unknown>; lookup: Lookup }) {
    const frame = useRef<HTMLIFrameElement>(null);
    const container = useRef<HTMLDivElement>(null);
    const [viewport, setViewport] = useState<(typeof VIEWPORTS)[number]>(VIEWPORTS[2]);
    const [available, setAvailable] = useState(0);
    const [reloadKey, setReloadKey] = useState(0);

    const send = useCallback(() => {
        frame.current?.contentWindow?.postMessage({ kind: PREVIEW_MESSAGE, type, doc: values, lookup }, window.location.origin);
    }, [type, values, lookup]);

    // Debounced so typing does not re-render heavy sections on every keystroke.
    useEffect(() => {
        const timer = setTimeout(send, 250);
        return () => clearTimeout(timer);
    }, [send]);

    useEffect(() => {
        const onMessage = (e: MessageEvent) => {
            if (e.origin === window.location.origin && e.source === frame.current?.contentWindow && e.data?.kind === PREVIEW_READY) send();
        };
        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, [send]);

    useEffect(() => {
        const el = container.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => setAvailable(entry.contentRect.width));
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const scale = available ? Math.min(1, available / viewport.width) : 1;

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                <span className="text-xs font-medium uppercase tracking-wider text-white/40">Live preview</span>
                <div className="flex items-center gap-1">
                    {VIEWPORTS.map((v) => (
                        <button
                            key={v.id}
                            type="button"
                            onClick={() => setViewport(v)}
                            className={`rounded p-1.5 ${viewport.id === v.id ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'}`}
                            title={`${v.label} (${v.width}px)`}
                            aria-pressed={viewport.id === v.id}
                        >
                            <v.icon className="h-4 w-4" />
                        </button>
                    ))}
                    <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="rounded p-1.5 text-white/40 hover:text-white" title="Reload preview">
                        <RotateCw className="h-4 w-4" />
                    </button>
                </div>
            </div>
            <div ref={container} className="relative flex-1 overflow-hidden bg-neutral-900">
                <div style={{ width: viewport.width, height: `${100 / scale}%`, transform: `scale(${scale})`, transformOrigin: 'top left' }} className={scale === 1 ? 'mx-auto' : ''}>
                    <iframe
                        key={reloadKey}
                        ref={frame}
                        src="/admin/preview"
                        title="Content preview"
                        className="h-full w-full border-0 bg-black"
                    />
                </div>
            </div>
        </div>
    );
}
