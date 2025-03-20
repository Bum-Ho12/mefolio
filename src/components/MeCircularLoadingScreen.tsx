import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MINIMUM_LOADING_TIME = 1500; // 1.5 seconds minimum to show animation

interface LoadingScreenProps {
    onLoadingComplete: () => void;
    progress: number;
    isDataLoaded: boolean;
}

const CircularLoadingScreen = ({ onLoadingComplete, isDataLoaded }: LoadingScreenProps) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Ensure minimum display time and complete loading before hiding
        if (isDataLoaded) {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onLoadingComplete, 500); // Wait for exit animation
        }, MINIMUM_LOADING_TIME);

        return () => clearTimeout(timer);
        }
    }, [isDataLoaded, onLoadingComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                className="fixed inset-0 w-full h-screen flex items-center justify-center bg-black overflow-hidden"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    {/* Ambient Background */}
                    <motion.div
                        className="absolute inset-0 z-0"
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

                    {/* Simple circular loader */}
                    <motion.div
                        className="relative z-10 w-16 h-16"
                    >
                        {/* Thin circular track */}
                        <div className="absolute inset-0 border border-blue-300/20 rounded-full"></div>

                        {/* Spinning loader */}
                        <motion.div
                            className="absolute inset-0 border border-blue-400 rounded-full"
                            style={{
                                borderTopColor: 'transparent',
                                borderWidth: '1px'
                            }}
                            animate={{ rotate: 360 }}
                            transition={{
                                duration: 1.5,
                                ease: "linear",
                                repeat: Infinity
                            }}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CircularLoadingScreen;