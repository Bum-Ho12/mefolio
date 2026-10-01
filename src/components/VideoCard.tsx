// components/VideoCard.tsx
"use client";

import { forwardRef } from "react";
import { motion, MotionValue, useTransform } from "framer-motion";
import LoopVideo from "./LoopVideo";
import { VideoItem } from "@/utils/types";
import { posterUrl, videoUrl } from "@/utils/cloudinary";

type VideoCardProps = {
    item: VideoItem;
    index: number;
    total: number;
    progress: MotionValue<number>;
    // Scale/fade cards by distance from the center (pinned strip only).
    emphasize?: boolean;
    isActive: boolean;
    playing: boolean;
    shouldLoad: boolean;
    controls?: boolean;
    videoWidth: number;
    onSelect: (index: number) => void;
};

const VideoCard = forwardRef<HTMLDivElement, VideoCardProps>(function VideoCard(
    { item, index, total, progress, emphasize = false, isActive, playing, shouldLoad, controls = false, videoWidth, onSelect },
    ref
) {
    // Peak at this card's own position on the progress line, fade toward neighbours.
    const span = Math.max(total - 1, 1);
    const center = index / span;
    const range = [center - 1 / span, center, center + 1 / span];
    const scale = useTransform(progress, range, [0.85, 1, 0.85]);
    const opacity = useTransform(progress, range, [0.5, 1, 0.5]);

    return (
        <motion.div
            ref={ref}
            style={emphasize ? { scale, opacity } : undefined}
            tabIndex={0}
            role="button"
            aria-label={`Play ${item.title}`}
            aria-current={isActive}
            onClick={() => onSelect(index)}
            onFocus={() => onSelect(index)}
            className="shrink-0 w-[min(72vw,720px)] rounded-xl overflow-hidden border border-white/10 bg-neutral-900 shadow-2xl cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#FFD3AC]"
        >
            <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-3 text-xs text-neutral-400 font-mono truncate">{item.title}</span>
            </div>
            <LoopVideo
                src={videoUrl(item.publicId, videoWidth)}
                poster={posterUrl(item.publicId, videoWidth)}
                playing={playing}
                load={shouldLoad}
                controls={controls}
                className="w-full aspect-video object-cover block bg-black"
            />
            {item.description && (
                <p className="px-4 py-3 text-sm text-gray-300">{item.description}</p>
            )}
        </motion.div>
    );
});

export default VideoCard;
