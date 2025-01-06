import ClientLayout from "@/components/ClientLayout";
import './globals.css'
import Section from "@/components/Section";
import Intro from "@/components/Intro";
import CareerSection from "@/components/CareerSection";
import ResumeSection from "@/components/ResumeSection";
import SkillsGlobeCanvas from "@/components/Tag";
import { Tag } from "react-3d-tag-sphere";

export const metadata = {
  title: "MeFolio",
  description: "Bumho Nisubire Portfolio",
};

export default function RootLayout() {
  const projects = ['Budget Tracker', 'Weather App', 'E-commerce App', 'Blog App'];
  const skills:Tag[] = [
    { src: 'logos/python.svg', size: 40 },
    { src: 'logos/javascript.svg', size: 40 },
    { src: 'logos/react.svg', size: 40 },
    { src: 'logos/nextjs.svg', size: 40 },
    { src: 'logos/node.svg', size: 40 },
    { src: 'logos/postgresql.svg', size: 40 },
    { src: 'logos/django.svg', size: 40 },
    { src: 'logos/flutter.svg', size: 40 },
    { src: 'logos/firebase.svg', size: 40 },
    { src: 'logos/figma.svg', size: 40 },
    { src: 'logos/dart.svg', size: 40 },
    { src: 'logos/flask.svg', size: 40 },
    { src: 'logos/expo.svg', size: 40 },
    { src: 'logos/pandas.svg', size: 40 },
    { src: 'logos/powerpoint.svg', size: 40 },
    { src: 'logos/reactnative.svg', size: 40 },
    { src: 'logos/sqlite.svg', size: 40 },
    { src: 'logos/jupyter.svg', size: 40 },
    { src: 'logos/googlecloud.svg', size: 40 },
    { src: 'logos/github.svg', size: 40 },
    { src: 'logos/excel.svg', size: 40 },
    { src: 'logos/aws.svg', size: 40 },
    { src: 'logos/androidstudio.svg', size: 40 },
    { src: 'logos/nest.svg', size: 40 },
    { src: 'logos/vscode.svg', size: 40 },
  ];

  const sections = [
    { id: "about", content: <Intro title="A Software Engineer and UI/UX Designer" location="based in Nairobi, Kenya."  /> },
    { id: "career", content: <CareerSection/> },
    { id: "skills", content: <SkillsGlobeCanvas tags={skills}/> },
    { id: "projects", content: <Section items={projects} title="Projects"/> },
    { id: "resume", content: <ResumeSection /> },
    { id: "inquiries", content: <p>Contact Me</p> },
  ];

  return (
    <html lang="en">
      <body className="bg-black text-white font-sans">
        <ClientLayout sections={sections} />
      </body>
    </html>
  );
}
