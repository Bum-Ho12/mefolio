"use client";
import React, { useState, useEffect, useRef } from "react";
import { TagCloudCanvas, Tag } from "react-3d-tag-sphere";

interface SkillsGlobeCanvasProps {
    tags: Tag[];
    languages: string[];
    tools: string[];
    frameworks: string[];
}

const SkillsSection: React.FC<SkillsGlobeCanvasProps> = ({ tags, tools, languages, frameworks }) => {
    const [mounted, setMounted] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 512, height: 400 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);

        const updateDimensions = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth;
                const height = Math.min(window.innerHeight, 400); // Adjust the height dynamically
                setDimensions({ width, height });
            }
        };

        updateDimensions();
        window.addEventListener("resize", updateDimensions);

        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    return (
        <div className="h-full w-full items-center overflow-y-auto max-h-screen scrollbar-hide">
            <section className="flex flex-col lg:flex-row w-full gap-8 p-4 lg:p-8 pt-8 lg:pb-0 h-full items-center">

                {/* Tag Cloud and Table in Scrollable Container */}
                <div className="w-full flex flex-col lg:flex-row gap-8">

                    {/* Tag Cloud */}
                    <div
                        ref={containerRef}
                        className="w-full lg:w-2/3 flex items-center justify-center"
                        style={{ height: mounted ? `${dimensions.height}px` : "400px" }}
                    >
                        {mounted && (
                            <TagCloudCanvas
                                tags={tags}
                                width={dimensions.width}
                                height={dimensions.height}
                            />
                        )}
                    </div>

                    {/* Skills Table Section */}
                    <div className="w-full lg:w-1/3 space-y-8 max-h-screen overflow-y-auto scrollbar-hide overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/10 rounded-3xl" />
                        <table className=" relative min-w-full table-auto text-left">
                            <thead>
                                <tr>
                                    <th className="p-4 border-b text-lg">Languages</th>
                                    <th className="p-4 border-b text-lg">Frameworks</th>
                                    <th className="p-4 border-b text-lg">Tools</th>
                                </tr>
                            </thead>
                            <tbody>
                                {languages.map((language, index) => (
                                    <tr key={index}>
                                        <td className="p-4">{language}</td>
                                        <td className="p-4">{frameworks[index] || ""}</td>
                                        <td className="p-4">{tools[index] || ""}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            </section>
        </div>
    );
};

export default SkillsSection;
