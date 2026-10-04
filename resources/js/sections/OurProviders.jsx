import React from 'react';
import { providersLogo } from '../assets/assets';
import { motion } from 'framer-motion';

const OurProviders = () => {
    return (
        <section className="w-full px-6 sm:px-8 md:px-16 lg:px-20 py-20">
            <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
            {/* Header Title */}
            <div className="text-center space-y-3 mb-12 max-w-2xl">
                <span className="text-[11px] text-green-700 font-semibold tracking-widest uppercase font-mono">
                    TRUSTED BRAND PARTNERS
                </span>
                <h2 className="text-3xl md:text-4xl font-bold font-playfair tracking-tight text-neutral-900">
                    Our Technology Providers
                </h2>
                <p className="text-sm text-neutral-500 font-light leading-relaxed">
                    We partner with leading global solar energy and security manufacturers to deliver high-performance, long-lasting systems for your home and business.
                </p>
            </div>

            {/* Desktop Grid Layout */}
            <div className="hidden lg:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full">
                {providersLogo.map((logo, index) => {
                    const isWaaree = logo.img.includes('waaree') || logo.img.includes('waree');
                    const isExide = logo.img.includes('exide');
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            whileHover={{ scale: 1.02 }}
                            className="p-6 bg-white border border-neutral-100/80 rounded-[24px] flex items-center justify-center h-32 shadow-xs hover:shadow-md hover:border-neutral-200 transition-all duration-300 cursor-pointer group"
                        >
                            <img
                                src={logo.img}
                                alt="client logo"
                                className={`max-h-12 max-w-[85%] object-contain transition-all duration-500 ${
                                    isWaaree ? 'scale-[1.45]' : isExide ? 'scale-[1.25]' : ''
                                }`}
                            />
                        </motion.div>
                    );
                })}
            </div>

            {/* Mobile Continuous Marquee Layout */}
            <div className="block lg:hidden w-full overflow-hidden py-8 relative">
                {/* Subtle side fading mask shadows blending with parent bg */}
                <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#F8F8FA] to-transparent z-10 pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#F8F8FA] to-transparent z-10 pointer-events-none"></div>

                <div className="marquee flex items-center space-x-16">
                    {providersLogo.map((logo, index) => {
                        const isWaaree = logo.img.includes('waaree') || logo.img.includes('waree');
                        const isExide = logo.img.includes('exide');
                        return (
                            <img
                                key={`marquee-1-${index}`}
                                src={logo.img}
                                alt="client logo"
                                className={`h-10 w-auto max-w-[110px] object-contain flex-shrink-0 ${
                                    isWaaree ? 'scale-[1.45]' : isExide ? 'scale-[1.25]' : ''
                                }`}
                            />
                        );
                    })}
                    {providersLogo.map((logo, index) => {
                        const isWaaree = logo.img.includes('waaree') || logo.img.includes('waree');
                        const isExide = logo.img.includes('exide');
                        return (
                            <img
                                key={`marquee-2-${index}`}
                                src={logo.img}
                                alt="client logo"
                                className={`h-10 w-auto max-w-[110px] object-contain flex-shrink-0 ${
                                    isWaaree ? 'scale-[1.45]' : isExide ? 'scale-[1.25]' : ''
                                }`}
                            />
                        );
                    })}
                </div>
            </div>
            </div>
        </section>
    );
};

export default OurProviders;