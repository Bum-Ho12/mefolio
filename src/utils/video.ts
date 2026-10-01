import { CLOUDINARY_CLOUD_NAME, posterUrl, videoUrl } from './cloudinary';
import type { VideoItem } from './types';

// Works out how a video can be played from whatever was stored for it. Nothing about
// the provider is stored; it is derived here every time, by the site, the admin and
// validation alike.

export const CLOUDINARY_ID = /^[A-Za-z0-9_\-/]{1,200}$/;

export type VideoSource =
    // A file the <video> element can play directly.
    | { kind: 'cloudinary' | 'file'; src: string; poster?: string }
    // A platform page, played through that platform's embedded player.
    | { kind: 'youtube' | 'vimeo'; embedSrc: string; poster?: string }
    | { kind: 'unsupported'; reason: string };

export type VideoInput = Pick<VideoItem, 'publicId' | 'url' | 'poster'>;

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID = /^\d{6,12}$/;
// Share pages that look like links to a video but serve a web page.
const PAGE_HOSTS = ['drive.google.com', 'docs.google.com', 'dropbox.com', 'www.dropbox.com', 'onedrive.live.com', '1drv.ms', 'photos.google.com', 'photos.app.goo.gl', 'icloud.com', 'www.icloud.com'];

function youtubeId(url: URL): string | null {
    const host = url.hostname.replace(/^(www|m)\./, '');
    let id: string | null = null;
    if (host === 'youtu.be') id = url.pathname.split('/')[1] ?? null;
    else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
        if (url.pathname === '/watch') id = url.searchParams.get('v');
        else id = /^\/(?:embed|shorts|live)\/([^/]+)/.exec(url.pathname)?.[1] ?? null;
    }
    return id && YOUTUBE_ID.test(id) ? id : null;
}

function vimeoId(url: URL): string | null {
    const host = url.hostname.replace(/^www\./, '');
    if (host !== 'vimeo.com' && host !== 'player.vimeo.com') return null;
    const id = /^\/(?:video\/)?(\d+)/.exec(url.pathname)?.[1] ?? null;
    return id && VIMEO_ID.test(id) ? id : null;
}

// A delivery URL from this site's own Cloudinary account can be reduced to its public
// id, so it gets the same per-device optimisation as an uploaded clip.
export function ownCloudinaryId(link: string): string | null {
    let url: URL;
    try {
        url = new URL(link);
    } catch {
        return null;
    }
    if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com') return null;
    const match = new RegExp(`^/${CLOUDINARY_CLOUD_NAME}/video/upload/(.+)$`).exec(url.pathname);
    if (!match) return null;
    // Delivery URLs look like [transformations/][v123/]folder/name.ext. Everything up to
    // the version is dropped; without a version, only leading transformation segments.
    const segments = match[1].split('/');
    const version = segments.findIndex((p) => /^v\d+$/.test(p));
    let parts = version >= 0 ? segments.slice(version + 1) : segments;
    if (version < 0) {
        while (parts.length > 1 && (parts[0].includes(',') || /^(f|q|w|h|c|ac|so|vc|br|e|fl|dpr|g|ar|du|eo)_/.test(parts[0]))) parts = parts.slice(1);
    }
    const id = parts.join('/').replace(/\.[a-z0-9]{2,5}$/i, '');
    return CLOUDINARY_ID.test(id) ? id : null;
}

export function resolveVideo(item: VideoInput, width = 960): VideoSource {
    if (item.publicId) {
        if (!CLOUDINARY_ID.test(item.publicId)) return { kind: 'unsupported', reason: 'Invalid Cloudinary public id' };
        return { kind: 'cloudinary', src: videoUrl(item.publicId, width), poster: posterUrl(item.publicId, width) };
    }
    if (!item.url) return { kind: 'unsupported', reason: 'No video source' };

    let url: URL;
    try {
        url = new URL(item.url);
    } catch {
        return { kind: 'unsupported', reason: 'Not a valid link' };
    }
    if (url.protocol !== 'https:') return { kind: 'unsupported', reason: 'Video links must start with https://' };

    // Embed addresses are always built here from a validated id on a fixed host; the
    // pasted link itself is never placed in an iframe.
    const yt = youtubeId(url);
    if (yt) {
        return {
            kind: 'youtube',
            embedSrc: `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&mute=1&loop=1&playlist=${yt}&controls=0&playsinline=1&rel=0&modestbranding=1`,
            poster: item.poster ?? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
        };
    }
    const vimeo = vimeoId(url);
    if (vimeo) {
        return {
            kind: 'vimeo',
            embedSrc: `https://player.vimeo.com/video/${vimeo}?autoplay=1&muted=1&loop=1&background=1&dnt=1`,
            poster: item.poster,
        };
    }
    if (/(^|\.)youtube\.com$|^youtu\.be$|(^|\.)vimeo\.com$/.test(url.hostname)) {
        return { kind: 'unsupported', reason: 'Could not find a video id in this link' };
    }
    if (PAGE_HOSTS.includes(url.hostname)) {
        return { kind: 'unsupported', reason: 'This is a share page, not a video file. Use a direct .mp4/.webm link.' };
    }
    return { kind: 'file', src: item.url, poster: item.poster };
}

export const isPlayable = (item: VideoInput) => resolveVideo(item).kind !== 'unsupported';
