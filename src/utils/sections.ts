import type { Career, Intro, JourneysSectionData, LinkedProject, Projects, Resume, Skill, Skills, Videos } from './types';
import { isPlayable } from './video';

// The single definition of "this home section has something to show". The home page
// hides sections that fail these checks, and the admin uses the same checks to warn
// that a document will not appear yet.

// The home section shows this many featured journeys; the rest live on /journeys.
export const HOME_JOURNEYS = 3;

const CONTACT_PLATFORMS = ['email', 'linkedin', 'phone'];

export const playableVideos = (videos: Videos) => videos.videos.filter(isPlayable);

export const hasContent = {
    intro: (intro: Intro) => !!intro.name?.trim(),
    career: (career: Career) => career.education.length + career.workExperience.length + career.certifications.length > 0,
    skills: (skills: Skills) => skills.languages.length + skills.frameworks.length + skills.tools.length > 0,
    projects: (projects: Projects) => projects.projects.length > 0,
    journeys: (journeys: JourneysSectionData) => journeys.journeys.length > 0,
    videos: (videos: Videos) => playableVideos(videos).length > 0,
    resume: (resume: Resume) => !!(resume.file?.asset?.url || resume.downloadLink),
    // The inquiries section only renders these three links.
    inquiries: (intro: Intro) => intro.socialLinks.some((link) => link.url && CONTACT_PLATFORMS.includes(link.platform?.toLowerCase())),
};

// ── Skills showcase ────────────────────────────────────────────
// Skills link to the projects they were used in. A project featured in a framework's
// list gets a slide under that framework, and the slide lists every skill linked to the
// project (featured or not). Frameworks without featured links only appear in the
// sphere and rows.

export interface ProjectStack {
    languages: Skill[];
    frameworks: Skill[];
    tools: Skill[];
}

export interface ShowcaseSlide {
    framework: Skill;
    project: LinkedProject;
    stack: ProjectStack;
}

// A project needs a name and something to look at or read.
const showcaseable = (project: LinkedProject) => !!(project.id && project.name?.trim() && (project.image?.url || project.description?.trim()));

export function buildShowcase(skills: Skills): ShowcaseSlide[] {
    const stacks = new Map<string, ProjectStack>();
    for (const group of ['languages', 'frameworks', 'tools'] as const) {
        for (const skill of skills[group]) {
            if (!skill.name?.trim()) continue;
            for (const project of skill.projects ?? []) {
                if (!project.id) continue;
                let stack = stacks.get(project.id);
                if (!stack) stacks.set(project.id, (stack = { languages: [], frameworks: [], tools: [] }));
                // A project linked twice from the same skill is listed once.
                if (!stack[group].includes(skill)) stack[group].push(skill);
            }
        }
    }

    const slides: ShowcaseSlide[] = [];
    for (const framework of skills.frameworks) {
        if (!framework.name?.trim()) continue;
        const seen = new Set<string>();
        for (const project of framework.projects ?? []) {
            if (!project.featured || !showcaseable(project) || seen.has(project.id!)) continue;
            seen.add(project.id!);
            slides.push({ framework, project, stack: stacks.get(project.id!)! });
        }
    }
    return avoidRepeats(slides);
}

// The last slide of one framework and the first of the next can be the same project;
// move the repeat later in its framework's run so the card visibly changes.
function avoidRepeats(slides: ShowcaseSlide[]) {
    const out = [...slides];
    for (let i = 1; i < out.length; i++) {
        if (out[i].project.id !== out[i - 1].project.id) continue;
        const swap = out.findIndex((s, j) => j > i && s.framework === out[i].framework && s.project.id !== out[i - 1].project.id);
        if (swap !== -1) [out[i], out[swap]] = [out[swap], out[i]];
    }
    return out;
}
