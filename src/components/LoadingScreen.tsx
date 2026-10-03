import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COUNT_DURATION = 2500; // Fastest the counter may go from 0 to 100
const HOLD_AT_COMPLETE = 400; // Pause on 100% before the exit animation

interface LoadingScreenProps {
    onLoadingComplete: () => void;
    progress: number;
    isDataLoaded: boolean;
}

const statusFor = (value: number) => {
    if (value >= 80) return 'FINAL CHECKS';
    if (value >= 60) return 'RENDERING COMPONENTS';
    if (value >= 40) return 'FETCHING PORTFOLIO DATA';
    if (value >= 20) return 'ESTABLISHING DATABASE CONNECTION';
    return 'INITIALIZING SYSTEMS';
};

const LoadingScreen = ({ onLoadingComplete, progress, isDataLoaded }: LoadingScreenProps) => {
    const [displayed, setDisplayed] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const progressRef = useRef(progress);

    useEffect(() => {
        progressRef.current = progress;
    }, [progress]);

    // The requests resolve in a burst, so the shown value counts up towards the real
    // progress at a capped rate instead of jumping with it.
    useEffect(() => {
        let frame: number;
        let last = performance.now();
        const tick = (now: number) => {
            const step = ((now - last) / COUNT_DURATION) * 100;
            last = now;
            setDisplayed((value) => Math.min(progressRef.current, value + step));
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, []);

    const isComplete = isDataLoaded && displayed >= 100;

    useEffect(() => {
        if (!isComplete) return;
        let exitTimer: ReturnType<typeof setTimeout>;
        const holdTimer = setTimeout(() => {
            setIsVisible(false);
            exitTimer = setTimeout(onLoadingComplete, 500); // Wait for exit animation
        }, HOLD_AT_COMPLETE);

        return () => {
            clearTimeout(holdTimer);
            clearTimeout(exitTimer);
        };
    }, [isComplete, onLoadingComplete]);

    const percent = Math.round(displayed);

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
                    {percent}% COMPLETE
                </motion.div>

                {/* Progress Bar */}
                <div className="w-64 h-2 bg-blue-900/30 rounded-full overflow-hidden">
                    <div
                    className="h-full bg-blue-400 rounded-full"
                    style={{ width: `${displayed}%` }}
                    />
                </div>

                {/* Status */}
                <div className="text-sm text-blue-300">
                    <span className="mr-2 opacity-70">STATUS:</span>
                    <motion.span
                    animate={{ opacity: [0.7, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    >
                    {statusFor(displayed)}
                    </motion.span>
                </div>

                {/* System Metrics */}
                <div className="grid grid-cols-2 gap-4 text-xs text-blue-300/80">
                    <div>
                    <motion.div
                        animate={{ opacity: [0.6, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        CPU: {Math.min(100, Math.round(displayed * 1.2))}%
                    </motion.div>
                    <motion.div
                        animate={{ opacity: [0.6, 1] }}
                        transition={{ duration: 2, delay: 0.3, repeat: Infinity }}
                    >
                        MEMORY: {Math.min(100, Math.round(displayed * 0.8))}%
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