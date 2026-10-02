
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
    file?: {
        asset: {
            url: string; // URL for the uploaded file
        };
    };
    downloadLink?: string; // Optional manual download link
}


export interface StoreItem {
    id: {
        current: string;
        _type: string;
    };
    name: string;
    description: string;
    price: number;
    mainImage: string;
    images?: string[];
    inStock: boolean;
    category: 'app' | 'game' | 'merch';
    featured?: boolean;
    releaseDate?: string;

    // App and Game specific fields
    platform?: string[];
    appStoreUrl?: string;
    playStoreUrl?: string;
    webAppUrl?: string;
    downloadUrl?: string;
    version?: string;
    features?: string[];

    // New Privacy Policy Reference
    privacyPolicy?: PrivacyPolicyData;

    // Merch specific fields
    size?: string[];
    color?: Array<{
        name: string;
        hex: string;
    }>;
    material?: string;
    weight?: number;
}

export interface StoreData {
    title: string;
    description?: string;
    heroTitle: string;
    heroSubtitle: string;
    heroImage: string;
    items: StoreItem[];
}

// Interface for About Page data
export interface AboutData {
    title: string;
    heroImage: string;
    heroTitle: string;
    heroSubtitle: string;
    content: string|number[];
    team: {
        name: string;
        role: string;
        bio: string;
        image: string;
    }[];
}

// Interface for Privacy Policy data
export interface PrivacyPolicyData {
    _id: string;
    title: string;
    heroImage: string;
    heroTitle: string;
    heroSubtitle: string;
    lastUpdated: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content: any[];
}

// Interface for Terms & Conditions data
export interface TermsConditionsData {
    title: string;
    heroImage: string;
    heroTitle: string;
    heroSubtitle: string;
    lastUpdated: string;
    content: string|number[];
}

// Interface for Contact page data
export interface ContactData {
    title: string;
    heroImage: string;
    heroTitle: string;
    heroSubtitle: string;
    email: string;
    phone: string;
    address: string;
    socialLinks: {
        platform: string;
        url: string;
    }[];
    formIntro: string;
}

// A video comes from exactly one source: a Cloudinary public id, or an https link
// (a direct file, or a YouTube/Vimeo page). See utils/video.ts.
export interface VideoItem {
    _key?: string;
    title: string;
    publicId?: string;
    url?: string;
    // Still image shown before a linked file loads (Cloudinary generates its own).
    poster?: string;
    description?: string;
}

export interface Videos {
    title: string;
    videos: VideoItem[];
}

// A journey's card data, used by the home section and the /journeys list.
export interface JourneySummary {
    slug: string;
    title: string;
    excerpt?: string;
    cover?: string;
    date: string;
    tags: string[];
    featured: boolean;
}

export interface JourneyLink {
    slug: string;
    title: string;
}

// `body` is raw Portable Text: paragraphs mixed with the media blocks declared in
// lib/content/blocks.ts. Asset URLs are derived from the refs when rendering.
export interface Journey extends JourneySummary {
    body: unknown[];
    older?: JourneyLink;
    newer?: JourneyLink;
}

// Home section: at most three featured journeys.
export interface JourneysSectionData {
    title: string;
    journeys: JourneySummary[];
}

export interface JourneysPageData {
    title: string;
    description?: string;
    heroImage?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    journeys: JourneySummary[];
}
