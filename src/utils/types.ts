
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
    title: string;
    heroImage: string;
    heroTitle: string;
    heroSubtitle: string;
    lastUpdated: string;
    content: string|number[];
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
