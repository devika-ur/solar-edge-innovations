import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
    return (
        <>
            <Helmet>
                <title>Privacy Policy | Solar Edge Innovation</title>
                <meta
                    name="description"
                    content="Read the privacy policy of Solar Edge Innovation to understand how we collect, use, protect, and handle your personal details."
                />
                <link rel="canonical" href="https://www.solaredgeinnovation.in/privacy" />
            </Helmet>

            <main className="min-h-screen bg-[#F8F8FA] pt-32 pb-20 px-6 sm:px-8 md:px-16 lg:px-20 flex justify-center">
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-4xl bg-white border border-neutral-100/80 rounded-[32px] p-8 sm:p-12 shadow-sm space-y-8"
                >
                    <header className="border-b border-neutral-100 pb-6">
                        <span className="text-[10px] text-green-700 font-bold uppercase tracking-widest font-mono">LEGAL DOCUMENT</span>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-playfair tracking-tight text-neutral-900 mt-2">
                            Privacy Policy
                        </h1>
                        <p className="text-xs text-neutral-400 mt-2 font-mono">Last Updated: June 27, 2026</p>
                    </header>

                    <div className="space-y-6 text-sm text-neutral-600 leading-relaxed font-sans">
                        <p>
                            At <strong>Solar Edge Innovation</strong>, we value your trust and are committed to protecting your personal privacy. This Privacy Policy details how we handle the collection, use, and preservation of personal details when you access our website or engage with our professional solar installation, inverter systems, and security surveillance services.
                        </p>

                        <section className="space-y-3 pt-2">
                            <h2 className="text-lg font-bold font-playfair text-neutral-950">1. Information We Collect</h2>
                            <p>
                                We collect relevant personal information to design and deliver accurate energy and security estimations. This details:
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 text-neutral-500 font-light">
                                <li><strong>Contact details:</strong> Name, phone numbers, and email addresses provided via queries or phone calls.</li>
                                <li><strong>Location details:</strong> Site addresses needed to coordinate on-site technical surveys and installations.</li>
                                <li><strong>System Specifications:</strong> Energy bills, backup capacity requests, and security layouts needed for design proposals.</li>
                            </ul>
                        </section>

                        <section className="space-y-3 pt-2">
                            <h2 className="text-lg font-bold font-playfair text-neutral-950">2. How We Use Your Information</h2>
                            <p>
                                Collected details are utilized strictly for core operational logistics, including:
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 text-neutral-500 font-light">
                                <li>Drafting customized engineering proposals and site estimation designs.</li>
                                <li>Executing local site surveys, equipment installations, and service maintenance.</li>
                                <li>Communicating relevant updates regarding service changes or technical requests.</li>
                            </ul>
                        </section>

                        <section className="space-y-3 pt-2">
                            <h2 className="text-lg font-bold font-playfair text-neutral-950">3. Data Protection and Sharing</h2>
                            <p>
                                We employ industry-standard local security safeguards to protect your personal details from unauthorized access or leakages.
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 text-neutral-500 font-light">
                                <li><strong>No Third-Party Sharing:</strong> We do not sell, distribute, or lease personal customer data to third-party marketing services.</li>
                                <li><strong>Regulatory Disclosure:</strong> Details may only be disclosed if required under Indian law to comply with code specifications or legal mandates.</li>
                            </ul>
                        </section>

                        <section className="space-y-3 pt-2">
                            <h2 className="text-lg font-bold font-playfair text-neutral-950">4. Cookies and Analytical Metrics</h2>
                            <p>
                                Our web platform uses simple diagnostic parameters to optimize load speeds and layout rendering. You can modify browser settings to refuse cookies, which will not interfere with browsing our site.
                            </p>
                        </section>

                        <section className="space-y-3 pt-2 border-t border-neutral-100 pt-6">
                            <h2 className="text-lg font-bold font-playfair text-neutral-950">5. Contact Information</h2>
                            <p>
                                For any questions regarding this privacy statement or our customer data processing practices, please reach out to us at:
                            </p>
                            <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-6 mt-3 space-y-2 text-xs font-mono text-neutral-600">
                                <p><strong>Company:</strong> Solar Edge Innovation</p>
                                <p><strong>Address:</strong> Elakamon, Ayiroor, Varkala, Varkala Paravoor Road, Kerala, India (Near Post Office)</p>
                                <p><strong>Email:</strong> <a href="mailto:solaredgeinnovations25@gmail.com" className="text-green-700 hover:underline">solaredgeinnovations25@gmail.com</a></p>
                                <p><strong>Call Support:</strong> <a href="tel:+919526801406" className="text-green-700 hover:underline">+91 95268 01406</a></p>
                            </div>
                        </section>
                    </div>
                </motion.div>
            </main>
        </>
    );
};

export default PrivacyPolicy;
