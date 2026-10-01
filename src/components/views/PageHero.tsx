import Image from 'next/image';

interface PageHeroProps {
    image?: string;
    title?: string;
    subtitle?: string;
    fallbackAlt: string;
}

// Shared hero banner used by the store, about, contact and legal pages.
export default function PageHero({ image, title, subtitle, fallbackAlt }: PageHeroProps) {
    return (
        <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border-b border-white/10 h-[400px]">
            {/* Image Background */}
            <div className="absolute inset-0">
                {image && (
                    <Image
                        src={image}
                        alt={title || fallbackAlt}
                        fill
                        className="object-cover h-96 w-full"
                        priority
                    />
                )}
                <div className="absolute inset-0 bg-black/40"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 flex flex-col justify-center h-full">
                {title !== undefined && <h1 className="text-4xl font-bold text-white">{title}</h1>}
                {subtitle && (
                    <h2 className="text-3xl text-gray-300">{subtitle}</h2>
                )}
            </div>
        </div>
    );
}
