'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, Monitor, RotateCw, Smartphone, Tablet } from 'lucide-react';
import type { Lookup } from '@/lib/content/adapters';

export const PREVIEW_MESSAGE = 'mefolio-preview';
export const PREVIEW_READY = 'mefolio-preview-ready';

const VIEWPORTS = [
    { id: 'mobile', label: 'Mobile', width: 390, height: 844, icon: Smartphone },
    { id: 'tablet', label: 'Tablet', width: 820, height: 1180, icon: Tablet },
    { id: 'desktop', label: 'Desktop', width: 1440, height: 900, icon: Monitor },
] as const;

// Breathing room between the device frame and the pane edges.
const STAGE_PADDING = 24;

interface PreviewPaneProps {
    type: string;
    values: Record<string, unknown>;
    lookup: Lookup;
    // Focus mode hides the form so wide viewports get the whole editor area.
    focused: boolean;
    onToggleFocus: () => void;
}

// The preview renders in a same-origin iframe sized to a real device viewport, so
// Tailwind breakpoints, matchMedia and h-screen sections behave as on that device.
// The frame is then scaled down to fit entirely inside the pane.
export default function PreviewPane({ type, values, lookup, focused, onToggleFocus }: PreviewPaneProps) {
    const frame = useRef<HTMLIFrameElement>(null);
    const container = useRef<HTMLDivElement>(null);
    const [viewport, setViewport] = useState<(typeof VIEWPORTS)[number]>(VIEWPORTS[2]);
    const [pane, setPane] = useState({ width: 0, height: 0 });
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
        const observer = new ResizeObserver(([entry]) => setPane({ width: entry.contentRect.width, height: entry.contentRect.height }));
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const scale = pane.width
        ? Math.max(0.1, Math.min(1, (pane.width - STAGE_PADDING) / viewport.width, (pane.height - STAGE_PADDING) / viewport.height))
        : 1;

    return (
        <div className="flex h-full min-w-0 flex-col">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-white/10 px-3 py-2">
                <span className="text-xs font-medium uppercase tracking-wider text-white/40">
                    Live preview
                    <span className="ml-2 normal-case tracking-normal text-white/30">
                        {viewport.label} · {viewport.width}×{viewport.height} · {Math.round(scale * 100)}%
                    </span>
                </span>
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
                    <button
                        type="button"
                        onClick={onToggleFocus}
                        className={`hidden items-center gap-1.5 rounded px-2 py-1.5 text-xs lg:inline-flex ${focused ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'}`}
                        title={focused ? 'Back to fields (Esc)' : 'Expand preview'}
                        aria-pressed={focused}
                    >
                        {focused ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        {focused ? 'Back to fields' : 'Expand'}
                    </button>
                </div>
            </div>
            <div ref={container} className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-neutral-900">
                {/* Absolutely positioned: a transform does not shrink layout size, so in
                    normal flow the unscaled frame would force the pane wider than its column. */}
                <div
                    className="absolute overflow-hidden rounded-md border border-white/15 shadow-2xl"
                    style={{
                        width: viewport.width,
                        height: viewport.height,
                        left: Math.max(0, (pane.width - viewport.width * scale) / 2),
                        top: Math.max(0, (pane.height - viewport.height * scale) / 2),
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                    }}
                >
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
