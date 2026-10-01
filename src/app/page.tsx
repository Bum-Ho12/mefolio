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

interface PageData {
  intro: IntroType;
  career: Career;
  projects: Projects;
  skills: Skills;
  resume: Resume;
  videos: Videos;
}

export default function HomeContent() {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Track individual fetch progress
        const totalSteps = 6; // One for each fetch
        let completedSteps = 0;

        const updateProgress = () => {
          completedSteps++;
          setLoadingProgress((completedSteps / totalSteps) * 100);
        };

        // Fetch all data with progress tracking
        const [intro, career, projects, skills, resume, videos] = await Promise.all([
          getIntro().then(res => { updateProgress(); return res; }),
          getCareer().then(res => { updateProgress(); return res; }),
          getProjects().then(res => { updateProgress(); return res; }),
          getSkills().then(res => { updateProgress(); return res; }),
          getResume().then(res => { updateProgress(); return res; }),
          getVideos().then(res => { updateProgress(); return res; })
        ]);

        setPageData({ intro, career, projects, skills, resume, videos });
      } catch (error) {
        console.error('Error fetching data:', error);
        // Add error state handling here
      }
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

  const sections = [
    { id: "about", content: <Intro intro={pageData.intro} /> },
    { id: "career", content: <CareerSection career={pageData.career} /> },
    { id: "skills", content: <SkillsSection skills={pageData.skills} /> },
    { id: "projects", content: <ProjectSection projects={pageData.projects} /> },
    { id: "video", tall: true, content: <VideoSection videos={pageData.videos} /> },
    { id: "resume", content: <ResumeSection resume={pageData.resume} /> },
    { id: "inquiries", content: <ContactSection intro={pageData.intro} /> },
  ];

  return <ClientLayout sections={sections} />;
}