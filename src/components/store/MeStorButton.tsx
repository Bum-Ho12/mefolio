import { motion } from "framer-motion";
import Link from "next/link";

export default function MeStorButton() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-8"
        >
            <Link href="/store" className="relative inline-flex items-center group px-6 py-3 overflow-hidden rounded-full bg-gradient-to-r from-[#FFD3AC]/20 to-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,211,172,0.5)]">
                <span className="relative z-10 text-[#FFD3AC] font-medium text-lg group-hover:text-white transition-colors duration-300">
                    Visit Store
                </span>
                <svg
                className="ml-2 w-5 h-5 text-[#FFD3AC] group-hover:text-white group-hover:translate-x-1 transition-all duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </Link>
        </motion.div>
    );
}