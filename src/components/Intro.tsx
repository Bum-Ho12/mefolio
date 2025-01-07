'use client';

import { motion } from 'framer-motion';
import { MdOutlineMail } from "react-icons/md";
import { IoLogoGithub, IoLogoLinkedin, IoCall } from "react-icons/io5";

export default function Intro({ title, location }: { title: string, location:string }) {
    return (
        <div className="text-center w-full">
            <motion.h1
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-6xl font-bold mb-4"
            >
                Hi 👋🏼
            </motion.h1>
            <motion.h2
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-6xl font-semibold mb-2"
            >
                My name is Bumho Nisubire
            </motion.h2>
            <motion.p
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="text-2xl text-[#FFD3AC]"
            >
                {title}
            </motion.p>
            <motion.p
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="text-2xl"
            >
                {location}
            </motion.p>
            <div className='flex gap-4 justify-center w-full items-center mt-10'>
                <a href="mailto: [email protected]" className="flex items-center justify-center p-2 bg-white rounded-full shadow-lg text-black font-bold">
                    <MdOutlineMail size={20} />
                </a>
                <a href="#" className="flex items-center justify-center p-2 bg-white rounded-full shadow-lg text-black font-bold">
                    <IoLogoGithub size={20} />
                </a>
                <a href="#" className="flex items-center justify-center p-2 bg-white rounded-full shadow-lg text-black font-bold">
                    <IoLogoLinkedin size={20} />
                </a>
                <a href="#" className="flex items-center justify-center p-2 bg-white rounded-full shadow-lg text-black font-bold">
                    <IoCall size={20} />
                </a>
            </div>
        </div>
    );
}
