"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useMemo, useRef } from "react";
import { IoArrowUpCircle, IoArrowDownCircle } from "react-icons/io5";

interface SectionData {
    id: string;
    content: React.ReactNode;
}

export default function ClientLayout({ sections }: { sections: SectionData[] }) {
    const sectionIds = useMemo(() => sections.map((section) => section.id), [sections]);
    const [activeSection, setActiveSection] = useState<string>(sectionIds[0]);
    const [isAboutSection, setIsAboutSection] = useState(true);
    const navRef = useRef<HTMLDivElement>(null);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        }
    };

    const calculateButtonOffset = () => {
        if (navRef.current) {
        const buttons = navRef.current.querySelectorAll<HTMLAnchorElement>("a");
        const activeIndex = sectionIds.slice(1).indexOf(activeSection);
        if (activeIndex !== -1) {
            const button = buttons[activeIndex];
            if (button) {
            const rect = button.getBoundingClientRect();
            return {
                left: rect.left - navRef.current.getBoundingClientRect().left,
                width: rect.width,
            };
            }
        }
        }
        return { left: 0, width: 0 };
    };

    const { left, width } = calculateButtonOffset();

    useEffect(() => {
        const observerCallback = (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
            const id = entry.target.id;
            setActiveSection(id);
            setIsAboutSection(id === sectionIds[0]);
            }
        });
        };

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: Array.from({ length: 11 }, (_, i) => i / 10),
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        sectionIds.forEach((id) => {
        const element = document.getElementById(id);
        if (element) observer.observe(element);
        });

        return () => {
        sectionIds.forEach((id) => {
            const element = document.getElementById(id);
            if (element) observer.unobserve(element);
        });
        };
    }, [sectionIds]);

    return (
        <>
        {!isAboutSection && (
            <motion.div
            className="fixed top-2 w-full flex justify-center items-center z-50"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            >
            <nav
                ref={navRef}
                className="flex bg-[#FFD3AC] font-bold gap-6 h-14 items-center px-4 rounded-full shadow-lg relative"
            >
                <motion.div
                className="absolute top-0 h-full bg-white rounded-full mt-[5px]"
                initial={false}
                style={{ left: `${left}px`, width: `${width}px`, height: "80%" }}
                animate={{ left, width }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                {sectionIds.slice(1).map((id) => (
                <a
                    key={id}
                    className={`relative text-black text-sm font-medium px-4 py-1 cursor-pointer rounded-full transition duration-300 ${
                    activeSection === id ? "font-bold" : ""
                    }`}
                    onClick={() => scrollToSection(id)}
                >
                    {id.charAt(0).toUpperCase() + id.slice(1)}
                </a>
                ))}
            </nav>
            </motion.div>
        )}
        <motion.button
            className="fixed bottom-10 z-50 p-2 bg-[#FFD3AC] rounded-full shadow-lg text-black font-bold"
            onClick={() =>
            isAboutSection ? scrollToSection(sectionIds[1]) : scrollToSection(sectionIds[0])
            }
            initial={{ left: "50%", transform: "translateX(-50%)" }}
            animate={{
            left: isAboutSection ? "50%" : "90%",
            transform: isAboutSection ? "translateX(-50%)" : "translateX(0)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            {isAboutSection ? <IoArrowDownCircle size={30} /> : <IoArrowUpCircle size={30} />}
        </motion.button>
        <main className="flex-1 px-10">
            {sections.map((section, index) => (
                <motion.section
                    id={section.id}
                    key={section.id}
                    className={`h-screen flex items-center justify-center `}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {section.content}
                </motion.section>
            ))}
        </main>
        <footer className="bg-black text-center py-4 mt-8">
            <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Bumho Nisubire. All rights reserved.
            </p>
        </footer>
        </>
    );
}
