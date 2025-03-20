// src/services/api/sanity.ts
import { sanityClient } from '@/utils/sanity';
import { AboutData, Career, ContactData, Intro, PrivacyPolicyData, Projects, Resume, Skills, StoreData, StoreItem, TermsConditionsData } from '@/utils/types';

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
        file {
            asset->{
                url
            }
        },
        downloadLink
    }`;
    return sanityClient.fetch(query);
}


export async function getStore(): Promise<StoreData> {
    const query = `*[_type == "store"][0]{
        title,
        description,
        "heroImage": heroImage.asset->url,
        heroTitle,
        heroSubtitle,
        "items": items[]->{
            id,
            name,
            description,
            price,
            "image": image{
                "url": asset->url
            },
            inStock,
            category
        }
    }`;

    return await sanityClient.fetch(query);
}

export async function getStoreItem(slug: string): Promise<StoreItem> {
    const query = `*[_type == "storeItem" && id.current == $slug][0]{
        name,
        "id": id,
        description,
        price,
        "mainImage": mainImage.asset->url,
        "images": images[].asset->url,
        inStock,
        category,
        featured,
        releaseDate,
        platform,
        appStoreUrl,
        playStoreUrl,
        webAppUrl,
        downloadUrl,
        version,
        features,
        size,
        color,
        material,
        weight
    }`;

    return await sanityClient.fetch(query, { slug });
}

export async function getStoreItems(category?: string): Promise<StoreItem[]> {
    const categoryFilter = category ? ` && category == "${category}"` : '';

    const query = `*[_type == "storeItem"${categoryFilter}] | order(featured desc, releaseDate desc) {
        name,
        "id": id,
        description,
        price,
        "mainImage": mainImage.asset->url,
        inStock,
        category,
        featured,
        platform,
        version
    }`;

    return await sanityClient.fetch(query);
}

// Fetch About page data
export async function getAboutPage(): Promise<AboutData> {
    const query = `*[_type == "about"][0]{
        title,
        "heroImage": heroImage.asset->url,
        heroTitle,
        heroSubtitle,
        content,
        team[]{
        name,
        role,
        bio,
        "image": image.asset->url
        }
    }`;
    return await sanityClient.fetch(query);
}

// Fetch Privacy Policy page data
export async function getPrivacyPolicyPage(): Promise<PrivacyPolicyData> {
    const query = `*[_type == "privacyPolicy"][0]{
        title,
        "heroImage": heroImage.asset->url,
        heroTitle,
        heroSubtitle,
        lastUpdated,
        content
    }`;
    return await sanityClient.fetch(query);
}

// Fetch Terms & Conditions page data
export async function getTermsConditionsPage(): Promise<TermsConditionsData> {
    const query = `*[_type == "termsConditions"][0]{
        title,
        "heroImage": heroImage.asset->url,
        heroTitle,
        heroSubtitle,
        lastUpdated,
        content
    }`;
    return await sanityClient.fetch(query);
}

// Fetch Contact page data
export async function getContactPage(): Promise<ContactData> {
    const query = `*[_type == "contact"][0]{
        title,
        "heroImage": heroImage.asset->url,
        heroTitle,
        heroSubtitle,
        email,
        phone,
        address,
        socialLinks[]{
            platform,
            url
        },
        formIntro
    }`;
    return await sanityClient.fetch(query);
}