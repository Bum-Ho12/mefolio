"use client";
import { Skill, Skills } from "@/utils/types";
import React, { useState, useEffect, useRef, useMemo, useCallback, useContext } from "react";
import { TagCloudCanvas, Tag } from "react-3d-tag-sphere";
import { useInView } from "framer-motion";
import { buildShowcase } from "@/utils/sections";
import { LARGE_QUERY, useMediaQuery, usePageVisible } from "@/utils/hooks";
import { ScrollContainerContext } from "./ScrollContainerContext";
import SkillMarquee, { SkillRow } from "./skills/SkillMarquee";
import FrameworkShowcase from "./skills/FrameworkShowcase";

interface SkillsSectionProps {
    skills: Skills;
}

// Vertical padding of the section (py-24) and the gap between the sphere and the rows.
const SECTION_PADDING = 192;
const ROWS_GAP = 16;
const SPHERE_MAX = 520;
const SPHERE_MIN = 260;

const SkillsSection: React.FC<SkillsSectionProps> = ({ skills }) => {
    // The sphere animates a canvas and loads every icon, so phones never mount it.
    const isLarge = useMediaQuery(LARGE_QUERY);
    const [dimensions, setDimensions] = useState({ width: 512, height: 400 });
    const containerRef = useRef<HTMLDivElement>(null);
    const rowsRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLDivElement>(null);
    const fallbackRef = useRef<HTMLDivElement>(null);
    const scrollerRef = useContext(ScrollContainerContext) ?? fallbackRef;
    const inView = useInView(sectionRef, { root: scrollerRef, amount: 0.5 });
    const seen = useInView(sectionRef, { root: scrollerRef, amount: 0.5, once: true });
    const pageVisible = usePageVisible();

    const rows: SkillRow[] = useMemo(() => (
        [
            { label: "Languages", skills: skills.languages },
            { label: "Frameworks", skills: skills.frameworks },
            { label: "Tools", skills: skills.tools },
        ].filter((row) => row.skills.length > 0)
    ), [skills]);

    const tags: Tag[] = useMemo(() => {
        const allSkills = [
            ...skills.languages,
            ...skills.frameworks,
            ...skills.tools
        ];

        return allSkills
            .filter(skill => skill.icon && skill.icon.url)
            .map((skill, index) => ({
                src: skill.icon?.url || "",
                size: 40,
                phi: (index * 47) % 360,
                theta: (index * 31) % 360,
            }));
    }, [skills]);

    const slides = useMemo(() => buildShowcase(skills), [skills]);
    const [slideIndex, setSlideIndex] = useState(0);
    // Edits in the admin preview can remove slides.
    const current = slideIndex < slides.length ? slideIndex : 0;
    const slide = slides[current];
    const highlighted = useMemo(
        () => new Set<Skill>(slide ? [...slide.stack.languages, ...slide.stack.frameworks, ...slide.stack.tools] : []),
        [slide],
    );
    const selectable = useMemo(() => new Set(slides.map((s) => s.framework)), [slides]);
    const selectFramework = useCallback((skill: Skill) => {
        const first = slides.findIndex((s) => s.framework === skill);
        if (first !== -1) setSlideIndex(first);
    }, [slides]);

    useEffect(() => {
        if (!isLarge) return;
        const updateDimensions = () => {
            if (containerRef.current) {
                const width = Math.min(containerRef.current.offsetWidth, 800);
                // The rows sit under the sphere, inside the same screen.
                const rowsHeight = (rowsRef.current?.offsetHeight ?? 0) + ROWS_GAP;
                const height = Math.max(SPHERE_MIN, Math.min(window.innerHeight - SECTION_PADDING - rowsHeight, SPHERE_MAX));
                setDimensions({ width, height });
            }
        };

        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, [isLarge, rows.length]);

    const hasShowcase = slides.length > 0;

    return (
        <div ref={sectionRef} className="h-full w-full items-center overflow-y-auto max-h-screen scrollbar-hide">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <section className="flex w-full px-0 sm:px-4 lg:px-8 pt-20 pb-6 lg:py-24 h-full items-center">
                    <div className="w-full flex flex-col lg:flex-row gap-6 lg:gap-8">
                        <div className={`w-full ${hasShowcase ? "lg:w-2/3" : ""} flex flex-col gap-4 min-w-0`}>
                            {isLarge && (
                                <div
                                    ref={containerRef}
                                    className="w-full flex items-center justify-center"
                                    style={{ height: `${dimensions.height}px` }}
                                >
                                    {tags.length > 0 && (
                                        <TagCloudCanvas
                                            tags={tags}
                                            width={dimensions.width}
                                            height={dimensions.height}
                                        />
                                    )}
                                </div>
                            )}
                            <SkillMarquee
                                ref={rowsRef}
                                rows={rows}
                                highlighted={highlighted}
                                selectable={selectable}
                                onSelect={selectFramework}
                                paused={!inView || !pageVisible}
                            />
                        </div>

                        {hasShowcase && (
                            // On large screens the card fills the column without adding height of its own.
                            <div className="w-full lg:w-1/3 relative h-[30rem] lg:h-auto">
                                <FrameworkShowcase
                                    className="absolute inset-0"
                                    slides={slides}
                                    index={current}
                                    onIndexChange={setSlideIndex}
                                    visible={seen}
                                    playing={inView && pageVisible}
                                />
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SkillsSection;
