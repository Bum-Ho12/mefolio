// components/LoopVideo.tsx
import { useEffect, useRef } from "react";

type LoopVideoProps = {
    src: string;
    poster?: string;
    className?: string;
};

export default function LoopVideo({ src, poster, className = "" }: LoopVideoProps) {
    const ref = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const v = ref.current;
        if (!v) return;
        const io = new IntersectionObserver(
            ([entry]) => (entry.isIntersecting ? v.play().catch(() => { }) : v.pause()),
            { threshold: 0.25 }
        );
        io.observe(v);
        return () => io.disconnect();
    }, []);

    return (
        <video
            ref={ref}
            className={className}
            poster={poster}
            muted
            loop
            playsInline
            preload="metadata"
        >
            <source src={src.replace(".mp4", ".webm")} type="video/webm" />
            <source src={src} type="video/mp4" />
        </video>
    );
}