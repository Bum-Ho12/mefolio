import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MINIMUM_LOADING_TIME = 1500; // 4 seconds minimum to show animation
const STEP_DURATION = 800; // Duration for each loading step

interface LoadingScreenProps {
    onLoadingComplete: () => void;
    progress: number;
    isDataLoaded: boolean;
}

const LoadingScreen = ({ onLoadingComplete, progress, isDataLoaded }: LoadingScreenProps) => {
    const [status, setStatus] = useState('INITIALIZING SYSTEMS');
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (progress >= 20) setStatus('ESTABLISHING DATABASE CONNECTION');
        if (progress >= 40) setStatus('FETCHING PORTFOLIO DATA');
        if (progress >= 60) setStatus('RENDERING COMPONENTS');
        if (progress >= 80) setStatus('FINAL CHECKS');

        // Ensure minimum display time and complete loading before hiding
        if (isDataLoaded) {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onLoadingComplete, 500); // Wait for exit animation
        }, MINIMUM_LOADING_TIME);

        return () => clearTimeout(timer);
        }
    }, [progress, isDataLoaded, onLoadingComplete]);

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

            {/* Custom Glossy Card */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                duration: 0.8,
                ease: [0.19, 1, 0.22, 1], // Custom easing for smoother animation
                }}
                className="relative z-10 p-8 rounded-xl backdrop-blur-xl border border-white/10"
                style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                boxShadow: `
                    0 0 1px 1px rgba(255,255,255,0.1),
                    0 8px 32px rgba(0,0,0,0.5),
                    inset 0 1px 1px rgba(255,255,255,0.2)
                `,
                }}
            >
                <div className="space-y-6">
                {/* Terminal Header */}
                <div className="flex items-center gap-2 mb-4">
                    <motion.div
                    className="w-3 h-3 rounded-full bg-red-500/80"
                    animate={{ opacity: [0.6, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                    className="w-3 h-3 rounded-full bg-yellow-500/80"
                    animate={{ opacity: [0.6, 1] }}
                    transition={{ duration: 2, delay: 0.3, repeat: Infinity }}
                    />
                    <motion.div
                    className="w-3 h-3 rounded-full bg-green-500/80"
                    animate={{ opacity: [0.6, 1] }}
                    transition={{ duration: 2, delay: 0.6, repeat: Infinity }}
                    />
                </div>

                {/* Progress Display */}
                <motion.div
                    className="text-3xl font-bold text-blue-400"
                    animate={{ opacity: [0.8, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    {progress}% COMPLETE
                </motion.div>

                {/* Progress Bar */}
                <div className="w-64 h-2 bg-blue-900/30 rounded-full overflow-hidden">
                    <motion.div
                    className="h-full bg-blue-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: STEP_DURATION / 1000, ease: "easeOut" }}
                    />
                </div>

                {/* Status */}
                <div className="text-sm text-blue-300">
                    <span className="mr-2 opacity-70">STATUS:</span>
                    <motion.span
                    animate={{ opacity: [0.7, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    >
                    {status}
                    </motion.span>
                </div>

                {/* System Metrics */}
                <div className="grid grid-cols-2 gap-4 text-xs text-blue-300/80">
                    <div>
                    <motion.div
                        animate={{ opacity: [0.6, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        CPU: {Math.min(100, Math.round(progress * 1.2))}%
                    </motion.div>
                    <motion.div
                        animate={{ opacity: [0.6, 1] }}
                        transition={{ duration: 2, delay: 0.3, repeat: Infinity }}
                    >
                        MEMORY: {Math.min(100, Math.round(progress * 0.8))}%
                    </motion.div>
                    </div>
                    <div>
                    <motion.div
                        animate={{ opacity: [0.6, 1] }}
                        transition={{ duration: 2, delay: 0.6, repeat: Infinity }}
                    >
                        NETWORK: ACTIVE
                    </motion.div>
                    <motion.div
                        animate={{ opacity: [0.6, 1] }}
                        transition={{ duration: 2, delay: 0.9, repeat: Infinity }}
                    >
                        CACHE: BUILDING
                    </motion.div>
                    </div>
                </div>
                </div>
            </motion.div>
            </motion.div>
        )}
        </AnimatePresence>
    );
};

export default LoadingScreen;