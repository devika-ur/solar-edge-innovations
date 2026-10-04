import React from 'react';
import { assets } from '../assets/assets';
import { motion } from 'framer-motion';

const CategorySection = () => {
    return (
        <section className="w-full px-6 sm:px-8 md:px-16 lg:px-20 py-20">
            <div className="max-w-7xl mx-auto w-full">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <div>
                    <span className="text-[11px] text-green-700 font-semibold tracking-widest uppercase font-mono">INSTALLATION SECTORS</span>
                    <h2 className="text-3xl md:text-4xl font-bold font-playfair tracking-tight text-neutral-900 mt-2">
                        Tailored Solutions for Every Grid
                    </h2>
                </div>
                <p className="text-sm text-neutral-500 font-light max-w-sm leading-relaxed">
                    Whether powering your family home or scaling operations for enterprises, our bespoke solar configurations optimize efficiency and savings.
                </p>
            </div>

            {/* Grid Container */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                {/* Domestic Installation */}
                <motion.div
                    className="relative flex flex-col md:flex-row items-stretch bg-[#0c281a] text-white rounded-[32px] overflow-hidden border border-green-800/20 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer group"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                >
                    {/* Image Area */}
                    <div className="w-full md:w-1/2 min-h-[260px] relative overflow-hidden">
                        <img
                            src={assets.industrialImage}
                            alt="Domestic Solar Installation"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/25 to-transparent z-10"></div>
                        <span className="absolute top-5 left-5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full z-20 shadow-xs">
                            Residential
                        </span>
                    </div>

                    {/* Content Area */}
                    <div className="w-full md:w-1/2 p-8 flex flex-col justify-between gap-6 relative z-20">
                        <div className="space-y-3">
                            <h3 className="text-2xl font-bold tracking-tight text-white font-playfair">
                                Domestic Installation
                            </h3>
                            <p className="text-xs text-neutral-300 font-light leading-relaxed">
                                Powering homes with clean, affordable, and sustainable solar energy for a brighter, self-sufficient future.
                            </p>
                        </div>
                        <a
                            href="/services#solar-section"
                            className="inline-flex items-center gap-1.5 text-xs text-green-400 font-semibold tracking-wider hover:text-green-300 transition-colors uppercase font-mono group/btn self-start"
                        >
                            Explore setups
                            <span className="group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
                        </a>
                    </div>
                </motion.div>

                {/* Commercial Installation */}
                <motion.div
                    className="relative flex flex-col md:flex-row items-stretch bg-white text-neutral-900 rounded-[32px] overflow-hidden border border-neutral-200/50 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer group"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    {/* Image Area */}
                    <div className="w-full md:w-1/2 min-h-[260px] relative overflow-hidden">
                        <img
                            src={assets.commercialImage}
                            alt="Commercial Solar Installation"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent z-10"></div>
                        <span className="absolute top-5 left-5 bg-neutral-900/5 backdrop-blur-md border border-neutral-900/10 text-neutral-900 text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full z-20 shadow-xs">
                            Enterprise
                        </span>
                    </div>

                    {/* Content Area */}
                    <div className="w-full md:w-1/2 p-8 flex flex-col justify-between gap-6 relative z-20">
                        <div className="space-y-3">
                            <h3 className="text-2xl font-bold tracking-tight text-neutral-900 font-playfair">
                                Commercial Installation
                            </h3>
                            <p className="text-xs text-neutral-500 font-light leading-relaxed">
                                Empowering businesses with reliable, scalable, and cost-saving solar energy solutions that reduce overhead.
                            </p>
                        </div>
                        <a
                            href="/services#solar-section"
                            className="inline-flex items-center gap-1.5 text-xs text-green-700 font-semibold tracking-wider hover:text-green-600 transition-colors uppercase font-mono group/btn self-start"
                        >
                            Explore setups
                            <span className="group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
                        </a>
                    </div>
                </motion.div>
            </div>
            </div>
        </section>
    );
};

export default CategorySection;

