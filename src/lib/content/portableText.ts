// Converts between Portable Text blocks and a small inline markup the editor shows
// per paragraph: **bold**, *italic*, `code`, [link text](https://…). A backslash
// escapes any of * ` [ ] \ so literal characters survive the round trip.

export interface Span { _type: 'span'; _key: string; text: string; marks: string[] }
export interface LinkDef { _type: 'link'; _key: string; href: string }
export interface Block {
    _type: 'block';
    _key: string;
    style: string;
    listItem?: 'bullet' | 'number';
    level?: number;
    markDefs: LinkDef[];
    children: Span[];
}

const DECORATOR_TOKENS: [string, string][] = [['**', 'strong'], ['*', 'em'], ['`', 'code']];
const TOKEN_FOR: Record<string, string> = { strong: '**', em: '*', code: '`' };
const ESCAPABLE = /[*`[\]\\]/g;

const escape = (text: string) => text.replace(ESCAPABLE, (c) => `\\${c}`);

export function blockToMarkup(block: Partial<Block>): string {
    const links = new Map((block.markDefs ?? []).map((d) => [d._key, d.href]));
    const children = block.children ?? [];
    let out = '';
    let open: string[] = [];

    const setDecorators = (wanted: string[]) => {
        // Close in reverse order, then open what is missing.
        for (const mark of [...open].reverse()) if (!wanted.includes(mark)) out += TOKEN_FOR[mark];
        open = open.filter((m) => wanted.includes(m));
        for (const mark of wanted) if (!open.includes(mark)) { out += TOKEN_FOR[mark]; open.push(mark); }
    };

    for (let i = 0; i < children.length; i++) {
        const span = children[i];
        const marks = span.marks ?? [];
        const decorators = marks.filter((m) => m in TOKEN_FOR);
        const link = marks.find((m) => links.has(m));
        setDecorators(decorators);
        if (link) {
            // Merge consecutive spans that share the link into one [text](href).
            let text = escape(span.text ?? '');
            while (i + 1 < children.length && (children[i + 1].marks ?? []).includes(link)) text += escape(children[++i].text ?? '');
            out += `[${text}](${links.get(link)})`;
        } else {
            out += escape(span.text ?? '');
        }
    }
    setDecorators([]);
    return out;
}

export function markupToBlock(markup: string, base: { _key: string; style: string; listItem?: 'bullet' | 'number'; level?: number }): Block {
    const spans: { text: string; marks: string[] }[] = [];
    const markDefs: LinkDef[] = [];
    const active = new Set<string>();
    let buffer = '';

    const flush = (extra: string[] = []) => {
        if (buffer) spans.push({ text: buffer, marks: [...active, ...extra] });
        buffer = '';
    };

    let i = 0;
    outer: while (i < markup.length) {
        const ch = markup[i];
        if (ch === '\\' && i + 1 < markup.length) {
            buffer += markup[i + 1];
            i += 2;
            continue;
        }
        if (ch === '[') {
            const match = /^\[((?:\\.|[^\]\\])*)\]\(([^()\s]+)\)/.exec(markup.slice(i));
            if (match) {
                flush();
                const key = `${base._key}l${markDefs.length}`;
                markDefs.push({ _type: 'link', _key: key, href: match[2] });
                buffer = match[1].replace(/\\(.)/g, '$1');
                flush([key]);
                i += match[0].length;
                continue;
            }
        }
        for (const [token, mark] of DECORATOR_TOKENS) {
            if (markup.startsWith(token, i)) {
                flush();
                if (active.has(mark)) active.delete(mark);
                else active.add(mark);
                i += token.length;
                continue outer;
            }
        }
        buffer += ch;
        i += 1;
    }
    flush();

    // Merge neighbours with identical marks and give every span a stable key.
    const merged: { text: string; marks: string[] }[] = [];
    for (const span of spans) {
        const prev = merged[merged.length - 1];
        if (prev && prev.marks.join() === span.marks.join()) prev.text += span.text;
        else merged.push({ ...span });
    }
    if (!merged.length) merged.push({ text: '', marks: [] });

    return {
        _type: 'block',
        _key: base._key,
        style: base.style,
        ...(base.listItem ? { listItem: base.listItem, level: base.level ?? 1 } : {}),
        markDefs,
        children: merged.map((s, idx) => ({ _type: 'span', _key: `${base._key}s${idx}`, text: s.text, marks: s.marks })),
    };
}
