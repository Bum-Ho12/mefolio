import { hasContent } from '@/utils/sections';
import * as A from './adapters';

type Doc = Record<string, unknown>;

// Uses the same rules as the home page, so the editor can say when a document will not
// appear on the home page yet. Returns null when it would be shown (or the type has no
// visibility rule).
export function hiddenOnSite(type: string, doc: Doc, lookup: A.Lookup): string | null {
    const hidden = (shown: boolean, needs: string) => (shown ? null : `This section is hidden on the site until it has ${needs}.`);
    switch (type) {
        case 'intro':
            return hidden(hasContent.intro(A.toIntro(doc)), 'a name');
        case 'career':
            return hidden(hasContent.career(A.toCareer(doc)), 'at least one education, work or certification entry');
        case 'skills':
            return hidden(hasContent.skills(A.toSkills(doc, lookup)), 'at least one skill');
        case 'projects':
            return hidden(hasContent.projects(A.toProjects(doc, lookup)), 'at least one featured, published project');
        case 'resume':
            return hidden(hasContent.resume(A.toResume(doc)), 'a PDF or a download link');
        case 'journeys':
            return hidden(hasContent.journeys(A.toJourneysSection(doc, lookup)), 'at least one journey marked as featured');
        case 'journey':
            // Still listed on /journeys; only the home section is limited to featured ones.
            return doc.featured === true ? null : 'Not featured: this journey is listed on /journeys but not on the home page.';
        case 'videos':
            return hidden(hasContent.videos(A.toVideos(doc)), 'at least one playable video');
        default:
            return null;
    }
}
