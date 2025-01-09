// HomeContent.tsx
"use client"

import ClientLayout from "@/components/ClientLayout";
import { getIntro, getCareer, getProjects, getSkills, getResume } from "@/services/api/sanity";
import Intro from "@/components/Intro";
import CareerSection from "@/components/CareerSection";
import ResumeSection from "@/components/ResumeSection";
import SkillsSection from "@/components/SkillsSection";
import ProjectSection from "@/components/ProjectSection";
import ContactSection from "@/components/ContactSection";
import { useEffect, useState } from "react";
import { Career, Intro as IntroType, Projects, Skills, Resume } from "@/utils/types"; // Adjust import path as needed
import LoadingScreen from '@/components/LoadingScreen';

interface PageData {
  intro: IntroType;
  career: Career;
  projects: Projects;
  skills: Skills;
  resume: Resume;
}

export default function HomeContent() {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Track individual fetch progress
        const totalSteps = 5; // One for each fetch
        let completedSteps = 0;

        const updateProgress = () => {
          completedSteps++;
          setLoadingProgress((completedSteps / totalSteps) * 100);
        };

        // Fetch all data with progress tracking
        const [intro, career, projects, skills, resume] = await Promise.all([
          getIntro().then(res => { updateProgress(); return res; }),
          getCareer().then(res => { updateProgress(); return res; }),
          getProjects().then(res => { updateProgress(); return res; }),
          getSkills().then(res => { updateProgress(); return res; }),
          getResume().then(res => { updateProgress(); return res; })
        ]);

        setPageData({ intro, career, projects, skills, resume });
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
    { id: "resume", content: <ResumeSection resume={pageData.resume} /> },
    { id: "inquiries", content: <ContactSection intro={pageData.intro} /> },
  ];

  return <ClientLayout sections={sections} />;
}