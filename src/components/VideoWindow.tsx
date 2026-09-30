// components/VideoWindow.tsx
import LoopVideo from "./LoopVideo";

type VideoWindowProps = {
    title: string;
    src: string;
    poster?: string;
};

export default function VideoWindow({ title, src, poster }: VideoWindowProps) {
    return (
        <div className="rounded-xl overflow-hidden border border-white/10 bg-neutral-900 shadow-2xl">
            <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-3 text-xs text-neutral-400 font-mono">{title}</span>
            </div>
            <LoopVideo src={src} poster={poster} className="w-full block" />
        </div>
    );
}