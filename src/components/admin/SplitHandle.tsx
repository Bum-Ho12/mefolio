'use client';

import { useState, useSyncExternalStore, type RefObject } from 'react';

const STORAGE_KEY = 'mefolio-admin-split';
const CHANGE_EVENT = 'mefolio-admin-split-change';
const DEFAULT_RATIO = 0.44;
const MIN_FORM_PX = 360;
const MIN_PREVIEW_PX = 320;

function subscribe(callback: () => void) {
    window.addEventListener(CHANGE_EVENT, callback);
    window.addEventListener('storage', callback);
    return () => {
        window.removeEventListener(CHANGE_EVENT, callback);
        window.removeEventListener('storage', callback);
    };
}

// localStorage can be unavailable (private mode, blocked site data); fall back to the default.
function readRatio() {
    try {
        const stored = Number(window.localStorage.getItem(STORAGE_KEY));
        return stored > 0 && stored < 1 ? stored : DEFAULT_RATIO;
    } catch {
        return DEFAULT_RATIO;
    }
}

function writeRatio(ratio: number) {
    try {
        window.localStorage.setItem(STORAGE_KEY, ratio.toFixed(4));
    } catch {
        // Not persisted; the split still works for this drag.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
}

// Share of the editor row given to the form column, remembered per browser.
export function useSplitRatio() {
    return useSyncExternalStore(subscribe, readRatio, () => DEFAULT_RATIO);
}

// Draggable divider between the form and the preview. `row` is the flex row both sit in.
export default function SplitHandle({ row }: { row: RefObject<HTMLDivElement | null> }) {
    const [dragging, setDragging] = useState(false);

    const onMove = (clientX: number) => {
        const rect = row.current?.getBoundingClientRect();
        if (!rect || rect.width < MIN_FORM_PX + MIN_PREVIEW_PX) return;
        const formPx = Math.min(rect.width - MIN_PREVIEW_PX, Math.max(MIN_FORM_PX, clientX - rect.left));
        writeRatio(formPx / rect.width);
    };

    return (
        <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize form and preview"
            tabIndex={0}
            className={`group relative hidden w-1.5 flex-shrink-0 cursor-col-resize touch-none lg:block ${dragging ? 'bg-blue-500' : 'bg-white/10 hover:bg-blue-500/60'}`}
            // Pointer capture keeps events on the handle even while the cursor is over the iframe.
            onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setDragging(true);
            }}
            onPointerMove={(e) => dragging && onMove(e.clientX)}
            onPointerUp={() => setDragging(false)}
            onPointerCancel={() => setDragging(false)}
            onDoubleClick={() => writeRatio(DEFAULT_RATIO)}
            onKeyDown={(e) => {
                const rect = row.current?.getBoundingClientRect();
                if (!rect || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
                e.preventDefault();
                onMove(rect.left + readRatio() * rect.width + (e.key === 'ArrowLeft' ? -24 : 24));
            }}
            title="Drag to resize · double-click to reset"
        />
    );
}
