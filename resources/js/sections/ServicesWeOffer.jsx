import React from 'react';
import { motion } from 'framer-motion';
import { assets } from '../assets/assets';
import {
    ChevronRight,
    ChevronLeft,
    Home,
    Building2,
    Factory,
    Wrench,
    ArrowUpRight
} from 'lucide-react';

export default function ServicesWeOffer() {
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
        <section className="w-full bg-[#FAFCFA] py-16 sm:py-20 lg:py-24 relative overflow-hidden font-sans">
            <div className="max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1460px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 relative z-10">
                {/* Header Row with Carousel Navigation Controls */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
                    <div>
                        <div className="flex items-center gap-2.5 mb-2">
                            <span className="w-7 h-[2px] bg-[#1A4D2E]" />
                            <span className="text-xs font-bold tracking-[0.2em] text-[#1A4D2E] uppercase">
                                OUR SERVICES
                            </span>
                        </div>
                        <h2 className="font-playfair font-bold text-3xl sm:text-4xl lg:text-[42px] text-neutral-900 leading-tight">
                            Services <span className="font-extrabold text-neutral-900">We Offer</span>
                        </h2>
                    </div>

                    <p className="text-neutral-500 text-xs sm:text-sm max-w-md leading-relaxed font-medium">
                        We deliver comprehensive solar solutions designed for residential, commercial, and industrial needs.
                    </p>

                    {/* Carousel Action Buttons & Navigation Controls */}
                    <div className="flex items-center gap-3">
                        <a
                            href="/services"
                            className="inline-flex items-center gap-2 bg-white hover:bg-neutral-50 border border-neutral-200/90 rounded-full px-5 py-2.5 text-xs font-bold text-neutral-800 shadow-2xs hover:shadow-sm transition-all"
                        >
                            Explore All
                            <ChevronRight className="w-4 h-4 text-[#1A4D2E]" />
                        </a>

                        {/* Left & Right Arrow Buttons (Visible on Mobile & Tablet Carousel, Hidden on Desktop Grid) */}
                        <div className="flex lg:hidden items-center gap-1.5 ml-1">
                            <button
                                onClick={() => scrollToSlide(Math.max(0, activeSlide - 1))}
                                disabled={activeSlide === 0}
                                className={`w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center transition-all ${
                                    activeSlide === 0
                                        ? 'opacity-40 cursor-not-allowed bg-neutral-100 text-neutral-400'
                                        : 'bg-white hover:bg-[#1A4D2E] hover:text-white hover:border-[#1A4D2E] text-neutral-800 shadow-2xs'
                                }`}
                                aria-label="Previous service card"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => scrollToSlide(Math.min(3, activeSlide + 1))}
                                disabled={activeSlide === 3}
                                className={`w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center transition-all ${
                                    activeSlide === 3
                                        ? 'opacity-40 cursor-not-allowed bg-neutral-100 text-neutral-400'
                                        : 'bg-white hover:bg-[#1A4D2E] hover:text-white hover:border-[#1A4D2E] text-neutral-800 shadow-2xs'
                                }`}
                                aria-label="Next service card"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4 Premium Cards: Swipeable Horizontal Carousel View on Mobile & Tablet, Grid on Desktop */}
                <div
                    ref={carouselRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none pb-6 -mx-6 px-6 sm:-mx-10 sm:px-10 lg:px-0 lg:mx-0 gap-5 sm:gap-6 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0 touch-pan-x"
                >

                    {/* Card 1: Residential Solar Solutions */}
                    <motion.div
                        whileHover={{ y: -8 }}
                        transition={{ duration: 0.3 }}
                        className="w-[84vw] max-w-[320px] sm:w-[330px] md:w-[350px] lg:w-auto shrink-0 snap-center bg-gradient-to-b from-[#F2F8F4] to-white border-2 border-[#1A4D2E] rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                    >
                        {/* Top Badge */}
                        <div className="absolute top-4 right-4 z-20">
                            <span className="bg-[#1A4D2E] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                                Popular
                            </span>
                        </div>

                        <div>
                            {/* Image Container with Floating Glass Badge */}
                            <div className="relative w-full aspect-[16/11] rounded-2xl overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                                <img
                                    src={assets.residentialSolar}
                                    alt="Residential Solar Solutions"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-center text-[#1A4D2E] shadow-md border border-neutral-100">
                                    <Home className="w-5 h-5 text-[#1A4D2E]" />
                                </div>
                            </div>

                            <h3 className="font-bold text-lg text-neutral-900 leading-snug group-hover:text-[#1A4D2E] transition-colors">
                                Residential Solar
                            </h3>
                            <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed font-medium">
                                Custom rooftop solar systems engineered for homes to drastically cut electricity expenses.
                            </p>

                            {/* Feature Highlights */}
                            <div className="mt-4 pt-3 border-t border-neutral-200/60 space-y-1.5">
                                <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1A4D2E]" />
                                    Save up to 80% on monthly bills
                                </div>
                                <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1A4D2E]" />
                                    Net metering & KSEB grid support
                                </div>
                            </div>
                        </div>

                        <a href="/services#solar-section" className="mt-6 flex items-center justify-between">
                            <span className="text-xs font-bold text-[#1A4D2E]">Learn More</span>
                            <div className="w-9 h-9 rounded-full bg-[#E5F5E8] text-[#1A4D2E] flex items-center justify-center group-hover:bg-[#1A4D2E] group-hover:text-white transition-all shadow-2xs">
                                <ArrowUpRight className="w-4 h-4" />
                            </div>
                        </a>
                    </motion.div>

                    {/* Card 2: Commercial Solar Systems */}
                    <motion.div
                        whileHover={{ y: -8 }}
                        transition={{ duration: 0.3 }}
                        className="w-[84vw] max-w-[320px] sm:w-[330px] md:w-[350px] lg:w-auto shrink-0 snap-center bg-white border border-neutral-200/90 rounded-3xl p-5 shadow-2xs hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                    >
                        {/* Top Badge */}
                        <div className="absolute top-4 right-4 z-20">
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                Commercial
                            </span>
                        </div>

                        <div>
                            <div className="relative w-full aspect-[16/11] rounded-2xl overflow-hidden mb-4 shadow-2xs">
                                <img
                                    src={assets.serviceCommercial}
                                    alt="Commercial Solar Systems"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-center text-[#1A4D2E] shadow-md border border-neutral-100">
                                    <Building2 className="w-5 h-5 text-[#1A4D2E]" />
                                </div>
                            </div>

                            <h3 className="font-bold text-lg text-neutral-900 leading-snug group-hover:text-[#1A4D2E] transition-colors">
                                Commercial Solar
                            </h3>
                            <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed font-medium">
                                Scalable high-yield solutions for corporate offices, schools, and retail spaces.
                            </p>

                            <div className="mt-4 pt-3 border-t border-neutral-100 space-y-1.5">
                                <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                    Accelerated tax depreciation
                                </div>
                                <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                    Optimized peak-load offset
                                </div>
                            </div>
                        </div>

                        <a href="/services#solar-section" className="mt-6 flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-700 group-hover:text-[#1A4D2E] transition-colors">Learn More</span>
                            <div className="w-9 h-9 rounded-full bg-[#E5F5E8] text-[#1A4D2E] flex items-center justify-center group-hover:bg-[#1A4D2E] group-hover:text-white transition-all shadow-2xs">
                                <ArrowUpRight className="w-4 h-4" />
                            </div>
                        </a>
                    </motion.div>

                    {/* Card 3: Industrial Solar Solutions */}
                    <motion.div
                        whileHover={{ y: -8 }}
                        transition={{ duration: 0.3 }}
                        className="w-[84vw] max-w-[320px] sm:w-[330px] md:w-[350px] lg:w-auto shrink-0 snap-center bg-white border border-neutral-200/90 rounded-3xl p-5 shadow-2xs hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                    >
                        {/* Top Badge */}
                        <div className="absolute top-4 right-4 z-20">
                            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                Industrial
                            </span>
                        </div>

                        <div>
                            <div className="relative w-full aspect-[16/11] rounded-2xl overflow-hidden mb-4 shadow-2xs">
                                <img
                                    src={assets.serviceIndustrial}
                                    alt="Industrial Solar Solutions"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-center text-[#1A4D2E] shadow-md border border-neutral-100">
                                    <Factory className="w-5 h-5 text-[#1A4D2E]" />
                                </div>
                            </div>

                            <h3 className="font-bold text-lg text-neutral-900 leading-snug group-hover:text-[#1A4D2E] transition-colors">
                                Industrial Solar
                            </h3>
                            <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed font-medium">
                                Heavy-capacity solar infrastructure built for factories, warehouses, and manufacturing plants.
                            </p>

                            <div className="mt-4 pt-3 border-t border-neutral-100 space-y-1.5">
                                <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                                    Megawatt scale installations
                                </div>
                                <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                                    Custom HT & LT grid integration
                                </div>
                            </div>
                        </div>

                        <a href="/services#solar-section" className="mt-6 flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-700 group-hover:text-[#1A4D2E] transition-colors">Learn More</span>
                            <div className="w-9 h-9 rounded-full bg-[#E5F5E8] text-[#1A4D2E] flex items-center justify-center group-hover:bg-[#1A4D2E] group-hover:text-white transition-all shadow-2xs">
                                <ArrowUpRight className="w-4 h-4" />
                            </div>
                        </a>
                    </motion.div>

                    {/* Card 4: Maintenance & Support */}
                    <motion.div
                        whileHover={{ y: -8 }}
                        transition={{ duration: 0.3 }}
                        className="w-[84vw] max-w-[320px] sm:w-[330px] md:w-[350px] lg:w-auto shrink-0 snap-center bg-white border border-neutral-200/90 rounded-3xl p-5 shadow-2xs hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                    >
                        {/* Top Badge */}
                        <div className="absolute top-4 right-4 z-20">
                            <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                24/7 Support
                            </span>
                        </div>

                        <div>
                            <div className="relative w-full aspect-[16/11] rounded-2xl overflow-hidden mb-4 shadow-2xs bg-gradient-to-tr from-slate-100 to-emerald-50 flex items-center justify-center">
                                <img
                                    src={assets.serviceMaintenance}
                                    alt="Maintenance & Support"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-center text-[#1A4D2E] shadow-md border border-neutral-100">
                                    <Wrench className="w-5 h-5 text-[#1A4D2E]" />
                                </div>
                            </div>

                            <h3 className="font-bold text-lg text-neutral-900 leading-snug group-hover:text-[#1A4D2E] transition-colors">
                                Maintenance & Support
                            </h3>
                            <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed font-medium">
                                Comprehensive maintenance, panel cleaning, and annual maintenance contracts (AMC).
                            </p>

                            <div className="mt-4 pt-3 border-t border-neutral-100 space-y-1.5">
                                <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                    Rapid on-site emergency repair
                                </div>
                                <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                    Performance optimization checks
                                </div>
                            </div>
                        </div>

                        <a href="/services#cctv-section" className="mt-6 flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-700 group-hover:text-[#1A4D2E] transition-colors">Learn More</span>
                            <div className="w-9 h-9 rounded-full bg-[#E5F5E8] text-[#1A4D2E] flex items-center justify-center group-hover:bg-[#1A4D2E] group-hover:text-white transition-all shadow-2xs">
                                <ArrowUpRight className="w-4 h-4" />
                            </div>
                        </a>
                    </motion.div>

                </div>

                {/* Interactive Carousel Pagination Dots (Visible on Mobile & Tablet Carousel, Hidden on Desktop Grid) */}
                <div className="flex lg:hidden items-center justify-center gap-2 mt-6">
                    {[0, 1, 2, 3].map((idx) => (
                        <button
                            key={idx}
                            onClick={() => scrollToSlide(idx)}
                            className={`transition-all duration-300 rounded-full ${
                                activeSlide === idx
                                    ? 'w-7 h-2.5 bg-[#1A4D2E]'
                                    : 'w-2.5 h-2.5 bg-neutral-300 hover:bg-neutral-400'
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
