"use client";

import { useEffect, useState } from "react";

export default function CareerSection() {
    const [activeSubsection, setActiveSubsection] = useState<string>("education");
    const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(true);

    useEffect(() => {
        const careerSection = document.getElementById("career");
        const subsections = document.querySelectorAll(".career-subsection");

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSubsection(entry.target.id);
                    }
                });
            },
            { root: null, threshold: 0.7 }
        );

        subsections.forEach((section) => observer.observe(section));

        const careerObserver = new IntersectionObserver(
            ([entry]) => {
                setIsSidebarVisible(entry.isIntersecting);
            },
            { root: null, threshold: 0.1 }
        );

        if (careerSection) {
            careerObserver.observe(careerSection);
        }

        return () => {
            subsections.forEach((section) => observer.unobserve(section));
            if (careerSection) {
                careerObserver.unobserve(careerSection);
            }
        };
    }, []);

    return (
        <section
            id="career"
            className="relative flex flex-col lg:flex-row h-screen bg-black text-white px-4 w-full"
        >
            <aside
                className={`flex flex-row lg:flex-col sticky lg:top-24 top-16 left-0 lg:max-h-[12rem] group items-center justify-center w-full lg:w-40 ${
                    isSidebarVisible ? "opacity-100" : "opacity-0"
                } transition-opacity duration-300`}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-md border border-white/10 lg:hidden" />
                <ul className="flex lg:flex-col lg:space-y-4 space-x-4 lg:space-x-0 font-bold text-lg relative py-4 lg:py-6 max-h-screen w-full lg:w-auto justify-around lg:justify-start">
                    {["education", "work", "certifications"].map((section) => (
                        <li
                            key={section}
                            className={`cursor-pointer px-4 lg:px-6 py-1 w-full text-center lg:text-left ${
                                activeSubsection === section ? "text-[#FFD3AC] underline " : ""
                            }`}
                        >
                            {section.charAt(0).toUpperCase() + section.slice(1)}
                        </li>
                    ))}
                </ul>
            </aside>

            <div className="flex-1 h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
                {["education", "work", "certifications"].map((section) => (
                    <div
                        key={section}
                        id={section}
                        className="career-subsection snap-start min-h-screen flex border-b border-gray-700 pl-4 lg:pl-16 pt-24"
                    >
                        <div>
                            {/* title */}
                            <h2 className="text-3xl whitespace-pre-line font-semibold">
                                {section === "education"
                                    ? `BSC Computer Technology`
                                    : section === "work"
                                    ? "Software Developer at XYZ Company"
                                    : "Certified JavaScript Developer"}
                            </h2>
                            {/* subtitle */}
                            <p className="mt-4 text-lg whitespace-pre-line">
                                {section === "education"
                                    ? `Multimedia University of Kenya • Sept 2019`
                                    : section === "work"
                                    ? "Software Developer at XYZ Company"
                                    : "Certified JavaScript Developer"}
                            </p>
                            {/* description */}
                            <p className="mt-4 text-lg whitespace-pre-line">
                                {section === "education"
                                    ? `Multimedia University of Kenya • Sept 2019`
                                    : section === "work"
                                    ? "Software Developer at XYZ Company"
                                    : "Certified JavaScript Developer"}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
