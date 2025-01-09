'use client';

import { Resume } from '@/utils/types';
import { motion } from 'framer-motion';
import { MdOutlineFileDownload } from "react-icons/md";

interface ResumeSectionProps {
    resume: Resume;
}

const ResumeSection: React.FC<ResumeSectionProps> = ({ resume }) => {

    const handleDownload = () => {
        if (resume.file?.asset) {
            window.open(resume.file.asset.url ||resume.downloadLink , '_blank', 'noopener,noreferrer');
        } else {
            console.error('Download link is not provided');
        }
    };

    return (
        <section className="min-h-screen w-full max-w-2xl flex flex-col justify-center items-center gap-6 px-2">
            <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="text-3xl font-semibold mb-6"
            >
                Resume
            </motion.h3>
            {/* text */}
            <motion.p
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-lg text-center"
            >
                Download Resume in PDF format  by clicking the button below
            </motion.p>
            <motion.button
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                onClick={handleDownload}
                className='flex items-center justify-center p-2 bg-[#FFD3AC] align-middle gap-2 px-4 rounded-full shadow-lg text-black font-bold'
            >
                Download Resume
                <MdOutlineFileDownload size={30} />
            </motion.button>
        </section>
    );
}

export default ResumeSection;
