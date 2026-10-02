// One cloud name for playback and for admin uploads, so the two cannot drift apart.
export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "din1gp1kc";

const VIDEO_BASE = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload`;

// f_auto picks AV1/VP9/H.264 per browser, q_auto:eco compresses aggressively,
// c_limit caps resolution without upscaling, ac_none strips the audio track of clips
// that only ever play muted.
export function videoUrl(publicId: string, width = 960, audio = false): string {
    return `${VIDEO_BASE}/f_auto:video,q_auto:eco,w_${width},c_limit${audio ? '' : ',ac_none'}/${publicId}`;
}

// Cloudinary generates a still from the first frame when the extension is an image type.
export function posterUrl(publicId: string, width = 960): string {
    return `${VIDEO_BASE}/so_0,f_auto,q_auto,w_${width},c_limit/${publicId}.jpg`;
}
