// src/components/VideoSection.tsx
'use client';

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
    motion,
    useInView,
    useMotionValue,
    useMotionValueEvent,
    useReducedMotion,
    useScroll,
    useTransform,
} from 'framer-motion';
import VideoCard from './VideoCard';
import { ScrollContainerContext } from './ScrollContainerContext';
import { Videos } from '@/utils/types';
import { MOBILE_QUERY, useMediaQuery, usePageVisible } from '@/utils/hooks';

interface VideoSectionProps {
    videos: Videos;
}

// Must match the card width in VideoCard so the first/last card can sit centered.
const CARD_WIDTH = 'min(72vw, 720px)';

// Smaller renditions on phones; the card never renders wider than ~72vw there.
function useVideoWidth() {
    const isMobile = useMediaQuery(MOBILE_QUERY);
    return isMobile ? 640 : 960;
}

function SectionHeading({ title }: { title: string }) {
    return <h2 className="text-4xl font-bold max-w-6xl w-full mx-auto px-4">{title}</h2>;
}

// Vertical scroll drives a horizontal strip: the section is N screens tall,
// its inner panel is pinned, and scroll progress translates the strip.
function PinnedVideoStrip({ videos }: VideoSectionProps) {
    const items = videos.videos;
    const total = items.length;

    const scrollerRef = useContext(ScrollContainerContext)!;
    const sectionRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    const [activeIndex, setActiveIndex] = useState(0);
    // Negative margin: when the next section snaps flush against this one's bottom,
    // edge-adjacent counts as intersecting and the last video would keep playing.
    const inView = useInView(sectionRef, { root: scrollerRef, margin: '-1px 0px -1px 0px' });
    const pageVisible = usePageVisible();
    const videoWidth = useVideoWidth();

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        container: scrollerRef,
        offset: ['start start', 'end end'],
        // Container ref lives in ClientLayout (a parent), which React attaches
        // only after child layout effects run, so subscribe in a passive effect.
        layoutEffect: false,
    });

    // Distance between neighbouring cards (card width + gap), measured so it follows resizes.
    const step = useMotionValue(0);
    const x = useTransform([scrollYProgress, step], ([p, s]: number[]) => -p * (total - 1) * s);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        const measure = () => {
            const [first, second] = Array.from(track.children) as HTMLElement[];
            if (first && second) step.set(second.offsetLeft - first.offsetLeft);
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(track);
        return () => ro.disconnect();
    }, [step]);

    useMotionValueEvent(scrollYProgress, 'change', (p) => {
        setActiveIndex(Math.round(p * (total - 1)));
    });

    const scrollToIndex = useCallback((index: number) => {
        const scroller = scrollerRef.current;
        const section = sectionRef.current;
        if (!scroller || !section) return;
        scroller.scrollTo({ top: section.offsetTop + index * scroller.clientHeight, behavior: 'smooth' });
    }, [scrollerRef]);

    return (
        <div ref={sectionRef} className="relative w-full" style={{ height: `${total * 100}vh` }}>
            {/* One snap stop per video so each scroll step lands a card in the center */}
            {items.map((item, i) => (
                <div
                    key={`snap-${item._key ?? item.publicId ?? item.url}-${i}`}
                    aria-hidden
                    className="absolute left-0 w-full h-screen snap-start snap-always pointer-events-none"
                    style={{ top: `${i * 100}vh` }}
                />
            ))}

            <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center gap-8 pt-16">
                <SectionHeading title={videos.title} />

                <motion.div
                    ref={trackRef}
                    style={{ x, paddingInline: `calc((100% - ${CARD_WIDTH}) / 2)` }}
                    className="flex w-full gap-8 items-center"
                >
                    {items.map((item, i) => (
                        <VideoCard
                            key={`${item._key ?? item.publicId ?? item.url}-${i}`}
                            item={item}
                            index={i}
                            total={total}
                            progress={scrollYProgress}
                            emphasize
                            isActive={i === activeIndex}
                            playing={i === activeIndex && inView && pageVisible}
                            shouldLoad={inView && Math.abs(i - activeIndex) <= 1}
                            videoWidth={videoWidth}
                            onSelect={scrollToIndex}
                        />
                    ))}
                </motion.div>

                <div className="flex justify-center gap-2" aria-hidden>
                    {items.map((item, i) => (
                        <span
                            key={`dot-${item._key ?? item.publicId ?? item.url}-${i}`}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Used for reduced motion or a single video: a plain swipeable row, no scroll hijacking.
function StaticVideoRow({ videos, autoPlay }: VideoSectionProps & { autoPlay: boolean }) {
    const rowRef = useRef<HTMLDivElement>(null);
    const fallbackRef = useRef<HTMLDivElement>(null);
    const scrollerRef = useContext(ScrollContainerContext) ?? fallbackRef;
    const inView = useInView(rowRef, { root: scrollerRef, amount: 0.5 });
    const pageVisible = usePageVisible();
    const videoWidth = useVideoWidth();
    const progress = useMotionValue(0);
    const items = videos.videos;

    return (
        <div ref={rowRef} className="h-screen w-full flex flex-col justify-center gap-8 pt-16">
            <SectionHeading title={videos.title} />
            <div className="flex gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 justify-start md:justify-center">
                {items.map((item, i) => (
                    <div key={`${item._key ?? item.publicId ?? item.url}-${i}`} className="snap-center">
                        <VideoCard
                            item={item}
                            index={i}
                            total={items.length}
                            progress={progress}
                            isActive={i === 0}
                            playing={autoPlay && i === 0 && inView && pageVisible}
                            shouldLoad={autoPlay ? inView : true}
                            controls={!autoPlay}
                            videoWidth={videoWidth}
                            onSelect={() => { }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function VideoSection({ videos }: VideoSectionProps) {
    const reduceMotion = useReducedMotion();
    const scrollerRef = useContext(ScrollContainerContext);

    if (videos.videos.length === 0) return null;
    if (reduceMotion || videos.videos.length < 2) {
        return <StaticVideoRow videos={videos} autoPlay={!reduceMotion} />;
    }
    // The strip's scroll tracking needs the container; reserve its height until it mounts.
    if (!scrollerRef) return <div style={{ height: `${videos.videos.length * 100}vh` }} />;
    return <PinnedVideoStrip videos={videos} />;
}
