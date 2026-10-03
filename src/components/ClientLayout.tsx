"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useMemo, useRef } from "react";
import { IoArrowUpCircle, IoArrowDownCircle } from "react-icons/io5";
import { ScrollContainerContext } from "./ScrollContainerContext";

interface SectionData {
    id: string;
    content: React.ReactNode;
    // Section sizes itself (e.g. taller than one screen) instead of being a centered h-screen box.
    tall?: boolean;
}

export default function ClientLayout({ sections }: { sections: SectionData[] }) {
    const sectionIds = useMemo(() => sections.map((section) => section.id), [sections]);
    const [activeSection, setActiveSection] = useState<string>(sectionIds[0]);
    const [isAboutSection, setIsAboutSection] = useState(true);
    // Held in state so consumers re-subscribe once the scroll element mounts;
    // a plain ref is attached only after child effects have already run.
    const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
    const scrollRef = useMemo(() => (scrollEl ? { current: scrollEl } : null), [scrollEl]);
    const isScrolling = useRef(false);
    const navRef = useRef<HTMLDivElement>(null);
    // The address is only rewritten once any section named in it has been restored.
    const hashRestored = useRef(false);

    const scrollToSection = (id: string) => {
        if (isScrolling.current) return;
        isScrolling.current = true;

        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
            setTimeout(() => {
                isScrolling.current = false;
            }, 1000);
        }
    };

    // Arriving with a section in the address (a link to /#journeys, or Back from another
    // page) opens the page on that section instead of the first one.
    useEffect(() => {
        if (!scrollEl || hashRestored.current) return;
        hashRestored.current = true;
        const id = decodeURIComponent(window.location.hash.slice(1));
        const target = sectionIds.includes(id) ? document.getElementById(id) : null;
        if (target) scrollEl.scrollTo({ top: target.offsetTop, behavior: "instant" });
    }, [scrollEl, sectionIds]);

    // The address follows the section on screen, so leaving and coming back returns here.
    useEffect(() => {
        if (!hashRestored.current) return;
        const { pathname, search } = window.location;
        const hash = activeSection && activeSection !== sectionIds[0] ? `#${activeSection}` : "";
        if (hash !== window.location.hash) window.history.replaceState(window.history.state, "", `${pathname}${search}${hash}`);
    }, [activeSection, sectionIds]);

    // The nav scrolls sideways on narrow screens; keep the active button in view.
    useEffect(() => {
        const nav = navRef.current;
        const button = nav?.querySelector<HTMLElement>('[aria-current="true"]');
        if (!nav || !button) return;
        nav.scrollTo({ left: button.offsetLeft - (nav.clientWidth - button.offsetWidth) / 2, behavior: "smooth" });
    }, [activeSection, isAboutSection]);

    useEffect(() => {
        if (!scrollEl) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        setActiveSection(id);
                        setIsAboutSection(id === sectionIds[0]);
                    }
                });
            },
            {
                // A section is active while it covers the vertical center line,
                // which works for sections of any height.
                root: scrollEl,
                rootMargin: "-50% 0px -50% 0px",
                threshold: 0,
            }
        );

        sectionIds.forEach((id) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [sectionIds, scrollEl]);

    // Every section can be hidden when it has no content; with none left there is
    // nothing to scroll between.
    if (sections.length === 0) {
        return (
            <div className="h-screen flex items-center justify-center text-gray-400">
                Content coming soon.
            </div>
        );
    }

    return (
        <div className="relative max-h-screen h-screen overflow-y-auto snap-mandatory snap-y custom-scrollbar lg:pl-10">
            {/* Animated Ambient Radial Blue Background */}
            <motion.div
                className="absolute inset-0 bg-gradient-radial from-blue-500/60 to-transparent z-0"
                style={{
                    background: 'radial-gradient(circle, rgba(59,130,246,0.6) 0%, rgba(255,255,255,0) 80%)',
                }}
                animate={{
                    opacity: [0.2, 0.55, 0.2], // Pulse effect: opacity increases and decreases
                }}
                transition={{
                    duration: 13, // Duration of one pulse cycle
                    repeat: Infinity, // Repeat the animation infinitely
                    ease: "easeInOut", // Smooth easing
                }}
            />
            <div className="fixed left-0 right-0 flex justify-center z-50">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border-b border-white/10 " />
                {!isAboutSection && (
                    <motion.nav
                        className=" shadow-lg px-2 sm:px-4 md:px-6 py-2 md:py-3 w-full mx-auto"
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Centered by auto margins on the first and last button rather than
                            justify-center, so a row wider than the screen can be scrolled to both ends. */}
                        <div ref={navRef} className="w-full flex gap-2 sm:gap-4 md:gap-6 relative items-center overflow-x-auto scrollbar-hide [&>:first-child]:ml-auto [&>:last-child]:mr-auto">
                            {sectionIds.slice(1).map((id) => (
                                <button
                                    key={id}
                                    onClick={() => scrollToSection(id)}
                                    aria-current={activeSection === id}
                                    className={`relative shrink-0 px-2 sm:px-3 md:px-4 py-1 rounded-full transition-colors text-sm sm:text-base ${
                                        activeSection === id
                                            ? "bg-white text-black font-bold"
                                            : "text-white hover:bg-white/30"
                                    }`}
                                >
                                    {id.charAt(0).toUpperCase() + id.slice(1)}
                                </button>
                            ))}
                        </div>
                    </motion.nav>
                )}
            </div>

            {sectionIds.length > 1 && <motion.button
                className="fixed bottom-10 z-50 p-2 bg-[#FFD3AC] rounded-full shadow-lg"
                onClick={() =>
                    isAboutSection
                        ? scrollToSection(sectionIds[1])
                        : scrollToSection(sectionIds[0])
                }
                initial={{ left: "50%", x: "-50%" }}
                animate={{
                    left: isAboutSection ? "50%" : "87%",
                    x: isAboutSection ? "-50%" : "0%",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                {isAboutSection ? (
                    <IoArrowDownCircle size={30} />
                ) : (
                    <IoArrowUpCircle size={30} />
                )}
            </motion.button>}

            <div
                ref={setScrollEl}
                className="h-screen overflow-y-auto snap-mandatory snap-y relative"
                style={{ scrollBehavior: "smooth" }}
            >
                <ScrollContainerContext.Provider value={scrollRef}>
                    {sections.map((section) => (
                        <motion.section
                            id={section.id}
                            key={section.id}
                            className={
                                section.tall
                                    ? "snap-start snap-always"
                                    : "h-screen flex items-center justify-center snap-start snap-always"
                            }
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true, amount: section.tall ? "some" : 0.5 }}
                        >
                            {section.content}
                        </motion.section>
                    ))}
                </ScrollContainerContext.Provider>

                {/* <footer className="bg-black text-center py-4">
                    <p className="text-sm text-gray-400">
                        &copy; {new Date().getFullYear()} Bumho Nisubire. All rights reserved.
                    </p>
                </footer> */}
            </div>
        </div>
    );
}