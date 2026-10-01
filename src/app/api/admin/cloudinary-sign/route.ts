import { createHash } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { getOwner } from '@/lib/auth/dal';
import { CLOUDINARY_CLOUD_NAME } from '@/utils/cloudinary';

// Signs a one-off direct upload from the browser to Cloudinary. The browser never sees
// the API secret, and the signature pins the folder and expires with its timestamp
// (Cloudinary rejects signatures older than one hour).
export async function POST(request: NextRequest) {
    const owner = await getOwner();
    if (!owner) return new NextResponse(null, { status: 404 });

    const origin = request.headers.get('origin');
    if (!origin || origin !== request.nextUrl.origin) return NextResponse.json({ error: 'Bad origin' }, { status: 403 });

    // Same cloud name the site plays from, so uploads are always playable.
    const cloudName = CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiKey || !apiSecret) return NextResponse.json({ error: 'Cloudinary is not configured' }, { status: 501 });

    const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'mefolio';
    const timestamp = Math.floor(Date.now() / 1000);
    // Parameters must be sorted alphabetically and joined as key=value pairs.
    const signature = createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`).digest('hex');

    console.info('[admin] cloudinary sign', { login: owner.login, folder });
    return NextResponse.json({ cloudName, apiKey, folder, timestamp, signature });
}
