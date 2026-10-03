import type { Career, Intro, JourneysSectionData, Projects, Resume, Skills, Videos } from './types';
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
