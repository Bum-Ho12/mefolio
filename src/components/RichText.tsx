import Image from 'next/image';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { TypedObject } from '@portabletext/types';
import { assetUrl, imageInfo } from '@/lib/sanity/config';
import JourneyVideo from '@/components/journeys/JourneyVideo';

// Renders Portable Text with explicit styles for every block, list and mark, plus the
// media blocks from lib/content/blocks.ts. The text sits in a centered column; media
// can break out of it or float beside it according to its `layout`.

type ImageValue = { asset?: { _ref?: string } } | undefined;
const refOf = (image: ImageValue) => image?.asset?._ref;
const text = (v: unknown) => (typeof v === 'string' ? v : '');

// Floats collapse to the column width on phones. Everything else clears earlier floats.
const LAYOUT: Record<string, string> = {
    inline: 'clear-both my-8',
    wide: 'clear-both my-10 lg:-mx-24',
    full: 'clear-both my-12 relative left-1/2 w-screen -translate-x-1/2',
    left: 'my-6 md:float-left md:clear-left md:mb-4 md:mr-8 md:mt-1.5 md:w-[46%]',
    right: 'my-6 md:float-right md:clear-right md:mb-4 md:ml-8 md:mt-1.5 md:w-[46%]',
};
const SIZES: Record<string, string> = {
    inline: '(max-width: 768px) 100vw, 768px',
    wide: '(max-width: 1024px) 100vw, 960px',
    full: '100vw',
    left: '(max-width: 768px) 100vw, 360px',
    right: '(max-width: 768px) 100vw, 360px',
};

const layoutOf = (value: { layout?: unknown }) => (typeof value.layout === 'string' && value.layout in LAYOUT ? value.layout : 'inline');
const rounded = (layout: string) => (layout === 'full' ? '' : 'rounded-xl');

function Figure({ layout, caption, children }: { layout: string; caption: unknown; children: React.ReactNode }) {
    return (
        <figure className={LAYOUT[layout]}>
            {children}
            {text(caption) && <figcaption className={`mt-2 text-center text-sm text-gray-400 ${layout === 'full' ? 'px-4' : ''}`}>{text(caption)}</figcaption>}
        </figure>
    );
}

/* eslint-disable @typescript-eslint/no-explicit-any -- block values are schema-driven JSON */

function ImageBlock({ value }: { value: any }) {
    const info = imageInfo(refOf(value.image));
    if (!info) return null;
    const layout = layoutOf(value);
    return (
        <Figure layout={layout} caption={value.caption}>
            <Image src={info.url} alt={text(value.alt)} width={info.width} height={info.height} sizes={SIZES[layout]} className={`h-auto w-full ${rounded(layout)}`} />
        </Figure>
    );
}

function VideoBlock({ value }: { value: any }) {
    if (!value.publicId && !value.url) return null;
    const layout = layoutOf(value);
    return (
        <Figure layout={layout} caption={value.caption}>
            <JourneyVideo
                video={{ publicId: value.publicId, url: value.url, poster: assetUrl(refOf(value.poster)) }}
                playback={value.playback}
                aspect={value.aspect}
                large={layout === 'wide' || layout === 'full'}
                title={text(value.caption) || 'Video'}
                className={rounded(layout)}
            />
        </Figure>
    );
}

function GalleryBlock({ value }: { value: any }) {
    const images = (Array.isArray(value.images) ? value.images : []).map((image: ImageValue) => imageInfo(refOf(image))).filter(Boolean) as NonNullable<ReturnType<typeof imageInfo>>[];
    if (!images.length) return null;
    // Floating a gallery is not offered; anything unexpected falls back to the column.
    const layout = ['wide', 'full'].includes(value.layout) ? (value.layout as string) : 'inline';
    const three = value.columns === '3';
    return (
        <Figure layout={layout} caption={value.caption}>
            <div className={`grid grid-cols-2 gap-2 sm:gap-3 ${three ? 'md:grid-cols-3' : ''} ${layout === 'full' ? 'px-2 sm:px-3' : ''}`}>
                {images.map((image, index) => (
                    <div key={index} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-white/5">
                        <Image
                            src={image.url}
                            alt={images.length > 1 ? `${text(value.alt)} (${index + 1} of ${images.length})` : text(value.alt)}
                            fill
                            sizes={three ? '(max-width: 768px) 50vw, 33vw' : '50vw'}
                            className="object-cover"
                        />
                    </div>
                ))}
            </div>
        </Figure>
    );
}

const heading = 'clear-both font-bold text-white';

const components: PortableTextComponents = {
    block: {
        normal: ({ children }) => <p className="my-5 leading-relaxed text-gray-200">{children}</p>,
        h1: ({ children }) => <h2 className={`${heading} mb-4 mt-12 text-3xl`}>{children}</h2>,
        h2: ({ children }) => <h2 className={`${heading} mb-4 mt-10 text-2xl`}>{children}</h2>,
        h3: ({ children }) => <h3 className={`${heading} mb-3 mt-8 text-xl`}>{children}</h3>,
        h4: ({ children }) => <h4 className={`${heading} mb-2 mt-6 text-lg`}>{children}</h4>,
        blockquote: ({ children }) => <blockquote className="my-6 border-l-4 border-[#FFD3AC] pl-5 text-lg italic text-gray-300">{children}</blockquote>,
    },
    list: {
        bullet: ({ children }) => <ul className="my-5 list-disc space-y-2 pl-6 text-gray-200 marker:text-gray-500">{children}</ul>,
        number: ({ children }) => <ol className="my-5 list-decimal space-y-2 pl-6 text-gray-200 marker:text-gray-500">{children}</ol>,
    },
    listItem: ({ children }) => <li className="leading-relaxed">{children}</li>,
    marks: {
        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
        em: ({ children }) => <em>{children}</em>,
        underline: ({ children }) => <span className="underline underline-offset-4">{children}</span>,
        'strike-through': ({ children }) => <s>{children}</s>,
        code: ({ children }) => <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.9em]">{children}</code>,
        link: ({ value, children }) => {
            const href = text(value?.href);
            const external = /^https?:/i.test(href);
            return (
                <a href={href} className="text-blue-300 underline underline-offset-4 hover:text-blue-200" {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                    {children}
                </a>
            );
        },
    },
    types: { imageBlock: ImageBlock, videoBlock: VideoBlock, galleryBlock: GalleryBlock },
    // Block types this site does not know are skipped rather than printed as a warning.
    unknownType: () => null,
};

export default function RichText({ value, className = '' }: { value: unknown; className?: string }) {
    if (!Array.isArray(value)) return null;
    const blocks = value.filter((item): item is TypedObject => typeof item === 'object' && item !== null && '_type' in item);
    // flow-root contains floated media so it cannot spill into whatever follows.
    return (
        <div className={`flow-root ${className}`}>
            <PortableText value={blocks} components={components} onMissingComponent={false} />
        </div>
    );
}
