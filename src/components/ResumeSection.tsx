import React, { useState, useRef, useEffect } from 'react';
import { Resume } from '@/utils/types';
import { motion, AnimatePresence } from 'framer-motion';
import { MdOutlineFileDownload } from "react-icons/md";
import { Eye, EyeOff, X } from 'lucide-react';

interface ResumeSectionProps {
    resume: Resume;
}

const ResumeSection: React.FC<ResumeSectionProps> = ({ resume }) => {
    const [showPreview, setShowPreview] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (previewRef.current && !previewRef.current.contains(event.target as Node)) {
                setShowPreview(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (showPreview && window.innerWidth < 768) {
            previewRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [showPreview]);

    const handleDownload = () => {
        if (resume.file?.asset) {
            window.open(resume.file.asset.url || resume.downloadLink, '_blank', 'noopener,noreferrer');
        } else {
            console.error('Download link is not provided');
        }
    };

    return (
        <div className="h-full w-full items-center overflow-y-auto max-h-screen scrollbar-hide pt-24 px-4 pb-10" ref={sectionRef}>
            <div className={`flex flex-col max-w-6xl mx-auto md:flex-row gap-6 transition-all duration-300 lg:mt-10 justify-center`}>
                {/* Main Content */}
                <motion.div
                    layout
                    className={`flex flex-col items-center gap-6 ${showPreview ? 'md:w-5/12' : 'w-full max-w-4xl mx-auto'}`}
                >
                    <motion.h3
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="text-3xl font-semibold mb-6 mt-24 lg:mt-0"
                    >
                        Resume
                    </motion.h3>

                    {/* Preview Toggle Button */}
                    {!showPreview && (
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            onClick={() => setShowPreview(true)}
                            className="flex items-center gap-2 px-4 py-2 mb-10 lg:mb-0 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                        >
                        {showPreview ? (
                            <>
                                <EyeOff size={20} />
                                Hide Preview
                            </>
                        ) : (
                            <>
                                <Eye size={20} />
                                Show Preview
                            </>
                        )}
                        </motion.button>
                    )}

                    {/* Download Button */}
                    <motion.button
                        initial={{ opacity: 0, x: -60 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        onClick={handleDownload}
                        className="flex items-center justify-center p-2 bg-[#FFD3AC] align-middle gap-2 px-4 rounded-full shadow-lg text-black font-bold hover:bg-[#FFE1C4] transition-colors mt-4"
                    >
                        Download Resume
                        <MdOutlineFileDownload size={30} />
                    </motion.button>
                </motion.div>

                {/* PDF Preview */}
                <AnimatePresence>
                    {showPreview && (
                        <motion.div
                            ref={previewRef}
                            initial={{ opacity: 0, x: 300 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 300 }}
                            transition={{ duration: 0.3 }}
                            className="w-full md:w-6/12 bg-transparent rounded-lg shadow-xl overflow-hidden relative"
                        >
                            {/* Close button */}
                            <button
                                onClick={() => setShowPreview(false)}
                                className="absolute top-2 right-2 p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors z-10"
                                aria-label="Close preview"
                            >
                                <X size={20} />
                            </button>

                            <div className="w-full h-[75vh] md:h-[450px] rounded-3xl overflow-hidden relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/10 rounded-3xl" />
                                <div className='relative p-6 rounded-xl h-full flex flex-col '>
                                    <iframe
                                        src={resume.file?.asset?.url || resume.downloadLink}
                                        title="Resume"
                                        className="w-full h-full rounded-xl bg-transparent"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default ResumeSection;