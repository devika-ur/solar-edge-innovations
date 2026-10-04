import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from "react-helmet-async";
import ProfileCard from '../sections/ProfileCard';
import { Users, CheckCircle2, Leaf, Star, Zap, X, Target, Eye, ShieldCheck } from 'lucide-react';
import { FiChevronRight } from 'react-icons/fi';

const AboutUs = () => {
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    const handleScrollToStory = (e) => {
        e.preventDefault();
        const element = document.getElementById('our-story');
        if (element) {
            if (window.lenis) {
                window.lenis.scrollTo(element, { duration: 1.2 });
            } else {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <>
            {/* SEO Meta Tags */}
            <Helmet>
                <title>About Us | Solar Edge Innovation</title>
                <meta
                    name="description"
                    content="Learn about Solar Edge Innovation's mission to deliver reliable, sustainable solar energy solutions and smart technologies for homes and businesses."
                />
                <meta
                    name="keywords"
                    content="best solar panels in Kerala, affordable solar service Kerala, best solar company near me, solar panel installation Kerala, home solar solutions Kerala, solar power for home Kerala, solar energy service Kerala, solar battery Kerala, home solar battery Kerala, best solar batteries Kerala, affordable solar battery Kerala, reliable solar service Kerala, trusted solar company Kerala, solar maintenance Kerala, best CCTV cameras Kerala, CCTV installation near me, home security Kerala, affordable CCTV Kerala, CCTV service Kerala, security camera service Kerala, best solar in varkala, best inverter in varkala, best cctv in varkala, best solar in elakamon, best inverter in elakamon, best cctv in elakamon, best solar in onninmoodu, best inverter in onninmoodu, best cctv in onninmoodu, best solar in parippally, best inverter in parippally, best cctv in parippally, best solar in paravur, best inverter in paravur, best cctv in paravur, elakamon, onninmoodu, parippally, paravur, solar varkala, inverter varkala, cctv varkala, solar panel installation varkala, inverter battery varkala, cctv camera installation varkala, solar company varkala, inverter shop varkala, cctv dealers varkala, solar panel price in varkala, inverter service varkala, security cameras varkala, solar elakamon, inverter elakamon, cctv elakamon, solar onninmoodu, inverter onninmoodu, cctv onninmoodu, solar parippally, inverter parippally, cctv parippally, solar paravur, inverter paravur, cctv paravur, kollam, pthanamthitta, pathanamthitta, thrivananthapuram, trivandrum, varkala, ayroor, elakamon, solar trivandrum, solar edge trivandrum, solar varkala, solar kollam, solar store, inverter kollam, inverter paripally, inverter parippally, battery varkala, camera pathanamthita, camera pathanamthitta, cctv kollam, solar pthanamthitta, solar pathanamthitta, solar edge kollam, solar edge pathanamthitta, solar edge varkala, solar edge thrivananthapuram, solar ayroor, inverter ayroor, battery ayroor, cctv ayroor, inverter trivandrum, inverter pathanamthitta, battery trivandrum, battery kollam, camera trivandrum, camera kollam, camera varkala, cctv trivandrum, cctv pathanamthitta, cctv varkala, cctv elakamon, solar store kollam, solar store trivandrum, solar store varkala"
                />
                <link
                    rel="canonical"
                    href="https://www.solaredgeinnovation.in/about"
                />
                <meta property="og:title" content="About Us | Solar Edge Innovation" />
                <meta property="og:description" content="Discover how Solar Edge Innovation is transforming renewable energy through solar panels, inverters, and smart power solutions." />
                <meta property="og:image" content="https://www.solaredgeinnovation.in/logo.png" />
                <meta property="og:url" content="https://www.solaredgeinnovation.in/about" />
                <meta name="twitter:card" content="summary_large_image" />

                <script type="application/ld+json">
                    {`
{
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "About Solar Edge Innovation",
  "url": "https://www.solaredgeinnovation.in/about",
  "description": "Learn about Solar Edge Innovation’s mission and commitment to delivering reliable solar panels, inverters, batteries, and CCTV solutions across Kerala.",
  
  "mainEntity": {
    "@type": "Organization",
    "name": "Solar Edge Innovation",
    "url": "https://www.solaredgeinnovation.in/",
    "logo": "https://www.solaredgeinnovation.in/logo.png",
    "foundingDate": "2020",
    "description": "Solar Edge specializes in high-quality solar energy systems, security cameras, inverters, and custom energy solutions for homes and businesses.",
    
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Elakamon, Ayiroor, Varkala",
      "addressLocality": "Varkala",
      "addressRegion": "Kerala",
      "postalCode": "695310",
      "addressCountry": "IN"
    },

    "areaServed": [
      { "@type": "AdministrativeArea", "name": "Kerala" },
      { "@type": "City", "name": "Thiruvananthapuram" },
      { "@type": "City", "name": "Trivandrum" },
      { "@type": "City", "name": "TVM" },
      { "@type": "City", "name": "Kollam" },
      { "@type": "City", "name": "Parippally" },
      { "@type": "City", "name": "Varkala" },
      { "@type": "City", "name": "Elakamon" },
      { "@type": "City", "name": "Onninmoodu" },
      { "@type": "City", "name": "Paravoor" },
      { "@type": "City", "name": "Attingal" },
      { "@type": "City", "name": "Kallambalam" }
    ],

    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+919526801406",
        "email": "solaredgeinnovations25@gmail.com",
        "contactType": "customer service",
        "availableLanguage": ["English", "Malayalam"]
      }
    ],

    "sameAs": [
      "https://maps.google.com?q=Elakamon,Ayiroor,Varkala"
    ]
  }
}
`}
                </script>
            </Helmet>

            <div className="w-full bg-white text-body overflow-x-hidden">
                {/* --- HEADER HERO SECTION (EXACT MOCKUP UI) --- */}
                <section className="relative w-full bg-white pt-28 sm:pt-32 md:pt-36 pb-12 sm:pb-16 lg:pb-20 px-6 sm:px-10 lg:px-16 xl:px-20 overflow-hidden">
                    <div className="max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1460px] mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

                            {/* Left Column: Heading, Description, CTAs, Stats */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center relative z-20"
                            >
                                {/* Label / Overline */}
                                <div className="flex items-center gap-2.5 mb-4 sm:mb-6">
                                    <span className="w-7 h-[2px] bg-neutral-800" />
                                    <span className="text-xs font-bold tracking-[0.2em] text-neutral-800 uppercase font-sans">
                                        ABOUT US
                                    </span>
                                </div>

                                {/* Main Headline */}
                                <h1 className="font-playfair font-bold text-4xl sm:text-5xl lg:text-[50px] xl:text-[58px] leading-[1.08] tracking-[-0.02em] text-[#141414]">
                                    Powering a <br />
                                    <span className="text-[#1A4D2E]">Cleaner, Brighter</span> <br />
                                    Tomorrow
                                </h1>

                                {/* Description Paragraph */}
                                <p className="mt-6 text-neutral-600 text-sm sm:text-[15px] leading-relaxed max-w-lg font-sans">
                                    At Solar Edge Innovations, we are passionate about making clean energy accessible, reliable, and affordable. We design and deliver high-performance solar solutions for homes, businesses, and industries — building a more sustainable future for generations to come.
                                </p>

                                {/* CTA Buttons */}
                                <div className="flex flex-wrap items-center gap-5 sm:gap-7 mt-8 sm:mt-10">
                                    {/* Primary Button */}
                                    <a
                                        href="#our-story"
                                        onClick={handleScrollToStory}
                                        className="inline-flex items-center gap-3.5 bg-[#153E26] hover:bg-[#1B4E30] text-white pl-6 pr-2 py-2 rounded-full font-medium text-sm transition-all duration-300 shadow-md shadow-emerald-950/15 group cursor-pointer"
                                    >
                                        <span className="font-semibold tracking-wide">Our Story</span>
                                        <span className="w-7 h-7 rounded-full bg-white text-[#153E26] flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5">
                                            <FiChevronRight className="w-4 h-4 stroke-[3]" />
                                        </span>
                                    </a>

                                    {/* Secondary Video Button */}
                                    <button
                                        type="button"
                                        onClick={() => setIsVideoOpen(true)}
                                        className="inline-flex items-center gap-3.5 group text-left cursor-pointer transition-all"
                                    >
                                        <div className="w-11 h-11 rounded-full bg-[#E8F5E9] group-hover:bg-[#DCFCE7] text-[#15803D] flex items-center justify-center transition-all duration-300 shadow-xs">
                                            <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-neutral-900 group-hover:text-[#1A4D2E] transition-colors leading-tight">
                                                Watch Our Story
                                            </div>
                                            <div className="text-xs text-neutral-400 font-medium leading-tight mt-0.5">
                                                1:30 min
                                            </div>
                                        </div>
                                    </button>
                                </div>

                                {/* Metrics / Stats Bar - Perfectly Spaced & Aligned */}
                                <div className="pt-10 sm:pt-12 mt-2 w-full lg:w-[125%] xl:w-[135%] flex flex-wrap items-center justify-between gap-y-6 gap-x-4 sm:gap-x-6 xl:gap-x-8">
                                    {/* 500+ Happy Clients */}
                                    <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                                        <div className="text-[#1A4D2E] shrink-0">
                                            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-base sm:text-lg font-bold text-neutral-900 leading-tight">200+</span>
                                            <span className="text-[11px] sm:text-xs text-neutral-500 font-medium leading-tight mt-0.5 whitespace-nowrap">Happy Clients</span>
                                        </div>
                                    </div>

                                    {/* 20+ Projects Completed */}
                                    <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                                        <div className="text-[#1A4D2E] shrink-0">
                                            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-base sm:text-lg font-bold text-neutral-900 leading-tight">200+</span>
                                            <span className="text-[11px] sm:text-xs text-neutral-500 font-medium leading-tight mt-0.5 whitespace-nowrap">Projects Completed</span>
                                        </div>
                                    </div>

                                    {/* 12,000+ Tons of CO2 Offset */}
                                    <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                                        <div className="text-[#1A4D2E] shrink-0">
                                            <Leaf className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-base sm:text-lg font-bold text-neutral-900 leading-tight">12,000+</span>
                                            <span className="text-[11px] sm:text-xs text-neutral-500 font-medium leading-tight mt-0.5 whitespace-nowrap">Tons of CO₂ Offset</span>
                                        </div>
                                    </div>

                                    {/* 4.9/5 Customer Rating */}
                                    <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                                        <div className="text-[#1A4D2E] shrink-0">
                                            <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-[#1A4D2E]" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-base sm:text-lg font-bold text-neutral-900 leading-tight">4.9/5</span>
                                            <span className="text-[11px] sm:text-xs text-neutral-500 font-medium leading-tight mt-0.5 whitespace-nowrap">Customer Rating</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Right Column: Hero House Illustration with Annotations and Floating Cards - EXPANDED */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
                                className="lg:col-span-7 xl:col-span-7 relative flex items-center justify-center lg:justify-end pt-8 lg:pt-0"
                            >
                                {/* Soft Mint Pastel Arch Backdrop */}
                                <div className="absolute right-0 sm:right-2 top-0 sm:top-2 w-[95%] lg:w-[105%] max-w-[700px] h-[95%] lg:h-[105%] bg-[#E8F6EB] rounded-t-[320px] rounded-b-[180px] -z-10 pointer-events-none transform translate-x-2 lg:translate-x-6" />

                                {/* Sustainable Living Hand-drawn Annotation + Sun + Arrow */}
                                <div className="absolute -top-4 sm:top-0 right-2 sm:right-4 lg:right-6 z-20 flex flex-col items-end pointer-events-none select-none">
                                    <div className="flex items-start gap-2">
                                        {/* Cursive Handwriting */}
                                        <div className="font-['Caveat',cursive] text-[#55695A] text-2xl sm:text-3xl font-bold -rotate-6 leading-tight text-right pt-2 mr-1">
                                            Sustainable<br />
                                            Living
                                        </div>

                                        {/* Cheerful Sun Icon */}
                                        <div className="relative">
                                            <svg className="w-10 h-10 sm:w-12 sm:h-12" viewBox="0 0 48 48" fill="none">
                                                <circle cx="24" cy="24" r="8" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2" />
                                                <line x1="24" y1="5" x2="24" y2="10" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
                                                <line x1="24" y1="38" x2="24" y2="43" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
                                                <line x1="5" y1="24" x2="10" y2="24" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
                                                <line x1="38" y1="24" x2="43" y2="24" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
                                                <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
                                                <line x1="34" y1="34" x2="37.5" y2="37.5" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
                                                <line x1="10.5" y1="37.5" x2="14" y2="34" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
                                                <line x1="34" y1="14" x2="37.5" y2="10.5" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Hand-drawn curved arrow pointing to solar panels */}
                                    <div className="mr-8 sm:mr-10 -mt-1">
                                        <svg width="44" height="44" viewBox="0 0 50 50" fill="none" className="text-[#55695A] opacity-85">
                                            <path d="M42 4 C 36 20, 24 32, 10 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            <path d="M18 39 L 9 41 L 11 31" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Floating Card 1 (Top-Left of House): 100% Clean Energy */}
                                <motion.div
                                    animate={{ y: [-4, 4, -4] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                    className="absolute -top-4 sm:top-2 left-0 sm:left-2 lg:-left-6 z-20 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-[0_14px_35px_rgba(0,0,0,0.08)] border border-neutral-100/90 flex items-center gap-3.5"
                                >
                                    <div className="w-11 h-11 rounded-xl bg-[#E8F5E9] flex items-center justify-center text-[#1A4D2E] shrink-0">
                                        <Leaf className="w-5 h-5 fill-[#1A4D2E]" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase font-sans">
                                            CLEAN ENERGY
                                        </div>
                                        <div className="text-lg font-extrabold text-neutral-900 leading-tight">
                                            100%
                                        </div>
                                        <div className="text-[11px] font-medium text-neutral-500 leading-tight">
                                            Sustainable Future
                                        </div>
                                    </div>
                                </motion.div>

                                {/* House Render Image */}
                                <div className="relative z-10 w-full flex justify-center lg:justify-end pt-4 sm:pt-6">
                                    <img
                                        src={assets.aboutusBannerImage}
                                        alt="Solar Edge modern sustainable home"
                                        className="w-full h-auto object-contain max-w-[720px] lg:max-w-[780px] xl:max-w-[880px] scale-100 lg:scale-[1.06] drop-shadow-2xl transition-transform duration-500 hover:scale-[1.09]"
                                    />
                                </div>

                                {/* Floating Card 2 (Bottom-Right of House): Trusted Solar Partner */}
                                <motion.div
                                    animate={{ y: [4, -4, 4] }}
                                    transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.4 }}
                                    className="absolute -bottom-6 sm:bottom-0 right-0 sm:right-2 lg:-right-4 z-20 bg-white/95 backdrop-blur-md rounded-full sm:rounded-2xl px-5 py-3 sm:py-3.5 shadow-[0_14px_35px_rgba(0,0,0,0.08)] border border-neutral-100/90 flex items-center gap-3.5"
                                >
                                    <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#1A4D2E] shrink-0">
                                        <Zap className="w-5 h-5 fill-[#1A4D2E]" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-neutral-900 leading-tight">
                                            Trusted Solar Partner
                                        </div>
                                        <div className="text-xs text-neutral-500 font-medium leading-tight mt-0.5">
                                            For a Greener Planet
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>

                        </div>
                    </div>
                </section>

                {/* --- MISSION, VISION, VALUES BANNER CARD (EXACT MOCKUP UI) --- */}
                <section className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 mb-16 sm:mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="max-w-7xl mx-auto bg-[#F4F9F5] border border-[#E2EFE5] rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 lg:p-12 shadow-xs"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200/70">

                            {/* 1. Our Mission */}
                            <div className="flex items-start gap-4 sm:gap-5 pr-0 lg:pr-8 pb-8 lg:pb-0">
                                <div className="w-12 h-12 rounded-full bg-[#E5F5E8] flex items-center justify-center text-[#1A4D2E] shrink-0 mt-0.5 shadow-2xs">
                                    <Target className="w-6 h-6 stroke-[2.2]" />
                                </div>
                                <div>
                                    <h2 className="font-playfair font-bold text-xl sm:text-2xl text-neutral-900 leading-tight">
                                        Our Mission
                                    </h2>
                                    <p className="mt-2.5 text-xs sm:text-[13px] text-neutral-600 leading-relaxed font-sans">
                                        To accelerate the world's transition to clean energy by delivering innovative solar solutions that empower communities and protect the environment.
                                    </p>
                                </div>
                            </div>

                            {/* 2. Our Vision */}
                            <div className="flex items-start gap-4 sm:gap-5 px-0 lg:px-8 py-8 lg:py-0">
                                <div className="w-12 h-12 rounded-full bg-[#E5F5E8] flex items-center justify-center text-[#1A4D2E] shrink-0 mt-0.5 shadow-2xs">
                                    <Eye className="w-6 h-6 stroke-[2.2]" />
                                </div>
                                <div>
                                    <h2 className="font-playfair font-bold text-xl sm:text-2xl text-neutral-900 leading-tight">
                                        Our Vision
                                    </h2>
                                    <p className="mt-2.5 text-xs sm:text-[13px] text-neutral-600 leading-relaxed font-sans">
                                        A cleaner, greener world where every home, business, and industry runs on renewable energy — for a healthier planet and a brighter tomorrow.
                                    </p>
                                </div>
                            </div>

                            {/* 3. Our Values */}
                            <div className="flex items-start gap-4 sm:gap-5 pl-0 lg:pl-8 pt-8 lg:pt-0">
                                <div className="w-12 h-12 rounded-full bg-[#E5F5E8] flex items-center justify-center text-[#1A4D2E] shrink-0 mt-0.5 shadow-2xs">
                                    <svg className="w-6 h-6 text-[#1A4D2E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                    </svg>
                                </div>
                                <div className="w-full">
                                    <h2 className="font-playfair font-bold text-xl sm:text-2xl text-neutral-900 leading-tight">
                                        Our Values
                                    </h2>
                                    <div className="mt-3.5 flex flex-wrap gap-2">
                                        <span className="bg-white border border-neutral-200/90 rounded-full px-3.5 py-1 text-[11px] sm:text-xs font-medium text-neutral-700 shadow-2xs">
                                            Sustainability
                                        </span>
                                        <span className="bg-white border border-neutral-200/90 rounded-full px-3.5 py-1 text-[11px] sm:text-xs font-medium text-neutral-700 shadow-2xs">
                                            Innovation
                                        </span>
                                        <span className="bg-white border border-neutral-200/90 rounded-full px-3.5 py-1 text-[11px] sm:text-xs font-medium text-neutral-700 shadow-2xs">
                                            Integrity
                                        </span>
                                        <span className="bg-white border border-neutral-200/90 rounded-full px-3.5 py-1 text-[11px] sm:text-xs font-medium text-neutral-700 shadow-2xs">
                                            Customer Focus
                                        </span>
                                        <span className="bg-white border border-neutral-200/90 rounded-full px-3.5 py-1 text-[11px] sm:text-xs font-medium text-neutral-700 shadow-2xs">
                                            Community Impact
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </section>

                {/* --- WHY CHOOSE US SECTION (EXACT MOCKUP UI) --- */}
                <section className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 mb-4 sm:mb-6">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-6 items-start"
                        >
                            {/* Left: Heading and Subtitle */}
                            <div className="xl:col-span-4 flex flex-col justify-start pr-0 xl:pr-4">
                                <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
                                    <span className="w-7 h-[2px] bg-neutral-800" />
                                    <span className="text-xs font-bold tracking-[0.2em] text-neutral-800 uppercase font-sans">
                                        WHY CHOOSE US
                                    </span>
                                </div>
                                <h2 className="font-playfair font-bold text-3xl sm:text-4xl text-neutral-900 leading-tight">
                                    More Than Just <br className="hidden sm:inline" />Solar Panels
                                </h2>
                                <p className="mt-3.5 text-neutral-500 text-xs sm:text-sm leading-relaxed max-w-sm font-sans">
                                    We provide end-to-end solar energy solutions with a commitment to quality, innovation, and long-term value.
                                </p>
                            </div>

                            {/* Right: 4 Value Cards */}
                            <div className="xl:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                                {/* Card 1: Complete Solutions */}
                                <div className="bg-white border border-neutral-100 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-start group">
                                    <div className="w-10 h-10 rounded-full bg-[#E5F5E8] flex items-center justify-center text-[#1A4D2E] group-hover:scale-105 transition-transform shadow-2xs">
                                        <svg className="w-5 h-5 text-[#1A4D2E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="3 14 6 5 18 5 21 14 3 14" />
                                            <line x1="12" y1="5" x2="12" y2="14" />
                                            <line x1="8" y1="9" x2="16" y2="9" />
                                            <line x1="9" y1="14" x2="7" y2="20" />
                                            <line x1="15" y1="14" x2="17" y2="20" />
                                            <line x1="6" y1="20" x2="18" y2="20" />
                                        </svg>
                                    </div>
                                    <h3 className="font-bold text-sm sm:text-base text-neutral-900 mt-4 leading-snug">
                                        Complete Solutions
                                    </h3>
                                    <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed font-sans">
                                        From design to installation and maintenance, we handle everything.
                                    </p>
                                </div>

                                {/* Card 2: Trusted Quality */}
                                <div className="bg-white border border-neutral-100 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-start group">
                                    <div className="w-10 h-10 rounded-full bg-[#E5F5E8] flex items-center justify-center text-[#1A4D2E] group-hover:scale-105 transition-transform shadow-2xs">
                                        <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                                    </div>
                                    <h3 className="font-bold text-sm sm:text-base text-neutral-900 mt-4 leading-snug">
                                        Trusted Quality
                                    </h3>
                                    <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed font-sans">
                                        We use premium products and industry-leading technology.
                                    </p>
                                </div>

                                {/* Card 3: Expert Team */}
                                <div className="bg-white border border-neutral-100 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-start group">
                                    <div className="w-10 h-10 rounded-full bg-[#E5F5E8] flex items-center justify-center text-[#1A4D2E] group-hover:scale-105 transition-transform shadow-2xs">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-sm sm:text-base text-neutral-900 mt-4 leading-snug">
                                        Expert Team
                                    </h3>
                                    <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed font-sans">
                                        A dedicated team of engineers and technicians with years of experience.
                                    </p>
                                </div>

                                {/* Card 4: Long-Term Support */}
                                <div className="bg-white border border-neutral-100 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-start group">
                                    <div className="w-10 h-10 rounded-full bg-[#E5F5E8] flex items-center justify-center text-[#1A4D2E] group-hover:scale-105 transition-transform shadow-2xs">
                                        <Leaf className="w-5 h-5 fill-[#1A4D2E]" />
                                    </div>
                                    <h3 className="font-bold text-sm sm:text-base text-neutral-900 mt-4 leading-snug">
                                        Long-Term Support
                                    </h3>
                                    <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed font-sans">
                                        We stand by you with regular maintenance and responsive support.
                                    </p>
                                </div>

                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* --- FOUNDER & COMPANY STORY (PRESERVED) --- */}
                <div id="our-story">
                    <ProfileCard />
                </div>
            </div>

            {/* Video Story Modal */}
            <AnimatePresence>
                {isVideoOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
                        onClick={() => setIsVideoOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-3xl bg-neutral-950 rounded-3xl overflow-hidden shadow-2xl border border-neutral-800 p-6 sm:p-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={() => setIsVideoOpen(false)}
                                className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-full bg-neutral-900/80 transition-colors cursor-pointer"
                                aria-label="Close video"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="mb-4">
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">Solar Edge Innovation</span>
                                <h3 className="text-2xl font-bold font-playfair text-white mt-1">Our Journey & Impact</h3>
                            </div>
                            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-neutral-900 flex items-center justify-center border border-neutral-800">
                                <iframe
                                    className="w-full h-full"
                                    src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=0"
                                    title="Solar Edge Story"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                            <p className="text-xs text-neutral-400 mt-4 leading-relaxed font-sans">
                                High-performance solar energy solutions, inverter engineering, and smart security systems powering sustainable homes and businesses across Kerala.
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AboutUs;




