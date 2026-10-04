import React from 'react';
import { motion } from 'framer-motion';
import logoImg from '../assets/logo/logo.png';

export default function WhoWeAreSection() {
    // Animation variants for staggered load on viewport entry
    const fadeInScale = {
        hidden: { opacity: 0, y: 30, scale: 0.97 },
        visible: (customDelay) => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.8, delay: customDelay, ease: [0.21, 0.6, 0.35, 1] }
        })
    };

    return (
        <div className="bg-light-white text-neutral-900 font-sans px-6 sm:px-8 md:px-16 lg:px-20 py-16 selection:bg-green-900 selection:text-white">
            <div className="max-w-7xl mx-auto">
                {/* --- HEADER / HERO TOP SECTION --- */}
                <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16 pt-6">
                    {/* Bio & Intro Title */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <img
                                src={logoImg}
                                alt="Solar Edge Innovation Logo"
                                className="w-12 h-12 rounded-full object-contain bg-white p-2 border border-neutral-200"
                            />
                            <p className="text-sm font-sans tracking-tight text-neutral-500 leading-snug font-medium">
                                Hey, we're <span className="font-semibold text-neutral-900">Solar Edge</span>,<br />your clean energy partner.
                            </p>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-[4.2rem] font-bold font-playfair tracking-tight leading-[1.08] text-neutral-900">
                            Smart Energy,<br />Secure Living.
                        </h1>
                    </div>

                    {/* Right Paragraph & CTA */}
                    <div className="lg:col-span-4 lg:pt-[4.5rem] flex flex-col items-start lg:items-end lg:text-right space-y-6">
                        <p className="text-sm md:text-[0.95rem] font-sans font-light leading-relaxed text-neutral-500 max-w-[320px]">
                            At Solar Edge Innovation, we are committed to delivering smart, reliable, and future-ready energy and security solutions.
                        </p>
                        <motion.a
                            href="/brochures/SolarEdge_Brochure.pdf"
                            download
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-block bg-green-900 text-white hover:bg-green-800 px-7 py-3.5 rounded-full text-[10px] font-bold tracking-widest transition-all duration-300 hover:shadow-md cursor-pointer uppercase font-sans"
                        >
                            Download Brochure
                        </motion.a>
                    </div>
                </header>

                {/* --- MASONRY GRID LAYOUT AS SHOWN IN THE IMAGE --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Column 1 */}
                    <div className="flex flex-col gap-6">
                        {/* Tall Card: Why Choose Us */}
                        <motion.div
                            custom={0.1}
                            variants={fadeInScale}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            className="relative rounded-[32px] overflow-hidden shadow-xs border border-neutral-100 aspect-[3/4.2]"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=80"
                                alt="Why Choose Us"
                                className="absolute inset-0 w-full h-full object-cover z-0 hover:scale-105 transition-transform duration-700 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20 z-10"></div>
                            <div className="relative z-20 p-8 h-full flex flex-col justify-end text-left text-white">
                                <h3 className="font-playfair text-2xl font-bold mb-3 text-white">Why Choose Us?</h3>
                                <p className="text-[11px] text-neutral-300 leading-relaxed font-light">
                                    With a strong focus on quality, innovation, and customer satisfaction, we provide end-to-end solutions from consultation and installation to after-sales service and maintenance.
                                </p>
                            </div>
                        </motion.div>

                        {/* Stat Box: 150+ Projects */}
                        <motion.div
                            custom={0.2}
                            variants={fadeInScale}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            className="bg-white rounded-[32px] p-8 flex flex-col justify-end h-[170px] shadow-xs border border-neutral-100"
                        >
                            <h2 className="text-5xl font-playfair font-bold text-neutral-900">
                                200<span className="text-green-600 font-light ml-0.5">+</span>
                            </h2>
                            <p className="text-xs font-sans text-neutral-500 tracking-tight font-medium mt-2">Projects Completed</p>
                        </motion.div>
                    </div>

                    {/* Column 2 */}
                    <div className="flex flex-col gap-6">
                        {/* Stat Box: 8+ Years */}
                        <motion.div
                            custom={0.15}
                            variants={fadeInScale}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            className="bg-white rounded-[32px] p-8 flex flex-col justify-end h-[170px] shadow-xs border border-neutral-100"
                        >
                            <h2 className="text-5xl font-playfair font-bold text-neutral-900">
                                3<span className="text-green-600 font-light ml-0.5">+</span>
                            </h2>
                            <p className="text-xs font-sans text-neutral-500 tracking-tight font-medium mt-2">Years experience</p>
                        </motion.div>

                        {/* Tall Card: Solar Solutions */}
                        <motion.div
                            custom={0.3}
                            variants={fadeInScale}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            className="relative rounded-[32px] overflow-hidden shadow-xs border border-neutral-100 aspect-[3/4.2]"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=600&q=80"
                                alt="Solar Solutions"
                                className="absolute inset-0 w-full h-full object-cover z-0 hover:scale-105 transition-transform duration-700 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20 z-10"></div>
                            <div className="relative z-20 p-8 h-full flex flex-col justify-end text-left text-white">
                                <h3 className="font-playfair text-2xl font-bold mb-3 text-white">Solar Solutions</h3>
                                <ul className="space-y-2 text-xs text-neutral-300 font-light">
                                    <li className="flex items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 flex-shrink-0"></span>
                                        On-Grid Solar Systems
                                    </li>
                                    <li className="flex items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 flex-shrink-0"></span>
                                        Hybrid Solar Systems
                                    </li>
                                    <li className="flex items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 flex-shrink-0"></span>
                                        Off-Grid Solar Systems
                                    </li>
                                </ul>
                            </div>
                        </motion.div>
                    </div>

                    {/* Column 3 */}
                    <div className="flex flex-col gap-6">
                        {/* Tall Card: Inverter Solutions */}
                        <motion.div
                            custom={0.25}
                            variants={fadeInScale}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            className="relative rounded-[32px] overflow-hidden shadow-xs border border-neutral-100 aspect-[3/4.2]"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=600&q=80"
                                alt="Inverter Solutions"
                                className="absolute inset-0 w-full h-full object-cover z-0 hover:scale-105 transition-transform duration-700 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20 z-10"></div>
                            <div className="relative z-20 p-8 h-full flex flex-col justify-end text-left text-white">
                                <h3 className="font-playfair text-2xl font-bold mb-3 text-white">Inverter Solutions</h3>
                                <ul className="space-y-2 text-xs text-neutral-300 font-light">
                                    <li className="flex items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 flex-shrink-0"></span>
                                        On-Grid Inverters
                                    </li>
                                    <li className="flex items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 flex-shrink-0"></span>
                                        Hybrid Inverters
                                    </li>
                                    <li className="flex items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 flex-shrink-0"></span>
                                        Micro Inverters
                                    </li>
                                </ul>
                            </div>
                        </motion.div>

                        {/* Stat Box: 120+ Happy Customers */}
                        <motion.div
                            custom={0.4}
                            variants={fadeInScale}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            className="bg-white rounded-[32px] p-8 flex flex-col justify-end h-[170px] shadow-xs border border-neutral-100"
                        >
                            <h2 className="text-5xl font-playfair font-bold text-neutral-900">
                                200<span className="text-green-600 font-light ml-0.5">+</span>
                            </h2>
                            <p className="text-xs font-sans text-neutral-500 tracking-tight font-medium mt-2">Happy clients</p>
                        </motion.div>
                    </div>

                    {/* Column 4 */}
                    <div className="flex flex-col gap-6">
                        {/* Stat Box: 50+ Homes Powered */}
                        <motion.div
                            custom={0.35}
                            variants={fadeInScale}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            className="bg-white rounded-[32px] p-8 flex flex-col justify-end h-[170px] shadow-xs border border-neutral-100"
                        >
                            <h2 className="text-5xl font-playfair font-bold text-neutral-900">
                                50<span className="text-green-600 font-light ml-0.5">+</span>
                            </h2>
                            <p className="text-xs font-sans text-neutral-500 tracking-tight font-medium mt-2">Homes Powered</p>
                        </motion.div>

                        {/* Tall Card: CCTV & Security */}
                        <motion.div
                            custom={0.45}
                            variants={fadeInScale}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            className="relative rounded-[32px] overflow-hidden shadow-xs border border-neutral-100 aspect-[3/4.2]"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80"
                                alt="CCTV & Security"
                                className="absolute inset-0 w-full h-full object-cover z-0 hover:scale-105 transition-transform duration-700 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20 z-10"></div>
                            <div className="relative z-20 p-8 h-full flex flex-col justify-end text-left text-white">
                                <h3 className="font-playfair text-2xl font-bold mb-3 text-white">CCTV & Security</h3>
                                <ul className="space-y-2 text-xs text-neutral-300 font-light">
                                    <li className="flex items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 flex-shrink-0"></span>
                                        Sales & Installation
                                    </li>
                                    <li className="flex items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 flex-shrink-0"></span>
                                        Service & Maintenance
                                    </li>
                                    <li className="flex items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 flex-shrink-0"></span>
                                        NVR & DVR Solutions
                                    </li>
                                </ul>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}