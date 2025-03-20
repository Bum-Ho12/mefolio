// src/components/Intro.tsx
'use client';

import { motion } from 'framer-motion';
import { MdOutlineMail  } from "react-icons/md";
import { IoLogoGithub, IoLogoLinkedin, IoCall } from "react-icons/io5";
import { FaDev } from "react-icons/fa";
import { Intro as IntroType } from '@/utils/types';
import MeStorButton from './store/MeStorButton';

export default function Intro({ intro }: { intro: IntroType }) {
    // Find specific social links
    const emailLink = intro.socialLinks.find(link => link.platform.toLowerCase() === 'email')?.url;
    const githubLink = intro.socialLinks.find(link => link.platform.toLowerCase() === 'github')?.url;
    const linkedinLink = intro.socialLinks.find(link => link.platform.toLowerCase() === 'linkedin')?.url;
    const phoneLink = intro.socialLinks.find(link => link.platform.toLowerCase() === 'phone')?.url;
    const devTo = intro.socialLinks.find(link => link.platform.toLowerCase() === 'dev.to')?.url;

    return (
        <div className="text-center w-full min-h-screen flex flex-col justify-center items-center overflow-hidden">
            {/* Main content */}
            <div className="relative z-10">
                <motion.h1
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-6xl font-bold mb-4 text-white"
                >
                    {intro.greeting}
                </motion.h1>
                <motion.h2
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-6xl font-semibold mb-2 text-white"
                >
                    My name is {intro.name}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="text-3xl text-[#FFD3AC]"
                >
                    {intro.title}
                </motion.p>
                <motion.p
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="text-2xl text-white"
                >
                    {intro.location}
                </motion.p>
                <MeStorButton/>
                <div className="flex gap-4 justify-center w-full items-center mt-10">
                    {emailLink && (
                        <a
                            href={emailLink}
                            className="flex items-center justify-center p-2 bg-white rounded-full shadow-lg text-black font-bold hover:bg-gray-100 transition-colors"
                            aria-label="Email"
                        >
                            <MdOutlineMail size={20} />
                        </a>
                    )}
                    {githubLink && (
                        <a
                            href={githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center p-2 bg-white rounded-full shadow-lg text-black font-bold hover:bg-gray-100 transition-colors"
                            aria-label="GitHub"
                        >
                            <IoLogoGithub size={20} />
                        </a>
                    )}
                    {linkedinLink && (
                        <a
                            href={linkedinLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center p-2 bg-white rounded-full shadow-lg text-black font-bold hover:bg-gray-100 transition-colors"
                            aria-label="LinkedIn"
                        >
                            <IoLogoLinkedin size={20} />
                        </a>
                    )}
                    {phoneLink && (
                        <a
                            href={phoneLink}
                            className="flex items-center justify-center p-2 bg-white rounded-full shadow-lg text-black font-bold hover:bg-gray-100 transition-colors"
                            aria-label="Phone"
                        >
                            <IoCall size={20} />
                        </a>
                    )}
                    {devTo && (
                        <a
                            href={devTo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center p-2 bg-white rounded-full shadow-lg text-black font-bold hover:bg-gray-100 transition-colors"
                            aria-label="Dev.to"
                        >
                            <FaDev size={20} />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
