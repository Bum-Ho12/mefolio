'use client';

const MAX_UPLOAD = 4 * 1024 * 1024;
const TARGET = 3.5 * 1024 * 1024;
const MAX_DIMENSION = 3000;

export type Progress = (fraction: number) => void;

function xhrPost<T>(url: string, body: FormData, onProgress?: Progress): Promise<T> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.responseType = 'json';
        xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response as T);
            else reject(new Error((xhr.response as { error?: string } | null)?.error ?? `Upload failed (${xhr.status})`));
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(body);
    });
}

// Large photos are re-encoded in the browser so they fit the server's 4 MB limit.
async function shrinkImage(file: File): Promise<File> {
    if (file.size <= TARGET || file.type === 'image/gif') return file;
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    for (const quality of [0.9, 0.8, 0.7, 0.6]) {
        const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', quality));
        if (blob && blob.size <= TARGET) return new File([blob], 'image.webp', { type: 'image/webp' });
    }
    throw new Error('Image is too large even after compression');
}

export async function uploadAsset(file: File, kind: 'image' | 'file', onProgress?: Progress) {
    const prepared = kind === 'image' ? await shrinkImage(file) : file;
    if (prepared.size > MAX_UPLOAD) throw new Error('File too large (max 4 MB)');
    const body = new FormData();
    body.set('kind', kind);
    body.set('file', prepared);
    return xhrPost<{ ref: string; url: string }>('/api/admin/upload', body, onProgress);
}

export async function uploadVideo(file: File, onProgress?: Progress) {
    const signRes = await fetch('/api/admin/cloudinary-sign', { method: 'POST' });
    const sign = (await signRes.json()) as { cloudName: string; apiKey: string; folder: string; timestamp: number; signature: string; error?: string };
    if (!signRes.ok) throw new Error(sign.error ?? 'Could not sign upload');

    const body = new FormData();
    body.set('file', file);
    body.set('api_key', sign.apiKey);
    body.set('timestamp', String(sign.timestamp));
    body.set('folder', sign.folder);
    body.set('signature', sign.signature);
    const result = await xhrPost<{ public_id: string }>(`https://api.cloudinary.com/v1_1/${sign.cloudName}/video/upload`, body, onProgress);
    return result.public_id;
}
