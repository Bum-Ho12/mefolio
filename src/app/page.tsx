// HomeContent.tsx
"use client"

import ClientLayout from "@/components/ClientLayout";
import { getIntro, getCareer, getProjects, getSkills, getResume, getVideos } from "@/services/api/sanity";
import Intro from "@/components/Intro";
import CareerSection from "@/components/CareerSection";
import ResumeSection from "@/components/ResumeSection";
import SkillsSection from "@/components/SkillsSection";
import ProjectSection from "@/components/ProjectSection";
import ContactSection from "@/components/ContactSection";
import VideoSection from "@/components/VideoSection";
import { useEffect, useState } from "react";
import { Career, Intro as IntroType, Projects, Skills, Resume, Videos } from "@/utils/types";
import LoadingScreen from '@/components/LoadingScreen';
import { hasContent, playableVideos } from '@/utils/sections';

interface PageData {
  intro: IntroType;
  career: Career;
  projects: Projects;
  skills: Skills;
  resume: Resume;
  videos: Videos;
}

// What a section gets when its request fails: the same shape as "no content", so the
// section is hidden and the rest of the page still loads.
const EMPTY: PageData = {
  intro: { greeting: '', name: '', title: '', location: '', socialLinks: [] },
  career: { education: [], workExperience: [], certifications: [] },
  projects: { title: '', description: '', projects: [] },
  skills: { languages: [], frameworks: [], tools: [] },
  resume: {},
  videos: { title: 'Videos', videos: [] },
};

export default function HomeContent() {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const fetchers: { [K in keyof PageData]: () => Promise<PageData[K]> } = {
        intro: getIntro,
        career: getCareer,
        projects: getProjects,
        skills: getSkills,
        resume: getResume,
        videos: getVideos,
      };
      const keys = Object.keys(fetchers) as (keyof PageData)[];

      // Track individual fetch progress
      let completedSteps = 0;
      const updateProgress = () => {
        completedSteps++;
        setLoadingProgress((completedSteps / keys.length) * 100);
      };

      // Each section loads independently: one failed request must not block the page.
      const results = await Promise.allSettled(keys.map((key) => fetchers[key]().finally(updateProgress)));

      const data: PageData = { ...EMPTY };
      results.forEach((result, i) => {
        if (result.status === 'fulfilled') Object.assign(data, { [keys[i]]: result.value });
        else console.error(`Error fetching ${keys[i]}:`, result.reason);
      });
      setPageData(data);
    };

    fetchData();
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading || !pageData) {
    return (
      <LoadingScreen
        progress={loadingProgress}
        isDataLoaded={!!pageData}
        onLoadingComplete={handleLoadingComplete}
      />
    );
  }

  const { intro, career, skills, projects, resume } = pageData;
  const videos = { ...pageData.videos, videos: playableVideos(pageData.videos) };

  // A section (and its nav button) only exists while it has content to show.
  const sections = [
    { id: "about", show: hasContent.intro(intro), content: <Intro intro={intro} /> },
    { id: "career", show: hasContent.career(career), content: <CareerSection career={career} /> },
    { id: "skills", show: hasContent.skills(skills), content: <SkillsSection skills={skills} /> },
    { id: "projects", show: hasContent.projects(projects), content: <ProjectSection projects={projects} /> },
    { id: "video", show: videos.videos.length > 0, tall: true, content: <VideoSection videos={videos} /> },
    { id: "resume", show: hasContent.resume(resume), content: <ResumeSection resume={resume} /> },
    { id: "inquiries", show: hasContent.inquiries(intro), content: <ContactSection intro={intro} /> },
  ].filter((section) => section.show);

  return <ClientLayout sections={sections} />;
}
