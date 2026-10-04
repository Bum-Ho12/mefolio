"use client";

import type { Ref } from "react";
import { useReducedMotion } from "framer-motion";
import { Skill } from "@/utils/types";

export interface SkillRow {
    label: string;
    skills: Skill[];
}

interface SkillMarqueeProps {
    rows: SkillRow[];
    // Skills used in the project the showcase is on.
    highlighted: Set<Skill>;
    // Frameworks that have showcase slides; clicking one jumps the showcase to it.
    onSelect?: (skill: Skill) => void;
    selectable: Set<Skill>;
    // Stops the animation while the section is off screen or the tab is hidden.
    paused: boolean;
    ref?: Ref<HTMLDivElement>;
}

// A short list is repeated until one copy is about this long, so the row never shows a gap.
const MIN_ITEMS = 12;
const SECONDS_PER_ITEM = 3;

function SkillPill({ skill, highlighted, onSelect, hidden }: { skill: Skill; highlighted: boolean; onSelect?: () => void; hidden: boolean }) {
    const className = `flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition-colors duration-500 ${
        highlighted ? "border-white/60 bg-white/20 text-white" : "border-white/10 bg-white/5 text-white/70"
    }`;
    const content = (
        <>
            {skill.icon?.url && (
                // A plain <img>: icons may be SVG, which must never be inlined.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={skill.icon.url} alt="" className="h-5 w-5 object-contain" loading="lazy" />
            )}
            {skill.name}
        </>
    );
    return (
        <li aria-hidden={hidden || undefined}>
            {onSelect ? (
                <button type="button" onClick={onSelect} tabIndex={hidden ? -1 : undefined} className={`${className} hover:border-white/40 hover:text-white`}>
                    {content}
                </button>
            ) : (
                <span className={className}>{content}</span>
            )}
        </li>
    );
}

function MarqueeRow({ row, reverse, highlighted, selectable, onSelect, paused }: Omit<SkillMarqueeProps, "rows" | "ref"> & { row: SkillRow; reverse: boolean }) {
    const reduceMotion = useReducedMotion();
    const pill = (skill: Skill, key: string, hidden: boolean) => (
        <SkillPill
            key={key}
            skill={skill}
            hidden={hidden}
            highlighted={highlighted.has(skill)}
            onSelect={onSelect && selectable.has(skill) ? () => onSelect(skill) : undefined}
        />
    );

    // No movement: one copy of the list in a row that can be swiped sideways.
    if (reduceMotion) {
        return (
            <ul className="flex gap-2 overflow-x-auto scrollbar-hide">
                {row.skills.map((skill, i) => pill(skill, String(i), false))}
            </ul>
        );
    }

    const reps = Math.ceil(MIN_ITEMS / row.skills.length);
    const copy = Array.from({ length: reps }, () => row.skills).flat();

    return (
        <div className="group overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div
                className="flex w-max animate-marquee group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]"
                style={{
                    animationDuration: `${copy.length * SECONDS_PER_ITEM}s`,
                    animationDirection: reverse ? "reverse" : "normal",
                    // Inline, so it only overrides the hover pause while paused.
                    animationPlayState: paused ? "paused" : undefined,
                }}
            >
                {/* Two identical copies; only the first pass of the list is read out or focusable. */}
                {[0, 1].map((half) => (
                    <ul key={half} className="flex shrink-0 gap-2 pr-2">
                        {copy.map((skill, i) => pill(skill, `${half}-${i}`, half > 0 || i >= row.skills.length))}
                    </ul>
                ))}
            </div>
        </div>
    );
}

export default function SkillMarquee({ rows, ref, ...rest }: SkillMarqueeProps) {
    return (
        <div ref={ref} className="flex w-full flex-col gap-3">
            {rows.map((row, i) => (
                <div key={row.label} role="group" aria-label={row.label} className="space-y-1.5">
                    <p className="px-1 text-[11px] font-semibold uppercase tracking-widest text-white/40">{row.label}</p>
                    <MarqueeRow row={row} reverse={i % 2 === 1} {...rest} />
                </div>
            ))}
        </div>
    );
}
