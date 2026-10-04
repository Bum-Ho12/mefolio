"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { ChevronLeft, ChevronRight, Github, Globe } from "lucide-react";
import type { ShowcaseSlide } from "@/utils/sections";
import type { Skill } from "@/utils/types";

interface FrameworkShowcaseProps {
    slides: ShowcaseSlide[];
    index: number;
    onIndexChange: (index: number) => void;
    // The section has been on screen; the entrance plays once.
    visible: boolean;
    // On screen and the tab is in front; slides only advance while this holds.
    playing: boolean;
    // Must position the card (defaults to `relative`).
    className?: string;
}

const SLIDE_MS = 6000;
// Longer groups end in a "+N" pill.
const MAX_PILLS = 5;

function SkillIcon({ skill, className }: { skill: Skill; className: string }) {
    if (!skill.icon?.url) return null;
    // A plain <img>: icons may be SVG, which must never be inlined.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={skill.icon.url} alt="" className={`${className} object-contain`} />;
}

export default function FrameworkShowcase({ slides, index, onIndexChange, visible, playing, className = "relative" }: FrameworkShowcaseProps) {
    const reduceMotion = useReducedMotion();
    const [held, setHeld] = useState(false);
    const count = slides.length;
    const slide = slides[index];
    const advancing = visible && playing && !held && !reduceMotion && count > 1;

    // Restarts on every slide change, so a manual jump gets a full slide's time.
    useEffect(() => {
        if (!advancing) return;
        const timer = setTimeout(() => onIndexChange((index + 1) % count), SLIDE_MS);
        return () => clearTimeout(timer);
    }, [advancing, index, count, onIndexChange]);

    if (!slide) return null;

    const shift = reduceMotion ? 0 : 14;
    const body: Variants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: reduceMotion ? 0 : 0.08 } },
        exit: { opacity: 0, y: -shift, transition: { duration: 0.25 } },
    };
    const item: Variants = {
        hidden: { opacity: 0, y: shift },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    };
    const pills: Variants = {
        hidden: {},
        show: { transition: { staggerChildren: reduceMotion ? 0 : 0.04 } },
    };

    const { framework, project, stack } = slide;
    const groups = ([["Languages", stack.languages], ["Frameworks", stack.frameworks], ["Tools", stack.tools]] as const).filter(([, list]) => list.length > 0);
    const go = (step: number) => onIndexChange((index + step + count) % count);

    return (
        <motion.div
            className={`overflow-hidden rounded-3xl ${className}`}
            initial={false}
            animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: reduceMotion ? 0 : 24 }}
            transition={{ duration: 0.6, delay: visible ? 0.3 : 0, ease: "easeOut" }}
            onMouseEnter={() => setHeld(true)}
            onMouseLeave={() => setHeld(false)}
            onFocus={() => setHeld(true)}
            onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHeld(false)}
            role="region"
            aria-roledescription="carousel"
            aria-label="Projects by framework"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/10 rounded-3xl" />

            <div className="relative flex h-full flex-col p-5">
                {/* The header stays put while the next slide is the same framework. */}
                <div className="h-14 shrink-0">
                    <AnimatePresence mode="wait" initial={false}>
                        {visible && (
                            <motion.div
                                key={framework.name}
                                className="flex items-center gap-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            >
                                {framework.icon?.url && (
                                    <motion.div
                                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10"
                                        initial={{ scale: reduceMotion ? 1 : 0.6 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 260, damping: 18 }}
                                    >
                                        <SkillIcon skill={framework} className="h-7 w-7" />
                                    </motion.div>
                                )}
                                <motion.div className="min-w-0" initial={{ opacity: 0, y: shift / 2 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                    <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Built with</p>
                                    <h3 className="truncate text-xl font-semibold text-white">{framework.name}</h3>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="relative min-h-0 flex-1 overflow-hidden" aria-live={advancing ? "off" : "polite"}>
                    <AnimatePresence mode="wait" initial={false}>
                        {visible && (
                            <motion.div
                                key={`${framework.name}:${project.id}`}
                                className="flex h-full flex-col gap-3"
                                variants={body}
                                initial="hidden"
                                animate="show"
                                exit="exit"
                                aria-roledescription="slide"
                                aria-label={`${index + 1} of ${count}: ${project.name}`}
                            >
                                {framework.summary && (
                                    <motion.p variants={item} className="line-clamp-2 text-sm text-white/60">{framework.summary}</motion.p>
                                )}
                                {project.image?.url && (
                                    // Takes whatever height is left, so a long stack shrinks the image instead of overflowing.
                                    <motion.div variants={item} className="relative min-h-0 flex-1 overflow-hidden rounded-xl">
                                        <Image src={project.image.url} alt={project.name} fill sizes="(max-width: 1024px) 100vw, 400px" className="object-cover" />
                                    </motion.div>
                                )}
                                <motion.div variants={item} className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h4 className="truncate text-lg font-semibold text-white">{project.name}</h4>
                                        {project.description && <p className="line-clamp-2 text-sm text-gray-300 lg:line-clamp-3">{project.description}</p>}
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        {project.githubUrl && (
                                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" aria-label={`${project.name} on GitHub`} className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20">
                                                <Github className="h-4 w-4 text-white" />
                                            </a>
                                        )}
                                        {project.projectUrl && (
                                            <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.name}`} className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20">
                                                <Globe className="h-4 w-4 text-white" />
                                            </a>
                                        )}
                                    </div>
                                </motion.div>
                                <div className="mt-auto shrink-0 space-y-2">
                                    {groups.map(([label, list]) => (
                                        <motion.div key={label} variants={item}>
                                            <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-white/40">{label}</p>
                                            {/* One line per group on small screens, faded at the edge; wrapping on large ones. */}
                                            <motion.ul variants={pills} className="flex gap-1.5 overflow-hidden max-lg:[mask-image:linear-gradient(to_right,black_85%,transparent)] lg:flex-wrap">
                                                {list.slice(0, MAX_PILLS).map((skill, i) => (
                                                    <motion.li
                                                        key={`${skill.name}-${i}`}
                                                        variants={item}
                                                        className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
                                                            skill === framework ? "border-white/60 bg-white/20 text-white" : "border-white/10 bg-white/5 text-white/70"
                                                        }`}
                                                    >
                                                        <SkillIcon skill={skill} className="h-3.5 w-3.5" />
                                                        {skill.name}
                                                    </motion.li>
                                                ))}
                                                {list.length > MAX_PILLS && (
                                                    <motion.li
                                                        variants={item}
                                                        className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/50"
                                                        title={list.slice(MAX_PILLS).map((s) => s.name).join(", ")}
                                                    >
                                                        +{list.length - MAX_PILLS}
                                                    </motion.li>
                                                )}
                                            </motion.ul>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {count > 1 && (
                    <div className="mt-3 flex shrink-0 items-center justify-between">
                        <button type="button" onClick={() => go(-1)} aria-label="Previous project" className="rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <span className="text-xs tabular-nums text-white/50">{index + 1} / {count}</span>
                        <button type="button" onClick={() => go(1)} aria-label="Next project" className="rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Time left on this slide; restarts whenever advancing resumes. */}
            {advancing && (
                <motion.div
                    key={index}
                    className="absolute bottom-0 left-0 h-0.5 bg-white/50"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: SLIDE_MS / 1000, ease: "linear" }}
                />
            )}
        </motion.div>
    );
}
