import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const TermsOfService = () => {
    return (
        <>
            <Helmet>
                <title>Terms of Service | Solar Edge Innovation</title>
                <meta
                    name="description"
                    content="Review the terms of service of Solar Edge Innovation governing the use of our solar energy platform, services, and site layouts."
                />
                <link rel="canonical" href="https://www.solaredgeinnovation.in/terms" />
            </Helmet>

            <main className="min-h-screen bg-[#F8F8FA] pt-32 pb-20 px-6 sm:px-8 md:px-16 lg:px-20 flex justify-center">
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-4xl bg-white border border-neutral-100/80 rounded-[32px] p-8 sm:p-12 shadow-sm space-y-8"
                >
                    <header className="border-b border-neutral-100 pb-6">
                        <span className="text-[10px] text-green-700 font-bold uppercase tracking-widest font-mono">USER TERMS</span>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-playfair tracking-tight text-neutral-900 mt-2">
                            Terms of Service
                        </h1>
                        <p className="text-xs text-neutral-400 mt-2 font-mono">Last Updated: June 27, 2026</p>
                    </header>

                    <div className="space-y-6 text-sm text-neutral-600 leading-relaxed font-sans">
                        <p>
                            Welcome to <strong>Solar Edge Innovation</strong>. These Terms of Service ("Terms") govern your access to and use of our website, as well as the terms under which we provide custom solar estimations, equipment installation, and technician services.
                        </p>
                        <p>
                            By browsing this platform, submitting a query form, or scheduling site evaluations, you agree to be legally bound by these Terms.
                        </p>

                        <section className="space-y-3 pt-2">
                            <h2 className="text-lg font-bold font-playfair text-neutral-950">1. Services and Estimations</h2>
                            <p>
                                Solar Edge Innovation provides solar engineering evaluations, inverter backup specifications, and smart surveillance CCTV setups.
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 text-neutral-500 font-light">
                                <li><strong>Quotations:</strong> Any pricing quotes, system layouts, or capacity estimations generated through the site or communications are preliminary approximations.</li>
                                <li><strong>Site Assessments:</strong> Final layout validation, binding installation agreements, and electrical hookup schedules require a manual on-site survey by our certified engineering team.</li>
                            </ul>
                        </section>

                        <section className="space-y-3 pt-2">
                            <h2 className="text-lg font-bold font-playfair text-neutral-950">2. Customer Obligations</h2>
                            <p>
                                When requesting services, you agree to:
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 text-neutral-500 font-light">
                                <li>Provide accurate and complete location, contact, and energy consumption metrics.</li>
                                <li>Secure necessary approvals or utility grid permissions for physical structural installations where applicable.</li>
                            </ul>
                        </section>

                        <section className="space-y-3 pt-2">
                            <h2 className="text-lg font-bold font-playfair text-neutral-950">3. Intellectual Property</h2>
                            <p>
                                All brand identifiers, custom page layouts, graphics, image assets, and written descriptions on this website are the property of Solar Edge Innovation and are protected under intellectual property laws. You may not copy, repurpose, or hotlink content without express permission.
                            </p>
                        </section>

                        <section className="space-y-3 pt-2">
                            <h2 className="text-lg font-bold font-playfair text-neutral-950">4. Warranties and Liability Limitations</h2>
                            <p>
                                While we strive to maintain accurate product descriptions and system metrics, the site is provided on an "as-is" baseline. Equipment performance guarantees are governed under the respective hardware manufacturer specifications (e.g., solar panel or inverter brand warranty cards).
                            </p>
                        </section>

                        <section className="space-y-3 pt-2">
                            <h2 className="text-lg font-bold font-playfair text-neutral-950">5. Governing Law</h2>
                            <p>
                                These Terms shall be construed and governed in accordance with the laws of <strong>Kerala, India</strong>, without regard to conflict of law principles. Any dispute arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in Varkala/Trivandrum, Kerala.
                            </p>
                        </section>

                        <section className="space-y-3 pt-2 border-t border-neutral-100 pt-6">
                            <h2 className="text-lg font-bold font-playfair text-neutral-950">6. Reach Out to Us</h2>
                            <p>
                                If you require clarification on these Terms or wish to discuss an installation contract, contact our administration:
                            </p>
                            <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-6 mt-3 space-y-2 text-xs font-mono text-neutral-600">
                                <p><strong>Company:</strong> Solar Edge Innovation</p>
                                <p><strong>Email:</strong> <a href="mailto:solaredgeinnovations25@gmail.com" className="text-green-700 hover:underline">solaredgeinnovations25@gmail.com</a></p>
                                <p><strong>Phone:</strong> <a href="tel:+919526801406" className="text-green-700 hover:underline">+91 95268 01406</a></p>
                            </div>
                        </section>
                    </div>
                </motion.div>
            </main>
        </>
    );
};

export default TermsOfService;
