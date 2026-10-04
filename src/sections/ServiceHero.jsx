import React from 'react';
import { motion } from 'framer-motion';
import { assets } from '../assets/assets';
import {
    Leaf,
    ShieldCheck,
    Users,
    Headphones,
    Sun,
    BarChart3,
    ChevronRight,
    ChevronLeft,
    Home,
    Building2,
    Factory,
    Wrench,
    Award,
    FileText,
    Percent,
    Globe,
    ArrowUpRight
} from 'lucide-react';

export default function ServiceHero() {
    const [activeSlide, setActiveSlide] = React.useState(0);
    const carouselRef = React.useRef(null);

    const handleScroll = () => {
        if (!carouselRef.current) return;
        const container = carouselRef.current;
        const scrollPosition = container.scrollLeft;
        const cardWidth = container.offsetWidth * 0.75;
        const newIndex = Math.round(scrollPosition / cardWidth);
        setActiveSlide(Math.min(Math.max(newIndex, 0), 3));
    };

    const scrollToSlide = (index) => {
        if (!carouselRef.current) return;
        const container = carouselRef.current;
        const cards = container.children;
        if (cards[index]) {
            cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            setActiveSlide(index);
        }
    };
    return (
        <section className="w-full bg-[#FAFCFA] pt-24 sm:pt-28 lg:pt-32 pb-10 sm:pb-14 lg:pb-16 relative overflow-hidden font-sans">
            {/* =========================================================
                FLOATING BACKGROUND DECORATIVE LEAVES
            ========================================================= */}
            <img
                src={assets.rightSideLeaf}
                alt="Decorative leaf right"
                className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 w-72 sm:w-96 md:w-[540px] lg:w-[640px] pointer-events-none select-none z-0 opacity-95"
            />


            <div className="max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1460px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 relative z-10">

                {/* =========================================================
                    HERO SECTION: TWO-COLUMN BANNER
                ========================================================= */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">

                    {/* Left Column: Heading & Subtitle */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="lg:col-span-6 flex flex-col items-start"
                    >
                        {/* Overline Label */}
                        <div className="flex items-center gap-2.5 mb-4">
                            <span className="w-7 h-[2px] bg-[#1A4D2E]" />
                            <span className="text-xs font-bold tracking-[0.2em] text-[#1A4D2E] uppercase">
                                OUR SERVICES
                            </span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="font-playfair font-bold text-4xl sm:text-5xl lg:text-[54px] xl:text-[62px] leading-[1.1] text-neutral-900 tracking-[-0.02em]">
                            Complete Solar <br />
                            Solutions for a <br />
                            <span className="text-[#1A4D2E]">Brighter Tomorrow</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="mt-5 text-neutral-600 text-sm sm:text-[15px] leading-relaxed max-w-xl font-medium">
                            From consultation to installation and long-term support, we provide end-to-end solar solutions tailored to your home, business, and industry.
                        </p>

                        {/* 4 Feature Pills Row */}
                        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-xl">
                            {/* Pill 1 */}
                            <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-xs border border-neutral-100/90 p-2.5 sm:p-3 rounded-2xl shadow-2xs">
                                <div className="w-8 h-8 rounded-full bg-[#E5F5E8] flex items-center justify-center text-[#1A4D2E] shrink-0">
                                    <Leaf className="w-4 h-4 fill-[#1A4D2E]" />
                                </div>
                                <span className="text-[11px] sm:text-xs font-bold text-neutral-800 leading-tight">
                                    Reliable<br />Performance
                                </span>
                            </div>

                            {/* Pill 2 */}
                            <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-xs border border-neutral-100/90 p-2.5 sm:p-3 rounded-2xl shadow-2xs">
                                <div className="w-8 h-8 rounded-full bg-[#E5F5E8] flex items-center justify-center text-[#1A4D2E] shrink-0">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <span className="text-[11px] sm:text-xs font-bold text-neutral-800 leading-tight">
                                    Certified<br />Products
                                </span>
                            </div>

                            {/* Pill 3 */}
                            <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-xs border border-neutral-100/90 p-2.5 sm:p-3 rounded-2xl shadow-2xs">
                                <div className="w-8 h-8 rounded-full bg-[#E5F5E8] flex items-center justify-center text-[#1A4D2E] shrink-0">
                                    <Users className="w-4 h-4" />
                                </div>
                                <span className="text-[11px] sm:text-xs font-bold text-neutral-800 leading-tight">
                                    Expert<br />Installation
                                </span>
                            </div>

                            {/* Pill 4 */}
                            <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-xs border border-neutral-100/90 p-2.5 sm:p-3 rounded-2xl shadow-2xs">
                                <div className="w-8 h-8 rounded-full bg-[#E5F5E8] flex items-center justify-center text-[#1A4D2E] shrink-0">
                                    <Headphones className="w-4 h-4" />
                                </div>
                                <span className="text-[11px] sm:text-xs font-bold text-neutral-800 leading-tight">
                                    Ongoing<br />Support
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Hero Banner Image & Floating Badges */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        className="lg:col-span-6 relative flex items-center justify-center"
                    >
                        {/* Service Banner Image Container (Enlarged, No Border) */}
                        <div className="relative w-full max-w-[720px] xl:max-w-[760px] rounded-3xl sm:rounded-[36px] overflow-hidden">
                            <img
                                src={assets.serviceBannerImage}
                                alt="Complete Solar Solutions - Solar Edge Innovation"
                                className="w-full h-auto object-cover block"
                            />
                        </div>

                        {/* Floating Badge 1: Clean Energy (Top Left overlay - Hidden on mobile) */}
                        <motion.div
                            animate={{ y: [-3, 3, -3] }}
                            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                            className="hidden sm:flex absolute top-4 sm:top-6 left-2 sm:left-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-xl border border-neutral-100 items-center gap-3"
                        >
                            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                <Sun className="w-5 h-5 fill-amber-400 text-amber-500" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-neutral-900 leading-tight">Clean Energy</div>
                                <div className="text-[10px] sm:text-[11px] text-neutral-500 font-medium">Brighter Tomorrow</div>
                            </div>
                            {/* Curved Arrow pointer */}
                            <svg width="45" height="35" viewBox="0 0 50 40" fill="none" className="absolute -bottom-8 right-2 text-[#1A4D2E] pointer-events-none opacity-80">
                                <path d="M5 5 C 20 25, 35 20, 40 32" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                                <path d="M32 28 L 41 33 L 41 23" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                        </motion.div>

                        {/* Floating Badge 2: Reduce Electricity Bills (Right overlay - Hidden on mobile) */}
                        <motion.div
                            animate={{ y: [3, -3, 3] }}
                            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.3 }}
                            className="hidden sm:flex absolute top-1/2 -translate-y-1/2 -right-2 sm:-right-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-xl border border-neutral-100 items-center gap-3 max-w-[210px] sm:max-w-[230px]"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#E5F5E8] flex items-center justify-center text-[#1A4D2E] shrink-0">
                                <BarChart3 className="w-5 h-5 text-[#1A4D2E]" />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs sm:text-sm font-bold text-neutral-900 leading-tight">Reduce Electricity Bills</div>
                                <div className="text-[10px] sm:text-[11px] text-neutral-500 font-medium mt-0.5">Save up to 70% annually</div>
                            </div>
                            <div className="w-7 h-7 rounded-full bg-[#E5F5E8] text-[#1A4D2E] flex items-center justify-center shrink-0">
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </motion.div>
                    </motion.div>

                </div>

                {/* =========================================================
                    FEATURE BAR (ASSURANCE BANNER) PLACED BELOW HERO
                ========================================================= */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mt-12 sm:mt-16 lg:mt-20 bg-gradient-to-r from-[#0E361D] via-[#144A29] to-[#0A2A17] text-white rounded-3xl sm:rounded-[36px] p-5 sm:p-8 lg:p-9 shadow-2xl border border-emerald-700/40 relative overflow-hidden"
                >
                    {/* Ambient Background Glows */}
                    <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-5 sm:gap-6 lg:gap-0 lg:divide-x divide-white/15 relative z-10">
                        
                        {/* 1. 10+ Year Warranty */}
                        <div className="bg-white/10 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none rounded-2xl sm:rounded-none p-3 sm:p-0 border border-white/15 sm:border-none flex items-center gap-3 lg:justify-center lg:px-4 group cursor-pointer">
                            <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shrink-0 shadow-md group-hover:scale-110 transition-transform">
                                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
                            </div>
                            <div>
                                <div className="text-sm sm:text-base font-extrabold text-white leading-tight">10+ Year</div>
                                <div className="text-[11px] sm:text-xs text-emerald-200/90 font-medium">Warranty</div>
                            </div>
                        </div>

                        {/* 2. 27-Year Production Guarantee */}
                        <div className="bg-white/10 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none rounded-2xl sm:rounded-none p-3 sm:p-0 border border-white/15 sm:border-none flex items-center gap-3 lg:justify-center lg:px-4 group cursor-pointer">
                            <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-300 shrink-0 shadow-md group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300" />
                            </div>
                            <div>
                                <div className="text-sm sm:text-base font-extrabold text-white leading-tight">27-Year</div>
                                <div className="text-[11px] sm:text-xs text-emerald-200/90 font-medium">Production Guarantee</div>
                            </div>
                        </div>

                        {/* 3. Fast Loan Approval */}
                        <div className="bg-white/10 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none rounded-2xl sm:rounded-none p-3 sm:p-0 border border-white/15 sm:border-none flex items-center gap-3 lg:justify-center lg:px-4 group cursor-pointer">
                            <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-300 shrink-0 shadow-md group-hover:scale-110 transition-transform">
                                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300" />
                            </div>
                            <div>
                                <div className="text-sm sm:text-base font-extrabold text-white leading-tight">Fast Loan</div>
                                <div className="text-[11px] sm:text-xs text-emerald-200/90 font-medium">Approval</div>
                            </div>
                        </div>

                        {/* 4. Govt. Subsidy Available */}
                        <div className="bg-white/10 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none rounded-2xl sm:rounded-none p-3 sm:p-0 border border-white/15 sm:border-none flex items-center gap-3 lg:justify-center lg:px-4 group cursor-pointer">
                            <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shrink-0 shadow-md group-hover:scale-110 transition-transform">
                                <Percent className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
                            </div>
                            <div>
                                <div className="text-sm sm:text-base font-extrabold text-white leading-tight">Govt. Subsidy</div>
                                <div className="text-[11px] sm:text-xs text-emerald-200/90 font-medium">Available</div>
                            </div>
                        </div>

                        {/* 5. Eco Friendly & Sustainable (Centered Full Width on Mobile) */}
                        <div className="col-span-2 sm:col-span-1 bg-white/10 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none rounded-2xl sm:rounded-none p-3 sm:p-0 border border-white/15 sm:border-none flex items-center justify-center sm:justify-start lg:justify-center gap-3 lg:px-4 group cursor-pointer">
                            <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-300 shrink-0 shadow-md group-hover:scale-110 transition-transform">
                                <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-300" />
                            </div>
                            <div>
                                <div className="text-sm sm:text-base font-extrabold text-white leading-tight">Eco Friendly</div>
                                <div className="text-[11px] sm:text-xs text-emerald-200/90 font-medium">& Sustainable</div>
                            </div>
                        </div>

                    </div>
                </motion.div>

            </div>
        </section>
    );
}
