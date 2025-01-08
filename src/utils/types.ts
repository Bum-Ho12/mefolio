
// Types based on your schemas
export interface SocialLink {
    platform: string;
    url: string;
}

export interface Intro {
    greeting: string;
    name: string;
    title: string;
    location: string;
    socialLinks: SocialLink[];
}

export interface Education {
    degree: string;
    institution: string;
    year: string;
}

export interface WorkExperience {
    role: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
}

export interface Certification {
    name: string;
    institution: string;
    year: string;
}

export interface Career {
    education: Education[];
    workExperience: WorkExperience[];
    certifications: Certification[];
}

export interface Project {
    name: string;
    description: string;
    image?: {
        url: string;
    };
    projectUrl?: string;
    githubUrl?: string;
}

export interface Projects {
    title: string;
    description: string;
    projects: Project[];
}

export interface Skill {
    name: string;
    icon?: {
        url: string;
    };
}

export interface Skills {
    languages: Skill[];
    frameworks: Skill[];
    tools: Skill[];
}

export interface Resume {
    downloadLink: string;
}
