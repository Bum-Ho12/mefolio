// Public Sanity project coordinates. Safe to import from client and server code.
export const sanityConfig = {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-07',
};

const CDN = 'https://cdn.sanity.io';

// Asset ids encode everything needed to build a CDN URL:
//   image-<hash>-<w>x<h>-<ext>  ->  /images/<project>/<dataset>/<hash>-<w>x<h>.<ext>
//   file-<hash>-<ext>           ->  /files/<project>/<dataset>/<hash>.<ext>
export function assetUrl(ref: string | undefined | null): string | undefined {
    if (!ref) return undefined;
    const { projectId, dataset } = sanityConfig;
    const image = /^image-([a-f0-9]+-\d+x\d+)-([a-z0-9]+)$/.exec(ref);
    if (image) return `${CDN}/images/${projectId}/${dataset}/${image[1]}.${image[2]}`;
    const file = /^file-([a-f0-9]+)-([a-z0-9]+)$/.exec(ref);
    if (file) return `${CDN}/files/${projectId}/${dataset}/${file[1]}.${file[2]}`;
    return undefined;
}
