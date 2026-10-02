// src/services/api/sanity.ts
import { sanityClient } from '@/utils/sanity';
import { HOME_JOURNEYS } from '@/utils/sections';
import { AboutData, Career, ContactData, Intro, Journey, JourneysPageData, JourneysSectionData, PrivacyPolicyData, Projects, Resume, Skills, StoreData, StoreItem, TermsConditionsData, Videos } from '@/utils/types';

// Sanity returns null for a missing document and for a missing array field. Every list
// is wrapped in coalesce(…, []) and every fetcher falls back to an empty shape, so
// components can always iterate and sections with no content are simply hidden.

export async function getIntro(): Promise<Intro> {
    const query = `*[_type == "intro"][0] {
        greeting,
        name,
        title,
        location,
        "socialLinks": coalesce(socialLinks[] {
        platform,
        url
        }, [])
    }`;
    const data = await sanityClient.fetch<Intro | null>(query);
    return data ?? { greeting: '', name: '', title: '', location: '', socialLinks: [] };
}

export async function getCareer(): Promise<Career> {
    const query = `*[_type == "career"][0] {
        "education": coalesce(education[] {
        degree,
        institution,
        year
        }, []),
        "workExperience": coalesce(workExperience[] {
        role,
        company,
        startDate,
        endDate,
        description
        }, []),
        "certifications": coalesce(certifications[] {
        name,
        institution,
        year
        }, [])
    }`;
    const data = await sanityClient.fetch<Career | null>(query);
    return data ?? { education: [], workExperience: [], certifications: [] };
}

export async function getProjects(): Promise<Projects> {
    const query = `*[_type == "projects"][0] {
        title,
        description,
        "projects": coalesce(projects[defined(@->_id)]-> {
        name,
        description,
        "image": image.asset->{
            "url": url
        },
        projectUrl,
        githubUrl
        }, [])
    }`;
    const data = await sanityClient.fetch<Projects | null>(query);
    return data ?? { title: '', description: '', projects: [] };
}

export async function getSkills(): Promise<Skills> {
    const query = `*[_type == "skills"][0] {
        "languages": coalesce(languages[] {
        name,
        "icon": icon.asset->{
            "url": url
        }
        }, []),
        "frameworks": coalesce(frameworks[] {
        name,
        "icon": icon.asset->{
            "url": url
        }
        }, []),
        "tools": coalesce(tools[] {
        name,
        "icon": icon.asset->{
            "url": url
        }
        }, [])
    }`;
    const data = await sanityClient.fetch<Skills | null>(query);
    return data ?? { languages: [], frameworks: [], tools: [] };
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
    const data = await sanityClient.fetch<Resume | null>(query);
    return data ?? {};
}


export async function getStore(): Promise<StoreData> {
    const query = `*[_type == "store"][0]{
        title,
        description,
        "heroImage": heroImage.asset->url,
        heroTitle,
        heroSubtitle,
        "items": coalesce(items[defined(@->_id)]->{
            id,
            name,
            description,
            price,
            "image": image{
                "url": asset->url
            },
            inStock,
            category
        }, [])
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
        weight,
        "privacyPolicy": privacyPolicy->{
            _id,
            title,
            "heroImage": heroImage.asset->url,
            heroTitle,
            heroSubtitle,
            lastUpdated,
            content
        }
    }`;

    return await sanityClient.fetch(query, { slug });
}

export async function getStoreItems(category?: string): Promise<StoreItem[]> {
    // Passed as a GROQ parameter, never interpolated into the query string.
    const categoryFilter = category ? ' && category == $category' : '';

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

    return await sanityClient.fetch(query, category ? { category } : {});
}

// Each video is a Cloudinary public id or an https link, with an optional poster image.
export async function getVideos(): Promise<Videos> {
    const query = `*[_type == "videos"][0]{
        title,
        "videos": coalesce(videos[]{
            _key,
            title,
            publicId,
            url,
            "poster": poster.asset->url,
            description
        }, [])
    }`;
    const data = await sanityClient.fetch<Videos | null>(query);
    return data ?? { title: 'Videos', videos: [] };
}

const JOURNEY_SUMMARY = `
    "slug": slug.current,
    title,
    excerpt,
    "cover": coverImage.asset->url,
    date,
    "tags": coalesce(tags, []),
    "featured": featured == true
`;
// A journey without a slug has no page to link to.
const JOURNEY_FILTER = `_type == "journey" && defined(slug.current)`;

// Home section: the newest featured journeys.
export async function getJourneysSection(): Promise<JourneysSectionData> {
    const query = `{
        "title": coalesce(*[_type == "journeys"][0].title, "Journeys"),
        "journeys": *[${JOURNEY_FILTER} && featured == true] | order(date desc)[0...${HOME_JOURNEYS}]{${JOURNEY_SUMMARY}}
    }`;
    return await sanityClient.fetch<JourneysSectionData>(query);
}

export async function getJourneysPage(): Promise<JourneysPageData> {
    const query = `{
        ...*[_type == "journeys"][0]{
            title,
            description,
            "heroImage": heroImage.asset->url,
            heroTitle,
            heroSubtitle
        },
        "journeys": *[${JOURNEY_FILTER}] | order(date desc){${JOURNEY_SUMMARY}}
    }`;
    const data = await sanityClient.fetch<JourneysPageData>(query);
    return { ...data, title: data.title || 'Journeys' };
}

export async function getJourney(slug: string): Promise<Journey | null> {
    const query = `*[${JOURNEY_FILTER} && slug.current == $slug][0]{
        ${JOURNEY_SUMMARY},
        "body": coalesce(body, []),
        "older": *[${JOURNEY_FILTER} && date < ^.date] | order(date desc)[0]{"slug": slug.current, title},
        "newer": *[${JOURNEY_FILTER} && date > ^.date] | order(date asc)[0]{"slug": slug.current, title}
    }`;
    return await sanityClient.fetch<Journey | null>(query, { slug });
}

// Fetch About page data
export async function getAboutPage(): Promise<AboutData> {
    const query = `*[_type == "about"][0]{
        title,
        "heroImage": heroImage.asset->url,
        heroTitle,
        heroSubtitle,
        content,
        "team": coalesce(team[]{
        name,
        role,
        bio,
        "image": image.asset->url
        }, [])
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
        "socialLinks": coalesce(socialLinks[]{
            platform,
            url
        }, []),
        formIntro
    }`;
    return await sanityClient.fetch(query);
}