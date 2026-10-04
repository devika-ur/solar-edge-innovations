import React from 'react';
import { assets } from '../assets/assets';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin } from 'lucide-react';

const GetInTouch = () => {
    return (
        <div className="flex justify-center px-6 sm:px-8 md:px-16 lg:px-20 pb-20 pt-10">
            <div className="bg-gradient-to-br from-[#0c2b1a] via-[#071d11] to-[#040e08] text-white w-full max-w-7xl relative rounded-[40px] border border-green-800/15 shadow-xl p-8 sm:p-12 lg:p-20">
                {/* Glowing ambient background blob inside the card */}
                <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-green-500/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

                <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-4 relative z-10">
                    {/* Text & Contact Section */}
                    <div className="flex flex-col gap-6 w-full lg:w-1/2 text-left">
                        <div className="space-y-3">
                            <span className="text-[11px] text-green-400 font-semibold tracking-widest uppercase font-mono">
                                READY TO SWITCH TO CLEAN ENERGY?
                            </span>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-playfair tracking-tight text-white leading-tight">
                                Start Your Solar<br />Journey Today
                            </h2>
                            <p className="text-sm md:text-base text-neutral-300 font-light leading-relaxed max-w-lg pt-2">
                                We’re here to answer your questions and help you engineer the perfect system. Reach out for custom calculations, product specs, or installation advice.
                            </p>
                        </div>

                        {/* Contact details list */}
                        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-6 sm:gap-10 lg:gap-6 xl:gap-10 pt-4 border-t border-white/10 mt-2">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/5 rounded-xl text-white">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">Call Us</p>
                                    <a href="tel:+919526801406" className="text-sm font-semibold hover:text-green-400 transition-colors">
                                        +91 95268 01406
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/5 rounded-xl text-white">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">Email Us</p>
                                    <a href="mailto:solaredgeinnovations25@gmail.com" className="text-sm font-semibold hover:text-green-400 transition-colors">
                                        solaredgeinnovations25@gmail.com
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-wrap gap-4 mt-6">
                            <a
                                href="tel:+919526801406"
                                className="inline-flex items-center justify-center gap-2 bg-[#78B61A] hover:bg-[#689f15] text-white px-8 py-4 rounded-full text-xs font-bold tracking-widest transition-all duration-300 shadow-md hover:shadow-lg uppercase font-sans"
                            >
                                <Phone className="w-3.5 h-3.5" />
                                Call Support
                            </a>
                            <a
                                href="mailto:solaredgeinnovations25@gmail.com"
                                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white px-8 py-4 rounded-full text-xs font-bold tracking-widest transition-all duration-300 uppercase font-sans"
                            >
                                <Mail className="w-3.5 h-3.5" />
                                Email Request
                            </a>
                        </div>
                    </div>

                    {/* Image Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 60, scale: 0.96 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="hidden lg:block absolute -bottom-[70px] xl:-bottom-[100px] -right-24 xl:-right-12 z-0 pointer-events-none"
                    >
                        <img
                            src={assets.home}
                            alt="Solar powered house model"
                            className="lg:w-[400px] xl:w-[570px] h-auto object-contain filter drop-shadow-[0_25px_50px_rgba(0,0,0,0.35)]"
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default GetInTouch;
