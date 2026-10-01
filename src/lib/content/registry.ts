import type { DocTypeDef, Field } from './fields';

const hero: Field[] = [
    { kind: 'string', name: 'title', title: 'Title', required: true },
    { kind: 'image', name: 'heroImage', title: 'Hero image' },
    { kind: 'string', name: 'heroTitle', title: 'Hero title' },
    { kind: 'string', name: 'heroSubtitle', title: 'Hero subtitle' },
];

const socialLinks: Field = {
    kind: 'objects',
    name: 'socialLinks',
    title: 'Social links',
    description: 'Intro looks up platforms named email, github, linkedin, phone and dev.to (case-insensitive).',
    itemTitle: 'platform',
    itemSubtitle: 'url',
    of: [
        { kind: 'string', name: 'platform', title: 'Platform', required: true },
        { kind: 'url', name: 'url', title: 'URL', required: true, description: 'https://, mailto: or tel:' },
    ],
};

const skillList = (name: string, title: string): Field => ({
    kind: 'objects',
    name,
    title,
    itemTitle: 'name',
    of: [
        { kind: 'string', name: 'name', title: 'Name', required: true },
        { kind: 'image', name: 'icon', title: 'Icon' },
    ],
});

export const DOC_TYPES: DocTypeDef[] = [
    // ── Portfolio ──────────────────────────────────────────────
    {
        type: 'intro',
        title: 'Intro',
        group: 'Portfolio',
        singleton: true,
        titleField: 'name',
        paths: ['/'],
        fields: [
            { kind: 'string', name: 'greeting', title: 'Greeting' },
            { kind: 'string', name: 'name', title: 'Name', required: true },
            { kind: 'text', name: 'title', title: 'Title / tagline', rows: 3 },
            { kind: 'string', name: 'location', title: 'Location' },
            socialLinks,
        ],
    },
    {
        type: 'career',
        title: 'Career',
        group: 'Portfolio',
        singleton: true,
        paths: ['/'],
        fields: [
            {
                kind: 'objects', name: 'workExperience', title: 'Work experience', itemTitle: 'role', itemSubtitle: 'company',
                of: [
                    { kind: 'string', name: 'role', title: 'Role', required: true },
                    { kind: 'string', name: 'company', title: 'Company', required: true },
                    { kind: 'date', name: 'startDate', title: 'Start date', required: true },
                    { kind: 'date', name: 'endDate', title: 'End date', description: 'Leave empty if current' },
                    { kind: 'text', name: 'description', title: 'Description', rows: 4 },
                ],
            },
            {
                kind: 'objects', name: 'education', title: 'Education', itemTitle: 'degree', itemSubtitle: 'institution',
                of: [
                    { kind: 'string', name: 'degree', title: 'Degree', required: true },
                    { kind: 'string', name: 'institution', title: 'Institution', required: true },
                    { kind: 'string', name: 'year', title: 'Year' },
                ],
            },
            {
                kind: 'objects', name: 'certifications', title: 'Certifications', itemTitle: 'name', itemSubtitle: 'institution',
                of: [
                    { kind: 'string', name: 'name', title: 'Name', required: true },
                    { kind: 'string', name: 'institution', title: 'Institution' },
                    { kind: 'string', name: 'year', title: 'Year' },
                ],
            },
        ],
    },
    {
        type: 'skills',
        title: 'Skills',
        group: 'Portfolio',
        singleton: true,
        paths: ['/'],
        fields: [skillList('languages', 'Languages'), skillList('frameworks', 'Frameworks'), skillList('tools', 'Tools')],
    },
    {
        type: 'projects',
        title: 'Projects section',
        group: 'Portfolio',
        singleton: true,
        titleField: 'title',
        previewDeps: ['project'],
        paths: ['/'],
        fields: [
            { kind: 'string', name: 'title', title: 'Title' },
            { kind: 'text', name: 'description', title: 'Description', rows: 3 },
            { kind: 'references', name: 'projects', title: 'Projects (in display order)', to: 'project' },
        ],
    },
    {
        type: 'project',
        title: 'Project',
        group: 'Portfolio',
        singleton: false,
        titleField: 'name',
        subtitleField: 'description',
        imageField: 'image',
        paths: ['/'],
        fields: [
            { kind: 'string', name: 'name', title: 'Name', required: true },
            { kind: 'text', name: 'description', title: 'Description', rows: 4 },
            { kind: 'image', name: 'image', title: 'Image' },
            { kind: 'url', name: 'projectUrl', title: 'Project URL' },
            { kind: 'url', name: 'githubUrl', title: 'GitHub URL' },
        ],
    },
    {
        type: 'resume',
        title: 'Resume',
        group: 'Portfolio',
        singleton: true,
        paths: ['/'],
        fields: [
            { kind: 'file', name: 'file', title: 'Resume PDF', accept: 'pdf' },
            { kind: 'url', name: 'downloadLink', title: 'Download link', description: 'Fallback link if no file is uploaded' },
        ],
    },
    {
        type: 'videos',
        title: 'Videos',
        group: 'Portfolio',
        singleton: true,
        titleField: 'title',
        paths: ['/'],
        fields: [
            { kind: 'string', name: 'title', title: 'Section title', required: true },
            {
                kind: 'objects', name: 'videos', title: 'Videos', itemTitle: 'title', itemSubtitle: 'publicId',
                of: [
                    { kind: 'string', name: 'title', title: 'Title', required: true },
                    { kind: 'videoSource', name: 'publicId', title: 'Video source', urlField: 'url', description: 'A Cloudinary public id, a direct https link to a video file, or a YouTube/Vimeo link.' },
                    { kind: 'videoUrl', name: 'url', title: 'Video link', hidden: true },
                    { kind: 'image', name: 'poster', title: 'Poster image', description: 'Shown before a linked video loads. Not needed for Cloudinary videos.' },
                    { kind: 'text', name: 'description', title: 'Description', rows: 2 },
                ],
            },
        ],
    },

    // ── Store ──────────────────────────────────────────────────
    {
        type: 'store',
        title: 'Store page',
        group: 'Store',
        singleton: true,
        titleField: 'title',
        previewDeps: ['storeItem'],
        paths: ['/store'],
        fields: [
            ...hero,
            { kind: 'text', name: 'description', title: 'Description', rows: 3 },
            { kind: 'references', name: 'items', title: 'Items', to: 'storeItem' },
        ],
    },
    {
        type: 'storeItem',
        title: 'Store item',
        group: 'Store',
        singleton: false,
        titleField: 'name',
        subtitleField: 'category',
        imageField: 'mainImage',
        previewDeps: ['privacyPolicy'],
        paths: ['/store'],
        fields: [
            { kind: 'string', name: 'name', title: 'Name', required: true },
            { kind: 'slug', name: 'id', title: 'Slug (URL id)', source: 'name', required: true },
            {
                kind: 'select', name: 'category', title: 'Category', required: true,
                options: [{ value: 'app', label: 'App' }, { value: 'game', label: 'Game' }, { value: 'merch', label: 'Merch' }],
            },
            { kind: 'text', name: 'description', title: 'Description', rows: 5 },
            { kind: 'number', name: 'price', title: 'Price', min: 0, step: 0.01 },
            { kind: 'image', name: 'mainImage', title: 'Main image' },
            { kind: 'images', name: 'images', title: 'Gallery' },
            { kind: 'boolean', name: 'inStock', title: 'In stock' },
            { kind: 'boolean', name: 'featured', title: 'Featured' },
            { kind: 'date', name: 'releaseDate', title: 'Release date' },
            { kind: 'tags', name: 'platform', title: 'Platforms', suggestions: ['android', 'ios', 'web', 'windows', 'macos', 'linux'] },
            { kind: 'url', name: 'appStoreUrl', title: 'App Store URL' },
            { kind: 'url', name: 'playStoreUrl', title: 'Play Store URL' },
            { kind: 'url', name: 'webAppUrl', title: 'Web app URL' },
            { kind: 'url', name: 'downloadUrl', title: 'Download URL' },
            { kind: 'string', name: 'version', title: 'Version' },
            { kind: 'tags', name: 'features', title: 'Features' },
            { kind: 'reference', name: 'privacyPolicy', title: 'Privacy policy', to: 'privacyPolicy' },
            { kind: 'tags', name: 'size', title: 'Sizes (merch)', suggestions: ['xs', 's', 'm', 'l', 'xl', 'xxl'] },
            {
                kind: 'objects', name: 'color', title: 'Colors (merch)', itemTitle: 'name', itemSubtitle: 'hex',
                of: [
                    { kind: 'string', name: 'name', title: 'Name', required: true },
                    { kind: 'color', name: 'hex', title: 'Hex', required: true },
                ],
            },
            { kind: 'string', name: 'material', title: 'Material (merch)' },
            { kind: 'number', name: 'weight', title: 'Weight (merch)', min: 0, step: 0.01 },
        ],
    },

    // ── Pages ──────────────────────────────────────────────────
    {
        type: 'about',
        title: 'About page',
        group: 'Pages',
        singleton: true,
        titleField: 'title',
        paths: ['/about'],
        fields: [
            ...hero,
            { kind: 'blocks', name: 'content', title: 'Content' },
            {
                kind: 'objects', name: 'team', title: 'Team', itemTitle: 'name', itemSubtitle: 'role',
                of: [
                    { kind: 'string', name: 'name', title: 'Name', required: true },
                    { kind: 'string', name: 'role', title: 'Role' },
                    { kind: 'text', name: 'bio', title: 'Bio', rows: 3 },
                    { kind: 'image', name: 'image', title: 'Photo' },
                ],
            },
        ],
    },
    {
        type: 'contact',
        title: 'Contact page',
        group: 'Pages',
        singleton: true,
        titleField: 'title',
        paths: ['/contact'],
        fields: [
            ...hero,
            { kind: 'email', name: 'email', title: 'Email' },
            { kind: 'string', name: 'phone', title: 'Phone' },
            { kind: 'text', name: 'address', title: 'Address', rows: 3 },
            socialLinks,
            { kind: 'text', name: 'formIntro', title: 'Form intro', rows: 2 },
        ],
    },
    {
        // Not a singleton: the /privacy page shows the first one, and store items can
        // reference their own policy.
        type: 'privacyPolicy',
        title: 'Privacy policy',
        group: 'Pages',
        singleton: false,
        titleField: 'title',
        subtitleField: 'heroTitle',
        paths: ['/privacy', '/store'],
        fields: [...hero, { kind: 'date', name: 'lastUpdated', title: 'Last updated' }, { kind: 'blocks', name: 'content', title: 'Content' }],
    },
    {
        type: 'termsConditions',
        title: 'Terms & conditions',
        group: 'Pages',
        singleton: true,
        titleField: 'title',
        paths: ['/terms&conditions'],
        fields: [...hero, { kind: 'date', name: 'lastUpdated', title: 'Last updated' }, { kind: 'blocks', name: 'content', title: 'Content' }],
    },
];

const byType = new Map(DOC_TYPES.map((d) => [d.type, d]));

export function getDocType(type: string): DocTypeDef | undefined {
    return byType.get(type);
}

export const DOC_GROUPS = ['Portfolio', 'Store', 'Pages'] as const;
