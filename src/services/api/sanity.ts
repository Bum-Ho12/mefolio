// src/services/api/sanity.ts
import { sanityClient } from '@/utils/sanity';
import { Career, Intro, Projects, Resume, Skills } from '@/utils/types';

// Fetch functions
export async function getIntro(): Promise<Intro> {
    const query = `*[_type == "intro"][0] {
        greeting,
        name,
        title,
        location,
        socialLinks[] {
        platform,
        url
        }
    }`;
    return sanityClient.fetch(query);
}

export async function getCareer(): Promise<Career> {
    const query = `*[_type == "career"][0] {
        education[] {
        degree,
        institution,
        year
        },
        workExperience[] {
        role,
        company,
        startDate,
        endDate,
        description
        },
        certifications[] {
        name,
        institution,
        year
        }
    }`;
    return sanityClient.fetch(query);
}

export async function getProjects(): Promise<Projects> {
    const query = `*[_type == "projects"][0] {
        title,
        description,
        "projects": projects[]-> {
        name,
        description,
        "image": image.asset->{
            "url": url
        },
        projectUrl,
        githubUrl
        }
    }`;
    return sanityClient.fetch(query);
}

export async function getSkills(): Promise<Skills> {
    const query = `*[_type == "skills"][0] {
        languages[] {
        name,
        "icon": icon.asset->{
            "url": url
        }
        },
        frameworks[] {
        name,
        "icon": icon.asset->{
            "url": url
        }
        },
        tools[] {
        name,
        "icon": icon.asset->{
            "url": url
        }
        }
    }`;
    return sanityClient.fetch(query);
}

export async function getResume(): Promise<Resume> {
    const query = `*[_type == "resume"][0] {
        downloadLink
    }`;
    return sanityClient.fetch(query);
}