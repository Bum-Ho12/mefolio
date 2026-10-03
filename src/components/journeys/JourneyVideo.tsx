'use client';

import { useRef, useSyncExternalStore } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import LoopVideo from '@/components/LoopVideo';
import { resolveVideo, type VideoInput } from '@/utils/video';

const ASPECTS: Record<string, string> = {
    '16:9': 'aspect-video',
    '9:16': 'aspect-[9/16]',
    '1:1': 'aspect-square',
    '4:5': 'aspect-[4/5]',
};

const MOBILE_QUERY = '(max-width: 767px)';

function subscribeMobile(callback: () => void) {
    const mql = window.matchMedia(MOBILE_QUERY);
    mql.addEventListener('change', callback);
    return () => mql.removeEventListener('change', callback);
}

interface JourneyVideoProps {
    video: VideoInput;
    // 'loop' plays muted while on screen; 'player' waits for the visitor and keeps sound.
    playback?: string;
    aspect?: string;
    // Full-bleed and wide layouts get a larger rendition.
    large?: boolean;
    title?: string;
    className?: string;
}

// One video inside a journey's body. Unlike the home strip, each clip decides for
// itself when to play: only while it is on screen.
export default function JourneyVideo({ video, playback, aspect, large = false, title = 'Video', className = '' }: JourneyVideoProps) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { amount: 0.4 });
    // Once it has been near the viewport the clip stays loaded, so scrolling back is instant.
    const seen = useInView(ref, { once: true, margin: '300px 0px' });
    const reduceMotion = useReducedMotion();
    const isMobile = useSyncExternalStore(subscribeMobile, () => window.matchMedia(MOBILE_QUERY).matches, () => false);

    const player = playback === 'player';
    const source = resolveVideo(video, isMobile ? 640 : large ? 1600 : 960, { player });
    // Portrait clips would be taller than the screen at full column width.
    const portrait = aspect === '9:16' || aspect === '4:5';
    const frame = `${ASPECTS[aspect ?? ''] ?? ASPECTS['16:9']} w-full ${portrait ? 'mx-auto max-w-sm' : ''} overflow-hidden bg-black ${className}`;
    const fill = 'h-full w-full object-cover block';

    let content;
    if (source.kind === 'cloudinary' || source.kind === 'file') {
        content = player ? (
            <video src={seen ? source.src : undefined} poster={source.poster} className={fill} controls playsInline preload={seen ? 'metadata' : 'none'} />
        ) : (
            // With reduced motion nothing autoplays; the visitor gets controls instead.
            <LoopVideo src={source.src} poster={source.poster} playing={inView && !reduceMotion} load={seen} controls={!!reduceMotion} className={fill} />
        );
    } else if (source.kind === 'youtube' || source.kind === 'vimeo') {
        // A looping embed is mounted only while on screen, which also stops it playing.
        const mounted = player ? seen : inView && !reduceMotion;
        content = mounted ? (
            <iframe
                src={source.embedSrc}
                title={title}
                className={`${fill} border-0 ${player ? '' : 'pointer-events-none'}`}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                referrerPolicy="strict-origin-when-cross-origin"
                loading="lazy"
            />
        ) : (
            <div className={`${fill} bg-cover bg-center`} style={source.poster ? { backgroundImage: `url(${JSON.stringify(source.poster)})` } : undefined} />
        );
    } else {
        content = <div className={`${fill} flex items-center justify-center text-sm text-neutral-500`}>Video unavailable</div>;
    }

    return <div ref={ref} className={frame}>{content}</div>;
}
