/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Globe, Github } from 'lucide-react';

interface Project {
    id: number;
    title: string;
    description: string;
    image: string;
    githubUrl?: string;
    liveUrl?: string;
    storeUrl?: string;
    featured: boolean;
}

const projects: Project[] = [
    {
        id: 1,
        title: "Budget Box",
        description: "Personal finance management application with expense tracking and budget planning features",
        image: "test.png",
        githubUrl: "https://github.com/example/budget-box",
        liveUrl: "https://budget-box.example.com",
        featured: true
    },
    {
        id: 2,
        title: "Weather Dashboard",
        description: "Real-time weather tracking with interactive maps and forecasting",
        image: "test.png",
        githubUrl: "https://github.com/example/weather-app",
        liveUrl: "https://weather.example.com",
        featured: true
    },
    {
        id: 3,
        title: "E-commerce Platform",
        description: "Full-featured online shopping platform with cart and payment integration",
        image: "test.png",
        githubUrl: "https://github.com/example/ecommerce",
        liveUrl: "https://shop.example.com",
        featured: true
    },
    {
        id: 4,
        title: "Blog Engine",
        description: "Modern blogging platform with markdown support and SEO optimization",
        image: "test.png",
        githubUrl: "https://github.com/example/blog-engine",
        liveUrl: "https://blog.example.com",
        featured: true
    },
    {
        id: 5,
        title: "Task Manager",
        description: "Collaborative task management tool with real-time updates",
        image: "test.png",
        githubUrl: "https://github.com/example/task-manager",
        liveUrl: "https://tasks.example.com",
        featured: true
    },
    {
        id: 6,
        title: "Mobile App",
        description: "Cross-platform mobile application",
        image: "test.png",
        storeUrl: "https://play.google.com/store/apps/details?id=com.example",
        featured: true
    },
];

const ProjectCard = ({ project }: { project: Project }) => {
    return (
        <div className={`rounded-3xl overflow-hidden relative group ${
        project.featured ? 'col-span-1 md:col-span-1 lg:col-span-1' : 'col-span-1'
        }`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/10 rounded-3xl" />

        <div className="relative p-6 h-full flex flex-col ">
            <div className="flex-1">
            <img
                src={project.image}
                alt={project.title}
                className="w-full h-40 object-cover rounded-xl mb-4"
            />
            <h3 className="text-xl font-semibold mb-2 text-white">{project.title}</h3>
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
            {project.liveUrl && (
                <a
                href={project.liveUrl}
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

const ProjectSection: React.FC = () => {
    const featuredProjects = projects.filter(p => p.featured);
    const otherProjects = projects.filter(p => !p.featured);

    return (
        <div className="h-full w-full items-center overflow-y-auto max-h-screen scrollbar-hide pt-24 px-4 pb-10">
            <h2 className="text-4xl font-bold mb-8">Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {featuredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
                ))}
            </div>

            {otherProjects.length > 0 && (
                <div className="flex flex-wrap gap-4 justify-center">
                {otherProjects.map(project => (
                    <div
                    key={project.id}
                    className="w-12 h-12 rounded-full overflow-hidden relative group cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/10" />
                        <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                    </div>
                ))}
                </div>
            )}
        </div>
    );
};

export default ProjectSection;