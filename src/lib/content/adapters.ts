import { assetUrl } from '@/lib/sanity/config';
import type {
    AboutData, Career, ContactData, Intro, PrivacyPolicyData, Project, Projects, Resume, Skills, StoreData, StoreItem,
    TermsConditionsData, Videos,
} from '@/utils/types';

// Converts raw editor documents into the shapes produced by the GROQ projections in
// services/api/sanity.ts, so preview components receive exactly what the site does.

type Doc = Record<string, unknown>;
export type Lookup = Record<string, Doc>;

const str = (v: unknown) => (typeof v === 'string' ? v : '');
const arr = <T = Doc>(v: unknown) => (Array.isArray(v) ? (v as T[]) : []);
const imageUrl = (v: unknown) => assetUrl((v as { asset?: { _ref?: string } } | undefined)?.asset?._ref);
const deref = (v: unknown, lookup: Lookup) => lookup[(v as { _ref?: string } | undefined)?._ref ?? ''];

export const toIntro = (d: Doc): Intro => ({
    greeting: str(d.greeting),
    name: str(d.name),
    title: str(d.title),
    location: str(d.location),
    socialLinks: arr(d.socialLinks).map((l) => ({ platform: str(l.platform), url: str(l.url) })),
});

export const toCareer = (d: Doc): Career => ({
    education: arr(d.education).map((e) => ({ degree: str(e.degree), institution: str(e.institution), year: str(e.year) })),
    workExperience: arr(d.workExperience).map((w) => ({
        role: str(w.role),
        company: str(w.company),
        startDate: str(w.startDate),
        endDate: str(w.endDate) || undefined,
        description: str(w.description) || undefined,
    })),
    certifications: arr(d.certifications).map((c) => ({ name: str(c.name), institution: str(c.institution), year: str(c.year) })),
});

const skillList = (v: unknown) =>
    arr(v).map((s) => {
        const url = imageUrl(s.icon);
        return { name: str(s.name), icon: url ? { url } : undefined };
    });

export const toSkills = (d: Doc): Skills => ({
    languages: skillList(d.languages),
    frameworks: skillList(d.frameworks),
    tools: skillList(d.tools),
});

export const toProject = (d: Doc): Project => {
    const url = imageUrl(d.image);
    return {
        name: str(d.name),
        description: str(d.description),
        image: url ? { url } : undefined,
        projectUrl: str(d.projectUrl) || undefined,
        githubUrl: str(d.githubUrl) || undefined,
    };
};

export const toProjects = (d: Doc, lookup: Lookup): Projects => ({
    title: str(d.title),
    description: str(d.description),
    projects: arr(d.projects).map((r) => deref(r, lookup)).filter(Boolean).map(toProject),
});

export const toResume = (d: Doc): Resume => {
    const url = assetUrl((d.file as { asset?: { _ref?: string } } | undefined)?.asset?._ref);
    return { file: url ? { asset: { url } } : undefined, downloadLink: str(d.downloadLink) || undefined };
};

export const toVideos = (d: Doc): Videos => ({
    title: str(d.title),
    videos: arr(d.videos)
        .filter((v) => str(v.publicId))
        .map((v) => ({ title: str(v.title), publicId: str(v.publicId), description: str(v.description) || undefined })),
});

export const toPrivacyPolicy = (d: Doc): PrivacyPolicyData => ({
    _id: str(d._id),
    title: str(d.title),
    heroImage: imageUrl(d.heroImage) ?? '',
    heroTitle: str(d.heroTitle),
    heroSubtitle: str(d.heroSubtitle),
    lastUpdated: str(d.lastUpdated),
    content: arr(d.content),
});

export const toTerms = (d: Doc): TermsConditionsData => ({
    ...toPrivacyPolicy(d),
    content: arr(d.content) as unknown as TermsConditionsData['content'],
});

export const toStoreItem = (d: Doc, lookup: Lookup): StoreItem => {
    const policy = deref(d.privacyPolicy, lookup);
    return {
        id: { current: str((d.id as { current?: string } | undefined)?.current), _type: 'slug' },
        name: str(d.name),
        description: str(d.description),
        price: typeof d.price === 'number' ? d.price : 0,
        mainImage: imageUrl(d.mainImage) ?? '',
        images: arr(d.images).map(imageUrl).filter((u): u is string => !!u),
        inStock: d.inStock === true,
        category: (['app', 'game', 'merch'].includes(str(d.category)) ? d.category : 'app') as StoreItem['category'],
        featured: d.featured === true,
        releaseDate: str(d.releaseDate) || undefined,
        platform: arr<string>(d.platform),
        appStoreUrl: str(d.appStoreUrl) || undefined,
        playStoreUrl: str(d.playStoreUrl) || undefined,
        webAppUrl: str(d.webAppUrl) || undefined,
        downloadUrl: str(d.downloadUrl) || undefined,
        version: str(d.version) || undefined,
        features: arr<string>(d.features),
        privacyPolicy: policy ? toPrivacyPolicy(policy) : undefined,
        size: arr<string>(d.size),
        color: arr(d.color).map((c) => ({ name: str(c.name), hex: str(c.hex) })),
        material: str(d.material) || undefined,
        weight: typeof d.weight === 'number' ? d.weight : undefined,
    };
};

// The live store grid lists every published item (featured first, newest first).
export const toStore = (d: Doc, lookup: Lookup): { storeData: StoreData; items: StoreItem[] } => {
    const items = Object.values(lookup)
        .filter((doc) => doc._type === 'storeItem')
        .map((doc) => toStoreItem(doc, lookup))
        .sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || (b.releaseDate ?? '').localeCompare(a.releaseDate ?? ''));
    return {
        storeData: {
            title: str(d.title),
            description: str(d.description) || undefined,
            heroImage: imageUrl(d.heroImage) ?? '',
            heroTitle: str(d.heroTitle),
            heroSubtitle: str(d.heroSubtitle),
            items,
        },
        items,
    };
};

export const toAbout = (d: Doc): AboutData => ({
    title: str(d.title),
    heroImage: imageUrl(d.heroImage) ?? '',
    heroTitle: str(d.heroTitle),
    heroSubtitle: str(d.heroSubtitle),
    content: arr(d.content) as unknown as AboutData['content'],
    team: arr(d.team).map((m) => ({ name: str(m.name), role: str(m.role), bio: str(m.bio), image: imageUrl(m.image) ?? '' })),
});

export const toContact = (d: Doc): ContactData => ({
    title: str(d.title),
    heroImage: imageUrl(d.heroImage) ?? '',
    heroTitle: str(d.heroTitle),
    heroSubtitle: str(d.heroSubtitle),
    email: str(d.email),
    phone: str(d.phone),
    address: str(d.address),
    socialLinks: arr(d.socialLinks).map((l) => ({ platform: str(l.platform), url: str(l.url) })),
    formIntro: str(d.formIntro),
});
