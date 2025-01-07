"use client";

import { motion } from "framer-motion";
import { MdOutlineMail } from "react-icons/md";
import { IoLogoGithub, IoLogoLinkedin, IoCall } from "react-icons/io5";
import { useState } from "react";

export default function ContactSection() {
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
        const response = await fetch("/api/contact", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            setSuccess(true);
            setFormData({ name: "", email: "", message: "" });
        } else {
            const errorData = await response.json();
            setError(errorData.error || "Something went wrong.");
        }
        } catch {
            setError("Failed to submit the form. Please try again later.");
        }
    };

    return (
        <section className="flex flex-col h-full w-full items-center overflow-y-auto max-h-screen scrollbar-hide pt-24 px-4 pb-10 gap-4">
            {/* title */}
            <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="text-4xl font-semibold mb-6"
            >
                Get in touch
            </motion.h3>
            {/* subtitle */}
            <motion.p
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-xl text-center lg:w-1/2"
            >
                Here is a good spot for a message to your readers to let them know how
                best to reach out to you.
            </motion.p>
            {/* email icon */}
            <MdOutlineMail size={40} color="white" />
            {/* email message form */}
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 w-full max-w-[90vw] lg:max-w-[40vw] mt-10"
            >
                {/* name input */}
                <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                }
                required
                className="p-3 rounded-lg focus:outline-none focus:ring-0 focus:ring-none bg-[#1E1E1E]"
                />
                {/* email address input */}
                <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                }
                required
                className="p-3 rounded-lg focus:outline-none focus:ring-0 focus:ring-none bg-[#1E1E1E]"
                />
                {/* message input area */}
                <textarea
                placeholder="Message"
                value={formData.message}
                onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                }
                required
                rows={5}
                className="p-3 rounded-lg focus:outline-none focus:ring-0 focus:ring-none bg-[#1E1E1E]"
                ></textarea>
                {/* message send button */}
                <div>
                    <button
                    type="submit"
                    className=" flex items-center justify-center min-w-min px-4 py-2 rounded-full bg-[#1E1E1E] text-white hover:bg-[#333333] border border-[#FFD3AC]"
                    >
                    Send Message
                    </button>
                </div>
            </form>

            {success && (
                <p className="mt-4 text-green-500">Message sent successfully!</p>
            )}
            {error && <p className="mt-4 text-red-500">{error}</p>}
            <motion.p
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-xl text-center lg:w-1/2"
            >
                or
            </motion.p>

            <div className="flex gap-4 justify-center w-full items-center mt-10">
                <a
                href="#"
                className="flex items-center justify-center p-2 bg-white rounded-full shadow-lg text-black font-bold"
                >
                <IoLogoGithub size={20} />
                </a>
                <a
                href="#"
                className="flex items-center justify-center p-2 bg-white rounded-full shadow-lg text-black font-bold"
                >
                <IoLogoLinkedin size={20} />
                </a>
                <a
                href="#"
                className="flex items-center justify-center p-2 bg-white rounded-full shadow-lg text-black font-bold"
                >
                <IoCall size={20} />
                </a>
            </div>

            <p className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()} Bumho Nisubire. All rights reserved.
            </p>
        </section>
    );
}
