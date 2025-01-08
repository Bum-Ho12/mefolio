"use client";

import React from 'react';
import Image from 'next/image';
import { Globe, Github } from 'lucide-react';
import { Projects, Project } from '@/utils/types';

interface ProjectSectionProps {
    projects: Projects;
}

const ProjectCard = ({ project }: { project: Project }) => {
    return (
        <div className="rounded-3xl overflow-hidden relative group col-span-1 md:col-span-1 lg:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/10 rounded-3xl" />

            <div className="relative p-6 h-full flex flex-col">
                <div className="flex-1">
                        <Image
                            src={project.image?.url || '/empty_img.png'}
                            alt={project.name}
                            width={640}
                            height={160}
                            className="w-full h-40 object-cover rounded-xl mb-4"
                        />
                    <h3 className="text-xl font-semibold mb-2 text-white">{project.name}</h3>
                    <p className="text-gray-300 text-sm mb-4">{project.description}</p>
                </div>

                <div className="flex gap-3">
                    {project.githubUrl && (
                        <a
                            href={project.githubUrl}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Github className="w-5 h-5 text-white" />
                        </a>
                    )}
                    {project.projectUrl && (
                        <a
                            href={project.projectUrl}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Globe className="w-5 h-5 text-white" />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

const ProjectSection: React.FC<ProjectSectionProps> = ({ projects: projectsData }) => {
    // Split the projects into featured (first 6) and others
    const displayedProjects = projectsData.projects.slice(0, 6);
    const otherProjects = projectsData.projects.slice(6);

    return (
        <div className="h-full w-full items-center overflow-y-auto max-h-screen scrollbar-hide pt-24 px-4 pb-10">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl font-bold mb-10">{projectsData.title}</h2>
                {/* <p className="text-gray-300 mb-8">{projectsData.description}</p> */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {displayedProjects.map((project, index) => (
                        <ProjectCard key={index} project={project} />
                    ))}
                </div>

                {otherProjects.length > 0 && (
                    <>
                        <h3 className="text-2xl font-bold mb-4">More Projects</h3>
                        <div className="flex flex-wrap gap-4 justify-start">
                            {otherProjects.map((project, index) => (
                                <div
                                    key={index}
                                    className="w-12 h-12 rounded-full overflow-hidden relative group cursor-pointer"
                                >
                                    {project.image && (
                                        <Image
                                            src={project.image.url}
                                            alt={project.name}
                                            width={48}
                                            height={48}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProjectSection;