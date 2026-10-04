'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import MeStoreFooter from '@/components/store/MeFooter';
import PageHero from './PageHero';
import { ContactData } from '@/utils/types';

export default function ContactView({ contactData }: { contactData: ContactData | null }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [formSubmitted, setFormSubmitted] = useState(false);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
        ...formData,
        [name]: value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically send the form data to your backend
        console.log('Form submitted:', formData);
        setFormSubmitted(true);
        setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        });
        // Reset form status after 5 seconds
        setTimeout(() => setFormSubmitted(false), 5000);
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col justify-between">
            <PageHero
                image={contactData?.heroImage}
                title={contactData ? contactData.heroTitle : undefined}
                subtitle={contactData?.heroSubtitle}
                fallbackAlt="Contact Us"
            />

            {/* Main content */}
            <div className="pt-24 px-4 pb-16">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-12 text-center"
                    >
                        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
                        <div className="bg-white/5 h-1 w-24 mx-auto rounded-full"></div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white/5 rounded-lg p-6 backdrop-blur-sm border border-white/10"
                        >
                            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>

                            {contactData?.email && (
                                <div className="mb-4">
                                    <h3 className="text-lg font-medium text-blue-400">Email</h3>
                                    <p className="text-gray-300">{contactData.email}</p>
                                </div>
                            )}

                            {contactData?.phone && (
                                <div className="mb-4">
                                    <h3 className="text-lg font-medium text-blue-400">Phone</h3>
                                    <p className="text-gray-300">{contactData.phone}</p>
                                </div>
                            )}

                            {contactData?.address && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium text-blue-400">Address</h3>
                                    <p className="text-gray-300 whitespace-pre-line">{contactData.address}</p>
                                </div>
                            )}

                            {contactData?.socialLinks && contactData.socialLinks.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-medium text-blue-400 mb-2">Follow Us</h3>
                                    <div className="flex space-x-4">
                                        {contactData.socialLinks.map((link, index) => (
                                        <a
                                            key={index}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-300 hover:text-blue-400 transition-colors"
                                        >
                                            {link.platform}
                                        </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white/5 rounded-lg p-6 backdrop-blur-sm border border-white/10"
                        >
                            <h2 className="text-2xl font-bold mb-4">Send us a Message</h2>

                        {contactData?.formIntro && (
                            <p className="text-gray-300 mb-6">{contactData.formIntro}</p>
                        )}

                        {formSubmitted ? (
                            <div className="bg-green-900/50 text-green-400 p-4 rounded-lg border border-green-800">
                                <p className="font-medium">Thank you for your message!</p>
                                <p className="text-sm mt-1">{"We'll get back to you as soon as possible."}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                                    Name
                                    </label>
                                    <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                                    Email
                                    </label>
                                    <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleFormChange}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">
                                    Subject
                                    </label>
                                    <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleFormChange}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    />
                                </div>

                                <div className="mb-6">
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                                    Message
                                    </label>
                                    <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleFormChange}
                                    rows={5}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                                >
                                    Send Message
                                </button>
                            </form>
                        )}
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <MeStoreFooter />
        </div>
    );
}