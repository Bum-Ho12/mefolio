import { NextResponse, type NextRequest } from 'next/server';
import { getOwner } from '@/lib/auth/dal';
import { writeClient } from '@/lib/sanity/write';
import { sniff, sniffSvg } from '@/lib/content/sniff';

// Vercel rejects request bodies over ~4.5 MB before they reach the function; the
// editor downsizes large photos in the browser to stay under this.
const MAX_BYTES = 4 * 1024 * 1024;

const notFound = () => new NextResponse(null, { status: 404 });
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(request: NextRequest) {
    const owner = await getOwner();
    if (!owner) return notFound();

    // SameSite=Lax already keeps the cookie off cross-site POSTs; this is a second check.
    const origin = request.headers.get('origin');
    if (!origin || origin !== request.nextUrl.origin) return bad('Bad origin', 403);

    const length = Number(request.headers.get('content-length') ?? 0);
    if (!length || length > MAX_BYTES + 64 * 1024) return bad('File too large (max 4 MB)', 413);

    let form: FormData;
    try {
        form = await request.formData();
    } catch {
        return bad('Expected multipart form data');
    }
    const upload = form.get('file');
    const expected = form.get('kind');
    if (!(upload instanceof File) || (expected !== 'image' && expected !== 'file')) return bad('Missing file');
    if (upload.size > MAX_BYTES) return bad('File too large (max 4 MB)', 413);

    const buffer = Buffer.from(await upload.arrayBuffer());
    // SVG is only offered by fields that opt in (skill icons); validation on save still
    // rejects an SVG reference anywhere else.
    const allowSvg = expected === 'image' && form.get('svg') === '1';
    const type = sniff(buffer) ?? (allowSvg ? sniffSvg(buffer) : null);
    if (!type) {
        return bad(allowSvg
            ? 'Unsupported file type. Use PNG, JPEG, WebP, AVIF, GIF, or an SVG without scripts or event handlers.'
            : 'Unsupported file type. Images: PNG, JPEG, WebP, AVIF, GIF. Files: PDF.');
    }
    if (type.kind !== expected) return bad(expected === 'image' ? 'Not an image' : 'Only PDF files are accepted');

    try {
        // The original filename is dropped; it never reaches Sanity or the public CDN.
        const asset = await writeClient().assets.upload(type.kind, buffer, {
            filename: `upload.${type.ext}`,
            contentType: type.mime,
        });
        console.info('[admin] upload', { login: owner.login, asset: asset._id, bytes: buffer.length });
        return NextResponse.json({ ref: asset._id, url: asset.url });
    } catch (error) {
        console.error('[admin] upload failed', error);
        return bad('Upload failed', 502);
    }
}
