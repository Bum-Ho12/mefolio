'use client';

import { motion } from 'framer-motion';

export default function Section({ title, items }: { title: string; items: string[] }) {
    return (
        <section className="h-screen mt-5 w-full max-w-2xl">
            <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="text-3xl font-semibold mb-6"
            >
                {title}
            </motion.h3>
            <ul className="space-y-4">
                {items.map((item, index) => (
                <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2, duration: 0.5 }}
                    className="text-lg"
                >
                    {item}
                </motion.li>
                ))}
            </ul>
        </section>
    );
}
