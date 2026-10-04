'use client';

import { Component, useEffect, useState, type ReactNode } from 'react';
import ClientLayout from '@/components/ClientLayout';
import Intro from '@/components/Intro';
import CareerSection from '@/components/CareerSection';
import SkillsSection from '@/components/SkillsSection';
import ProjectSection from '@/components/ProjectSection';
import ResumeSection from '@/components/ResumeSection';
import VideoSection from '@/components/VideoSection';
import JourneysSection from '@/components/JourneysSection';
import ContactSection from '@/components/ContactSection';
import StoreItemPage from '@/components/StoreItemPage';
import AboutView from '@/components/views/AboutView';
import JourneysView from '@/components/views/JourneysView';
import JourneyView from '@/components/views/JourneyView';
import ContactView from '@/components/views/ContactView';
import LegalPageView from '@/components/views/LegalPageView';
import StoreView from '@/components/views/StoreView';
import { getDocType } from '@/lib/content/registry';
import * as A from '@/lib/content/adapters';
import { PREVIEW_MESSAGE, PREVIEW_READY } from './PreviewPane';

interface PreviewState {
    type: string;
    doc: Record<string, unknown>;
    lookup: A.Lookup;
    version: number;
}

// Half-filled content can make a section throw; show a hint instead of a blank frame,
// and retry as soon as the next edit arrives.
class PreviewBoundary extends Component<{ resetKey: number; children: ReactNode }, { error: string | null }> {
    state = { error: null as string | null };
    static getDerivedStateFromError(error: Error) {
        return { error: error.message };
    }
    componentDidUpdate(prev: { resetKey: number }) {
        if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
    }
    render() {
        if (this.state.error) {
            return (
                <div className="flex min-h-screen items-center justify-center p-8 text-center">
                    <div>
                        <p className="font-semibold text-amber-300">This content cannot be previewed yet</p>
                        <p className="mt-2 text-sm text-white/50">Fill in the remaining fields. ({this.state.error})</p>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

// Home-page sections render inside the real ClientLayout so the background,
// scroll container and section sizing match the live site.
const homeSection = (id: string, content: ReactNode, tall = false) => <ClientLayout sections={[{ id, content, tall }]} />;

function render({ type, doc, lookup }: PreviewState): ReactNode {
    switch (type) {
        case 'intro': {
            const intro = A.toIntro(doc);
            return <ClientLayout sections={[{ id: 'about', content: <Intro intro={intro} /> }, { id: 'inquiries', content: <ContactSection intro={intro} /> }]} />;
        }
        case 'career':
            return homeSection('career', <CareerSection career={A.toCareer(doc)} />);
        case 'skills':
            return homeSection('skills', <SkillsSection skills={A.toSkills(doc, lookup)} />);
        case 'projects':
            return homeSection('projects', <ProjectSection projects={A.toProjects(doc, lookup)} />);
        case 'project':
            return homeSection('projects', <ProjectSection projects={{ title: 'Projects', description: '', projects: [A.toProject(doc)] }} />);
        case 'resume':
            return homeSection('resume', <ResumeSection resume={A.toResume(doc)} />);
        case 'videos':
            return homeSection('video', <VideoSection videos={A.toVideos(doc)} />, true);
        case 'journeys':
            // This document titles both the home section and the /journeys page.
            return (
                <>
                    {homeSection('journeys', <JourneysSection journeys={A.toJourneysSection(doc, lookup)} />)}
                    <JourneysView data={A.toJourneysPage(doc, lookup)} />
                </>
            );
        case 'journey':
            return <JourneyView journey={A.toJourney(doc)} />;
        case 'store': {
            const { storeData, items } = A.toStore(doc, lookup);
            return <StoreView storeData={storeData} items={items} />;
        }
        case 'storeItem':
            return <StoreItemPage item={A.toStoreItem(doc, lookup)} />;
        case 'about':
            return <AboutView data={A.toAbout(doc)} />;
        case 'contact':
            return <ContactView contactData={A.toContact(doc)} />;
        case 'privacyPolicy':
            return <LegalPageView data={A.toPrivacyPolicy(doc)} heading="Privacy Policy" />;
        case 'termsConditions':
            return <LegalPageView data={A.toTerms(doc)} heading="Terms & Conditions" />;
        default:
            return null;
    }
}

export default function PreviewRenderer() {
    const [state, setState] = useState<PreviewState | null>(null);

    useEffect(() => {
        // Only the admin editor that embeds this frame may drive it.
        const onMessage = (e: MessageEvent) => {
            if (e.origin !== window.location.origin || e.source !== window.parent) return;
            const data = e.data;
            if (data?.kind !== PREVIEW_MESSAGE || typeof data.type !== 'string' || !getDocType(data.type)) return;
            if (typeof data.doc !== 'object' || data.doc === null) return;
            setState((prev) => ({ type: data.type, doc: data.doc, lookup: data.lookup ?? {}, version: (prev?.version ?? 0) + 1 }));
        };
        window.addEventListener('message', onMessage);
        if (window.parent !== window) window.parent.postMessage({ kind: PREVIEW_READY }, window.location.origin);
        return () => window.removeEventListener('message', onMessage);
    }, []);

    if (!state) {
        return <div className="flex min-h-screen items-center justify-center text-sm text-white/40">Waiting for editor…</div>;
    }

    // Keyed on type only, so components keep their state while the document is edited.
    return (
        <PreviewBoundary resetKey={state.version}>
            <div key={state.type}>{render(state)}</div>
        </PreviewBoundary>
    );
}
