'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { newKey } from '@/lib/content/fields';
import { blockToMarkup, markupToBlock, type Block } from '@/lib/content/portableText';
import { Button, inputClass } from './ui';

// Paragraph-level editor for Portable Text. Each row is one block with a style and
// inline markup; rows are converted back to blocks on every keystroke.

const STYLES = [
    { value: 'normal', label: 'Paragraph' },
    { value: 'h1', label: 'Heading 1' },
    { value: 'h2', label: 'Heading 2' },
    { value: 'h3', label: 'Heading 3' },
    { value: 'blockquote', label: 'Quote' },
    { value: 'bullet', label: '• Bullet' },
    { value: 'number', label: '1. Numbered' },
] as const;

interface Row {
    key: string;
    kind: string;
    text: string;
    level?: number;
}

const toRow = (b: Block): Row => ({ key: b._key, kind: b.listItem ?? b.style ?? 'normal', text: blockToMarkup(b), level: b.level });

const toBlock = (r: Row) =>
    markupToBlock(
        r.text,
        r.kind === 'bullet' || r.kind === 'number'
            ? { _key: r.key, style: 'normal', listItem: r.kind, level: r.level ?? 1 }
            : { _key: r.key, style: r.kind },
    );

export default function BlocksInput({ value, onChange }: { value: Block[] | undefined; onChange: (v: Block[]) => void }) {
    // Rows are the source of truth while typing so the markup text never jumps; the
    // editor remounts this component (via key) whenever the document is reloaded.
    const [rows, setRows] = useState<Row[]>(() => (value ?? []).filter((b) => b._type === 'block').map(toRow));

    const commit = (next: Row[]) => {
        setRows(next);
        onChange(next.map(toBlock));
    };
    const update = (index: number, patch: Partial<Row>) => commit(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    const insertAfter = (index: number) => {
        const next = [...rows];
        const kind = rows[index]?.kind === 'bullet' || rows[index]?.kind === 'number' ? rows[index].kind : 'normal';
        next.splice(index + 1, 0, { key: newKey(), kind, text: '' });
        commit(next);
    };
    const move = (from: number, to: number) => {
        const next = [...rows];
        next.splice(to, 0, next.splice(from, 1)[0]);
        commit(next);
    };

    return (
        <div className="space-y-2">
            <p className="text-xs text-white/40">
                Inline: <code>**bold**</code> <code>*italic*</code> <code>`code`</code> <code>[text](https://…)</code>. Escape with <code>\</code>.
            </p>
            {rows.map((row, index) => (
                <div key={row.key} className="flex gap-2">
                    <select
                        className={`${inputClass} w-32 flex-shrink-0`}
                        value={row.kind}
                        onChange={(e) => update(index, { kind: e.target.value })}
                        aria-label="Block style"
                    >
                        {STYLES.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                    <textarea
                        className={`${inputClass} min-h-[2.5rem] ${row.kind.startsWith('h') ? 'font-semibold' : ''}`}
                        rows={Math.min(8, Math.max(1, Math.ceil(row.text.length / 80)))}
                        value={row.text}
                        onChange={(e) => update(index, { text: e.target.value })}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                e.preventDefault();
                                insertAfter(index);
                            }
                        }}
                    />
                    <div className="flex flex-col gap-1">
                        <button type="button" className="text-white/40 hover:text-white disabled:opacity-20" disabled={index === 0} onClick={() => move(index, index - 1)} aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                        <button type="button" className="text-white/40 hover:text-white disabled:opacity-20" disabled={index === rows.length - 1} onClick={() => move(index, index + 1)} aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
                        <button type="button" className="text-white/40 hover:text-red-400" onClick={() => commit(rows.filter((_, i) => i !== index))} aria-label="Delete block"><Trash2 className="h-4 w-4" /></button>
                    </div>
                </div>
            ))}
            <Button onClick={() => insertAfter(rows.length - 1)}>
                <Plus className="h-4 w-4" /> Add block
            </Button>
            <p className="text-xs text-white/30">Ctrl/⌘ + Enter adds a block below.</p>
        </div>
    );
}
