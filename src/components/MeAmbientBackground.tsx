import React from 'react';
import { motion } from 'framer-motion';

// The glow layers are fixed behind the page, so the content keeps its normal
// document flow and stays fully scrollable however tall it gets.
const MeAmbientBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden bg-black">
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
                {/* Ambient Background */}
                <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{
                        scale: [1.1, 1],
                        opacity: [0, 0.6],
                    }}
                    transition={{
                        duration: 2,
                        ease: "easeOut",
                    }}
                    style={{
                        background: 'radial-gradient(circle at center, rgba(59,130,246,0.6) 0%, rgba(0,0,0,1) 70%)',
                    }}
                />

                {/* Secondary Ambient Layer */}
                <motion.div
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{
                    opacity: [0, 0.4, 0],
                    }}
                    transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    }}
                    style={{
                    background: 'radial-gradient(circle at 70% 30%, rgba(147,197,253,0.4) 0%, transparent 60%)',
                    }}
                />
            </div>
            <div className="relative z-10">{ children }</div>
        </div>
    );
};

export default MeAmbientBackground;
