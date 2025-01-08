"use client";

import { motion } from "framer-motion";
import { MdOutlineMail } from "react-icons/md";
import { IoLogoLinkedin, IoCall } from "react-icons/io5";
import { Intro as IntroType } from "@/utils/types";

export default function ContactSection({ intro }: { intro: IntroType }) {


    // Extract social links
    const emailLink = intro.socialLinks.find(link => link.platform.toLowerCase() === 'email')?.url;
    const linkedinLink = intro.socialLinks.find(link => link.platform.toLowerCase() === 'linkedin')?.url;
    const phoneLink = intro.socialLinks.find(link => link.platform.toLowerCase() === 'phone')?.url;

    return (
        <section className="flex flex-col h-screen bg-black w-full items-center justify-around overflow-y-auto max-h-screen scrollbar-hide pt-24 px-4 pb-10 gap-4">
            <motion.h3 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="text-4xl font-semibold mb-6">
                Get in touch
            </motion.h3>

            <motion.p initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="text-xl text-center lg:w-1/2">
                Reach out to me for any inquiries, collaborations, or just to say hi!
            </motion.p>

            <motion.p initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="text-lg font-thin italic text-center lg:w-1/2">
                My contact information is below.
            </motion.p>

            <div className="flex gap-4 justify-center items-center">
                {emailLink && (
                <a href={emailLink} className="p-2 bg-white rounded-full shadow-lg text-black hover:bg-gray-100">
                    <MdOutlineMail size={20} />
                </a>
                )}
                {linkedinLink && (
                <a href={linkedinLink} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full shadow-lg text-black hover:bg-gray-100">
                    <IoLogoLinkedin size={20} />
                </a>
                )}
                {phoneLink && (
                <a href={phoneLink} className="p-2 bg-white rounded-full shadow-lg text-black hover:bg-gray-100">
                    <IoCall size={20} />
                </a>
                )}
            </div>

            <p className="text-sm text-gray-400 mt-10">
                This <span className="font-semibold">MeFolio</span> portfolio template is publicly available on GitHub. You can find the repository{" "}
                <a
                    href="https://github.com/Bum-Ho12/mefolio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline hover:text-blue-400 ml-1"
                >
                    here
                </a>.
            </p>
            <p className="text-sm text-gray-400">
                Built with <span className="font-semibold">NEXT.js</span> and <span className="font-semibold">Sanity</span>.
            </p>

            <p className="text-sm text-gray-400  mt-10">
                &copy; {new Date().getFullYear()} Bumho Nisubire. All rights reserved.
            </p>
        </section>
    );
}
