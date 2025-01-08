"use client";
import { Skills } from "@/utils/types";
import React, { useState, useEffect, useRef } from "react";
import { TagCloudCanvas, Tag } from "react-3d-tag-sphere";
import { ChevronDown } from "lucide-react";

interface SkillsSectionProps {
    skills: Skills;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ skills }) => {
    const [mounted, setMounted] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 512, height: 400 });
    const containerRef = useRef<HTMLDivElement>(null);
    const [showScrollIndicator, setShowScrollIndicator] = useState(false);

    const tags: Tag[] = React.useMemo(() => {
        const allSkills = [
            ...skills.languages,
            ...skills.frameworks,
            ...skills.tools
        ];

        return allSkills
            .filter(skill => skill.icon && skill.icon && skill.icon.url)
            .map(skill => ({
                src: skill.icon?.url || "",
                size: 40,
                phi: Math.random() * 360,
                theta: Math.random() * 360,
            }));
    }, [skills]);

    useEffect(() => {
        setMounted(true);
        const updateDimensions = () => {
            if (containerRef.current) {
                const width = Math.min(containerRef.current.offsetWidth, 800);
                const height = Math.min(window.innerHeight, 600);
                setDimensions({ width, height });
            }
        };

        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    // Handle scroll indicator visibility
    const handleTableScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        const isAtBottom = target.scrollHeight - target.scrollTop === target.clientHeight;
        setShowScrollIndicator(!isAtBottom);
    };

    return (
        <div className="h-full w-full items-center overflow-y-auto max-h-screen scrollbar-hide">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <section className="flex flex-col lg:flex-row w-full gap-8 px-4 lg:px-8 py-24 h-full items-center">
                    <div className="w-full flex flex-col lg:flex-row gap-8">
                        <div
                            ref={containerRef}
                            className="w-full lg:w-2/3 flex items-center justify-center"
                            style={{ height: mounted ? `${dimensions.height}px` : "400px" }}
                        >
                            {mounted && tags.length > 0 && (
                                <TagCloudCanvas
                                    tags={tags}
                                    width={dimensions.width}
                                    height={dimensions.height}
                                />
                            )}
                        </div>

                        <div className="w-full lg:w-1/3 relative rounded-3xl lg:h-[450px]">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/10 rounded-3xl" />

                            {/* Table Container with dynamic height matching TagCloudCanvas */}
                            <div
                                className="relative h-full  lg:h-[440px]"
                                // style={{ height: mounted && dimensions.width>=1024 ? `400px`: mounted ? `${dimensions.height}px` : "400px" }}
                            >
                                {/* Scroll Container */}
                                <div
                                    className="h-full overflow-y-auto scrollbar-hide "
                                    onScroll={handleTableScroll}
                                >
                                    <div className="pb-4">
                                        <div className="grid grid-cols-3 gap-0">
                                            <div>
                                                <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-white text-black p-2 rounded-ss-[1.3rem]">Languages</h3>
                                                <div className="space-y-2 pl-2">
                                                    {skills.languages.map((lang, idx) => (
                                                        <div key={idx} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                                            {lang.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-white text-black py-2 px-1">Frameworks</h3>
                                                <div className="space-y-2">
                                                    {skills.frameworks.map((framework, idx) => (
                                                        <div key={idx} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                                            {framework.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold mb-4 sticky text-black top-0 bg-white rounded-se-3xl p-2">Tools</h3>
                                                <div className="space-y-2 pr-2">
                                                    {skills.tools.map((tool, idx) => (
                                                        <div key={idx} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                                            {tool.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Scroll Indicator */}
                                {showScrollIndicator && (
                                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white/50 animate-bounce hidden lg:block">
                                        <ChevronDown size={20} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SkillsSection;