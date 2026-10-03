// Identify uploads by their leading bytes instead of trusting the browser's
// Content-Type or file extension. SVG is absent here because it can carry script;
// fields that opt in check it separately with sniffSvg.
export type Sniffed = { mime: string; ext: string; kind: 'image' | 'file' };

const startsWith = (buf: Uint8Array, bytes: number[], offset = 0) => bytes.every((b, i) => buf[offset + i] === b);
const ascii = (buf: Uint8Array, start: number, end: number) => String.fromCharCode(...buf.subarray(start, end));

export function sniff(buf: Uint8Array): Sniffed | null {
    if (buf.length < 12) return null;
    if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mime: 'image/png', ext: 'png', kind: 'image' };
    if (startsWith(buf, [0xff, 0xd8, 0xff])) return { mime: 'image/jpeg', ext: 'jpg', kind: 'image' };
    if (ascii(buf, 0, 6) === 'GIF87a' || ascii(buf, 0, 6) === 'GIF89a') return { mime: 'image/gif', ext: 'gif', kind: 'image' };
    if (ascii(buf, 0, 4) === 'RIFF' && ascii(buf, 8, 12) === 'WEBP') return { mime: 'image/webp', ext: 'webp', kind: 'image' };
    if (ascii(buf, 4, 8) === 'ftyp' && ['avif', 'avis'].includes(ascii(buf, 8, 12))) return { mime: 'image/avif', ext: 'avif', kind: 'image' };
    if (ascii(buf, 0, 5) === '%PDF-') return { mime: 'application/pdf', ext: 'pdf', kind: 'file' };
    return null;
}

// Anything that can run script, pull in other documents or expand entities.
const UNSAFE_SVG = /<\s*(script|foreignObject|iframe|embed|object|handler|listener)\b|<!ENTITY|\son[a-z]+\s*=|javascript:|data:\s*text\/html/i;

// Accepts an SVG document only if its root element is <svg> and it holds nothing
// executable. Icons are shown through <img>, which never runs script, but the file is
// also served as-is from the CDN, so unsafe content is rejected outright.
export function sniffSvg(buf: Uint8Array): Sniffed | null {
    let text: string;
    try {
        text = new TextDecoder('utf-8', { fatal: true }).decode(buf);
    } catch {
        return null;
    }
    // Skip the BOM, XML declaration, comments and doctype to reach the root element.
    const prolog = /^\uFEFF?(\s|<\?xml[\s\S]*?\?>|<!--[\s\S]*?-->|<!DOCTYPE[^>[]*>)*/i;
    const rest = text.slice(prolog.exec(text)?.[0].length ?? 0);
    if (!/^<svg[\s>]/i.test(rest) || UNSAFE_SVG.test(text)) return null;
    return { mime: 'image/svg+xml', ext: 'svg', kind: 'image' };
}
