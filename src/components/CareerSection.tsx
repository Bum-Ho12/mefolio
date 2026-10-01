"use client";

import { Career } from "@/utils/types";
import { useEffect, useState } from "react";
import { format } from "date-fns";

interface CareerSectionProps {
    career: Career;
}

const CareerSection: React.FC<CareerSectionProps> = ({ career }) => {
    // Only subsections with entries are rendered, so no panel ever opens onto a blank screen.
    const subsections = [
        { id: "education", count: career.education.length },
        { id: "work", count: career.workExperience.length },
        { id: "certifications", count: career.certifications.length },
    ].filter((subsection) => subsection.count > 0).map((subsection) => subsection.id);
    const [activeSubsection, setActiveSubsection] = useState<string>(subsections[0] ?? "education");
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

    const renderEducation = () => (
        <div className="space-y-8">
            {career.education.map((edu, index) => (
                <div key={index} className="space-y-2">
                    <h2 className="text-2xl font-semibold">{edu.degree}</h2>
                    <p className="text-lg">{edu.institution}</p>
                    <p className="text-lg text-gray-400">{edu.year}</p>
                </div>
            ))}
        </div>
    );

    const renderWork = () => (
        <div className="space-y-12">
            {career.workExperience.map((work, index) => {
                const formattedStartDate = work.startDate
                    ? format(new Date(work.startDate), "MMMM d, yyyy")
                    : null;
                const formattedEndDate = work.endDate
                    ? format(new Date(work.endDate), "MMMM d, yyyy")
                    : "Present";

                return (
                    <div key={index} className="space-y-2">
                        <h2 className="text-2xl font-semibold">{work.role}</h2>
                        <p className="text-lg">{work.company}</p>
                        <p className="text-lg text-gray-400">
                            <span suppressHydrationWarning>{formattedStartDate}</span> - <span suppressHydrationWarning>{formattedEndDate}</span>
                        </p>
                        {work.description && (
                            <p className="text-lg whitespace-pre-line mt-4">{work.description}</p>
                        )}
                    </div>
                );
            })}
        </div>
    );

    const renderCertifications = () => (
        <div className="space-y-8">
            {career.certifications.map((cert, index) => (
                <div key={index} className="space-y-2">
                    <h2 className="text-2xl font-semibold">{cert.name}</h2>
                    <p className="text-lg">{cert.institution}</p>
                    <p className="text-lg text-gray-400">{cert.year}</p>
                </div>
            ))}
        </div>
    );

    return (
        <section
            id="career"
            className="relative h-screen bg-black text-white w-full"
        >
            <div className="relative h-screen max-w-7xl mx-auto px-4 lg:px-8 w-full flex flex-col lg:flex-row">
                <aside
                    className={`flex flex-row lg:flex-col sticky lg:top-24 top-16 left-0 lg:max-h-[12rem] group items-center justify-center w-full lg:w-40 ${isSidebarVisible ? "opacity-100" : "opacity-0"
                        } transition-opacity duration-300`}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-md border border-white/10 lg:hidden" />
                    <ul className="flex lg:flex-col lg:space-y-4 space-x-4 lg:space-x-0 font-bold text-lg relative py-4 lg:py-6 max-h-screen w-full lg:w-auto justify-around lg:justify-start">
                        {subsections.map((section) => (
                            <li
                                key={section}
                                onClick={() => setActiveSubsection(section)}
                                className={`cursor-pointer px-4 lg:px-6 py-1 w-full text-center lg:text-left ${activeSubsection === section ? "text-[#FFD3AC] underline" : ""
                                    }`}
                            >
                                {section.charAt(0).toUpperCase() + section.slice(1)}
                            </li>
                        ))}
                    </ul>
                </aside>

                <div className="flex-1 h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
                    {subsections.includes("education") && <div
                        id="education"
                        className="career-subsection snap-start min-h-screen flex border-b border-gray-700 pl-4 lg:pl-16 pt-24"
                    >
                        {renderEducation()}
                    </div>}
                    {subsections.includes("work") && <div
                        id="work"
                        className="career-subsection snap-start min-h-screen flex border-b border-gray-700 pl-4 lg:pl-16 pt-24"
                    >
                        {renderWork()}
                    </div>}
                    {subsections.includes("certifications") && <div
                        id="certifications"
                        className="career-subsection snap-start min-h-screen flex border-b border-gray-700 pl-4 lg:pl-16 pt-24"
                    >
                        {renderCertifications()}
                    </div>}
                </div>
            </div>
        </section>
    );
};

export default CareerSection;