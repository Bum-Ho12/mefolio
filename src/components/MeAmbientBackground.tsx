import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MeAmbientBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    return (
        <AnimatePresence>
            <motion.div
            className="absolute inset-0 w-full min-h-screen flex items-center justify-center bg-black"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            >
                {/* Ambient Background */}
                <motion.div
                    className="absolute inset-0 z-0 h-full"
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
                    className="absolute inset-0 z-0"
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
                { children }
            </motion.div>
        </AnimatePresence>
    );
};

export default MeAmbientBackground;