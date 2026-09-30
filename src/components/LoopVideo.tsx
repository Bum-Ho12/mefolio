// components/LoopVideo.tsx
"use client";

import { useEffect, useRef } from "react";

type LoopVideoProps = {
    src: string;
    poster?: string;
    playing: boolean;
    // When false only the poster is shown and no video bytes are fetched.
    load: boolean;
    controls?: boolean;
    className?: string;
};

export default function LoopVideo({ src, poster, playing, load, controls = false, className = "" }: LoopVideoProps) {
    const ref = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const v = ref.current;
        if (!v) return;
        if (playing && load) {
            v.play().catch(() => { });
        } else {
            v.pause();
            v.currentTime = 0;
        }
    }, [playing, load]);

    return (
        <video
            ref={ref}
            className={className}
            poster={poster}
            src={load ? src : undefined}
            controls={controls}
            muted
            loop
            playsInline
            preload={load ? "metadata" : "none"}
        />
    );
}
