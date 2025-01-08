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
import { Career, Intro as IntroType, Projects, Skills } from "@/utils/types"; // Adjust import path as needed

interface PageData {
  intro: IntroType;
  career: Career;
  projects: Projects;
  skills: Skills;
  resume: {
    downloadLink: string;
  };
}

export default function HomeContent() {
  const [pageData, setPageData] = useState<PageData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [intro, career, projects, skills, resume] = await Promise.all([
          getIntro(),
          getCareer(),
          getProjects(),
          getSkills(),
          getResume()
        ]);

        setPageData({ intro, career, projects, skills, resume });
      } catch (error) {
        console.error('Error fetching data:', error);
        // Add error state handling here
      }
    };

    fetchData();
  }, []);

  if (!pageData) return (
    <div className="h-screen flex items-center justify-center">
      <div>Loading...</div>
    </div>
  );

  const sections = [
    { id: "about", content: <Intro intro={pageData.intro} /> },
    { id: "career", content: <CareerSection career={pageData.career} /> },
    { id: "skills", content: <SkillsSection skills={pageData.skills} /> },
    { id: "projects", content: <ProjectSection projects={pageData.projects} /> },
    { id: "resume", content: <ResumeSection downloadLink={pageData.resume.downloadLink} /> },
    { id: "inquiries", content: <ContactSection intro={pageData.intro} /> },
  ];

  return <ClientLayout sections={sections} />;
}