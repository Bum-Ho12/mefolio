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
            className="relative flex h-screen bg-black text-white px-4 w-full"
        >
            <aside
                className={`sticky top-24 left-0 h-max ${
                    isSidebarVisible ? "opacity-100" : "opacity-0"
                } transition-opacity duration-300`}
            >
                <ul className="space-y-4 font-bold text-lg">
                    {["education", "work", "certifications"].map((section) => (
                        <li
                            key={section}
                            className={`cursor-pointer ${
                                activeSubsection === section ? "text-[#FFD3AC]" : ""
                            }`}
                        >
                            {section.charAt(0).toUpperCase() + section.slice(1)}
                        </li>
                    ))}
                </ul>
            </aside>

            <div className="flex-1 ml-8 h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
                {["education", "work", "certifications"].map((section) => (
                    <div
                        key={section}
                        id={section}
                        className="career-subsection snap-start min-h-screen flex border-b border-gray-700 pl-4 lg:pl-16 pt-24"
                    >
                        <div>
                            {/* <h2 className="text-4xl font-bold">
                                {section.charAt(0).toUpperCase() + section.slice(1)}
                            </h2> */}
                            {/* title */}
                            <h2 className=" text-3xl whitespace-pre-line font-semibold">
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