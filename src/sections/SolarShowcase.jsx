import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sun,
    Battery,
    Shield,
    Zap,
    Sparkles,
    Sliders,
    ArrowLeft,
    ArrowRight,
    Gauge,
    Camera,
    Cpu,
    Eye,
    Info,
    CheckCircle,
    HelpCircle,
    Download
} from 'lucide-react';

// Product image imports
import solarImg from '../assets/home.png';
import cctvImg from '../assets/service/CCTV-Camera.png';
import inverterImg from '../assets/Home-page-images/inverter.png';
import logoImg from '../assets/logo/logo.png';
import CircularText from '../components/CircularText';

export default function SolarShowcase() {
    const [activeTab, setActiveTab] = useState('Solar');
    const [specOffset, setSpecOffset] = useState(0);

    const tabs = ['Solar', 'CCTV', 'Inverter'];

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveTab((prev) => {
                const nextIdx = (tabs.indexOf(prev) + 1) % tabs.length;
                return tabs[nextIdx];
            });
        }, 5000);
        return () => clearInterval(timer);
    }, [activeTab]);

    const showcaseData = {
        Solar: {
            title: "Solar Edge Innovation",
            subtitle: "Mono-PERC Solar Array - 2026",
            image: solarImg,
            highlightIcon: <Sun className="w-5 h-5 text-amber-400" />,
            highlightTitle: "Unsurpassed Capture",
            description: "A handcrafted 505-W premium bifacial architecture unleashes a 22.8% module efficiency rate. Aggressive low-light optimization software envelopes advanced grid-balancing technologies.",
            badge: "CELL-TECH // N-TYPE • V2X-compatible",
            accessory: "Tier-1 Cell Quality Certified",
            hotspots: [
                { id: 1, label: "Bifacial Silicon Cells", x: "32%", y: "45%" },
                { id: 2, label: "Anti-Reflective Coating", x: "52%", y: "30%" },
                { id: 3, label: "Anodized Aluminum Frame", x: "72%", y: "60%" }
            ],
            specs: [
                { icon: <Sun className="w-5 h-5 text-green-700" />, label: "Peak Output", val: "505 W", sub: "STC Generation Envelope" },
                { icon: <Gauge className="w-5 h-5 text-green-700" />, label: "Module Efficiency", val: "22.8 %", sub: "Premium N-Type Cells" },
                { icon: <Cpu className="w-5 h-5 text-green-700" />, label: "Temp Coefficient", val: "-0.34 %/°C", sub: "Optimized for Kerala climate" },
                { icon: <Shield className="w-5 h-5 text-green-700" />, label: "Wind Load Rating", val: "5400 Pa", sub: "Severe storm resistant" }
            ]
        },
        CCTV: {
            title: "Solar Edge Security",
            subtitle: "Sentinel Pro AI CCTV - 2026",
            image: cctvImg,
            highlightIcon: <Camera className="w-5 h-5 text-green-400" />,
            highlightTitle: "Smart Edge AI",
            description: "Equipped with Sony Starvis 2 ultra-low-light sensors and built-in AI edge processor for real-time human and vehicle detection. Heavy-duty aluminum body ensures seamless 24/7 security monitoring.",
            badge: "VISION // 4K SENSOR • AI-powered",
            accessory: "IP67 Weatherproof Rated",
            hotspots: [
                { id: 1, label: "Sony Starvis 2 Lens", x: "42%", y: "48%" },
                { id: 2, label: "Dual Infrared LED Array", x: "58%", y: "38%" },
                { id: 3, label: "Heavy Duty Metal Shell", x: "72%", y: "62%" }
            ],
            specs: [
                { icon: <Eye className="w-5 h-5 text-green-700" />, label: "Resolution", val: "4K UHD", sub: "Ultra-high definition clarity" },
                { icon: <Sun className="w-5 h-5 text-green-700" />, label: "Night Vision", val: "45 m", sub: "Clear view in total darkness" },
                { icon: <Cpu className="w-5 h-5 text-green-700" />, label: "Edge Storage", val: "256 GB", sub: "Local MicroSD storage card" },
                { icon: <Shield className="w-5 h-5 text-green-700" />, label: "Smart Telemetry", val: "AI Cloud", sub: "Mobile app notifications" }
            ]
        },

        Inverter: {
            title: "Solar Edge Conversion",
            subtitle: "Quantum Hybrid Inverter - 2026",
            image: inverterImg,
            highlightIcon: <Zap className="w-5 h-5 text-blue-400" />,
            highlightTitle: "98.4% Grid Synergy",
            description: "Advanced smart hybrid inverter offering rapid grid switchover and seamless net-metering synchronization. Integrated WiFi enables live telemetry tracking via mobile app.",
            badge: "CONVERSION // HYBRID • Dual MPPT",
            accessory: "98.4% Conversion Rate",
            hotspots: [
                { id: 1, label: "High-Efficiency Heatsink", x: "28%", y: "45%" },
                { id: 2, label: "Smart LCD Console", x: "55%", y: "40%" },
                { id: 3, label: "Rapid Isolation Switch", x: "72%", y: "60%" }
            ],
            specs: [
                { icon: <Gauge className="w-5 h-5 text-green-700" />, label: "Max Efficiency", val: "98.4 %", sub: "Euro conversion standard" },
                { icon: <Zap className="w-5 h-5 text-green-700" />, label: "Switchover Time", val: "< 10 ms", sub: "Zero-flicker UPS backup" },
                { icon: <Cpu className="w-5 h-5 text-green-700" />, label: "MPPT Trackers", val: "Dual 2", sub: "Independent string inputs" },
                { icon: <Shield className="w-5 h-5 text-green-700" />, label: "Warranty", val: "10 Years", sub: "Manufacturer replacement warranty" }
            ]
        }
    };

    const currentData = showcaseData[activeTab];

    /* ─────────────────────────────────────────────
       Shared Tab Buttons (reused in both layouts)
    ───────────────────────────────────────────── */
    const TabButtons = ({ vertical = false }) => (
        <div className={`flex ${vertical ? 'flex-col' : 'flex-row'} gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none`}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab;
                return (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className="relative text-left px-6 py-3 rounded-full text-sm font-medium transition-colors duration-300 min-w-[100px] flex-shrink-0 cursor-pointer"
                    >
                        {isActive && (
                            <motion.div
                                layoutId={vertical ? 'activeTabBg-v' : 'activeTabBg-h'}
                                className="absolute inset-0 bg-green-900 rounded-full"
                                transition={{ type: 'spring', stiffness: 220, damping: 25 }}
                            />
                        )}
                        <span className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-white' : 'text-neutral-500 hover:text-neutral-850'}`}>
                            {tab}
                        </span>
                    </button>
                );
            })}
        </div>
    );

    /* ─────────────────────────────────────────────
       Shared Product Image
    ───────────────────────────────────────────── */
    const ProductImage = ({ maxW = 'max-w-[400px]', h = 'h-[320px]' }) => (
        <div className={`relative w-full ${maxW} ${h} flex items-center justify-center`}>
            <AnimatePresence mode="wait">
                <motion.img
                    key={activeTab}
                    src={currentData.image}
                    alt={currentData.title}
                    initial={{ opacity: 0, scale: 0.92, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="max-h-full max-w-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.06)]"
                    fetchPriority="high"
                />
            </AnimatePresence>
        </div>
    );

    /* ─────────────────────────────────────────────
       Shared Spec Cards
    ───────────────────────────────────────────── */
    const SpecCards = ({ cols = 'grid-cols-4' }) => (
        <div className={`grid ${cols} gap-3`}>
            {currentData.specs.map((spec, idx) => (
                <motion.div
                    key={activeTab + '-spec-' + idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.07 }}
                    className="relative group flex items-center gap-3 bg-gradient-to-br from-neutral-50 to-white border border-neutral-100 hover:border-green-200/60 rounded-2xl px-4 py-3.5 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-default"
                >
                    <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-gradient-to-b from-green-500 to-green-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        {spec.icon}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[8.5px] uppercase tracking-widest text-neutral-400 font-semibold font-mono truncate">{spec.label}</p>
                        <p className="text-xl font-black tracking-tight text-green-950 font-mono leading-none mt-0.5">
                            {spec.val.split(' ')[0]}
                            {spec.val.split(' ')[1] && (
                                <span className="text-[10px] font-normal text-neutral-400 ml-0.5">{spec.val.split(' ')[1]}</span>
                            )}
                        </p>
                        <p className="text-[9px] text-neutral-400 font-medium mt-0.5 truncate">{spec.sub}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );

    return (
        <>
            {/* ══════════════════════════════════════════════
                DESKTOP LAYOUT  (hidden on mobile)
            ══════════════════════════════════════════════ */}
            <div className="hidden md:flex w-full min-h-screen bg-white text-neutral-900 font-sans pt-36 md:pt-44 lg:pt-40 pb-8 px-8 md:px-16 lg:px-20 items-center justify-center relative overflow-hidden">

                {/* Background watermark text */}
                <div className="absolute inset-x-0 top-44 md:top-48 lg:top-36 flex items-center justify-center opacity-[0.05] pointer-events-none select-none text-green-950 z-0 overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.4 }}
                            className="text-[6rem] md:text-[9rem] lg:text-[14rem] xl:text-[18rem] font-sans font-black tracking-tighter uppercase whitespace-nowrap text-center w-full select-none leading-none"
                        >
                            {activeTab}
                        </motion.span>
                    </AnimatePresence>
                </div>

                <div className="max-w-7xl w-full relative z-10">

                    {/* Header */}
                    <div className="text-left space-y-2 mb-4 flex flex-col items-start">
                        <div className="flex items-center gap-2">
                            <h2 className="text-4xl lg:text-5xl font-bold font-playfair tracking-tight text-neutral-850">
                                Solar Edge Innovations
                            </h2>
                            <button className="p-1 rounded-full text-neutral-300 hover:text-neutral-500 transition-colors">
                                <Info className="w-4 h-4" />
                            </button>
                        </div>
                        <motion.p key={activeTab + '-sub'} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-neutral-400 text-xs font-semibold tracking-wide uppercase font-mono">
                            {currentData.subtitle}
                        </motion.p>
                        <motion.p key={activeTab + '-desc'} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                            className="text-neutral-500 text-sm max-w-2xl mt-2 font-light leading-relaxed">
                            {currentData.description}
                        </motion.p>
                    </div>

                    {/* 3-col grid */}
                    <div className="grid grid-cols-12 gap-4 items-center relative z-10">

                        {/* Left: vertical tabs + stamp */}
                        <div className="col-span-3 flex flex-col justify-start z-10 self-start pt-6">
                            <TabButtons vertical />

                            <div className="relative mt-8 flex items-center justify-start">
                                <CircularText text="SOLAR EDGE * CLEAN ENERGY * INNOVATIONS * " onHover="speedUp" spinDuration={18} className="circular-stamp">
                                    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-full border-2 border-green-900/40 bg-white/60 backdrop-blur-sm">
                                        <img src={logoImg} alt="SEI" className="w-9 h-9 object-contain" />
                                    </div>
                                </CircularText>
                            </div>
                        </div>

                        {/* Center: product image */}
                        <div className="col-span-6 relative h-[480px] lg:h-[530px] flex items-center justify-center">
                            <ProductImage maxW="max-w-[600px] lg:max-w-[680px]" h="h-[460px] lg:h-[510px]" />
                        </div>

                        {/* Right: service portal + brochure */}
                        <div className="col-span-3 flex flex-col justify-center items-end text-right space-y-8 z-10 self-center w-full">
                            <div className="flex flex-col items-end space-y-3">
                                <span className="text-[11px] text-neutral-400 font-semibold tracking-wide uppercase font-mono">Service Portal</span>
                                <p className="text-sm font-bold text-neutral-800 leading-tight">
                                    {activeTab === 'Solar' && 'Explore Solar Systems'}
                                    {activeTab === 'CCTV' && 'Explore CCTV Systems'}
                                    {activeTab === 'Inverter' && 'Explore Inverter Systems'}
                                </p>
                                <a
                                    href={activeTab === 'Solar' ? '/services#solar-section' : activeTab === 'CCTV' ? '/services#cctv-section' : '/services#inverter-section'}
                                    className="w-12 h-12 bg-green-900 text-white rounded-full flex items-center justify-center hover:bg-green-800 transition-all duration-300 shadow-md hover:shadow-lg group cursor-pointer"
                                >
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                </a>
                            </div>

                            {/* Brochure card */}
                            <div className="relative group/brochure w-full max-w-[260px]">
                                <div className="absolute -inset-1.5 bg-gradient-to-tr from-green-300/10 via-emerald-200/5 to-teal-300/10 rounded-[28px] blur-xl opacity-35 group-hover/brochure:opacity-50 group-hover/brochure:scale-[1.02] transition-all duration-700 z-0 pointer-events-none" />
                                <div className="relative z-10 liquid-glass-effect p-5 rounded-[24px] space-y-3 text-left">
                                    <p className="text-[11px] text-green-900 font-bold tracking-wide uppercase font-mono">Product Brochure</p>
                                    <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                                        Download the complete catalog for detailed specifications, blueprints, and system layouts.
                                    </p>
                                    <a
                                        href="/brochures/SolarEdge_Brochure.pdf"
                                        download
                                        className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-green-900 text-white rounded-full text-xs font-semibold hover:bg-green-800 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer group z-10"
                                    >
                                        <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-300" />
                                        Download PDF Brochure
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature highlights */}
                    <div className="mt-15 pt-4 border-t border-neutral-100/80">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-2 bg-green-950 text-white px-3 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                <h3 className="text-[10px] font-bold tracking-widest uppercase font-mono">Feature Highlights</h3>
                            </div>
                            <Info className="w-3.5 h-3.5 text-neutral-300 cursor-help" />
                        </div>
                        <SpecCards cols="grid-cols-4" />
                    </div>

                </div>
            </div>

            {/* ══════════════════════════════════════════════
                MOBILE LAYOUT  (hidden on desktop)
            ══════════════════════════════════════════════ */}
            <div className="flex md:hidden w-full h-auto bg-white text-neutral-900 font-sans pt-8 sm:pt-10 pb-4 px-5 flex-col relative overflow-hidden">

                {/* Header */}
                <div className="flex flex-col gap-1.5 mb-3 z-10">
                    <div className="flex items-center gap-3.5">
                        <img src={logoImg} alt="Solar Edge Logo" className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0 filter drop-shadow-xs" />
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h2 className="text-xl sm:text-2xl font-bold font-playfair tracking-tight text-neutral-850">Solar Edge Innovations</h2>
                                <button className="p-1 rounded-full text-neutral-300"><Info className="w-4 h-4" /></button>
                            </div>
                            <motion.p key={activeTab + '-m-sub'} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="text-neutral-400 text-[10px] font-semibold tracking-wide uppercase font-mono mt-0.5">
                                {currentData.subtitle}
                            </motion.p>
                        </div>
                    </div>
                    <motion.p key={activeTab + '-m-desc'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}
                        className="text-neutral-500 text-xs font-light leading-relaxed mt-1">
                        {currentData.description}
                    </motion.p>
                </div>

                {/* Horizontal tabs */}
                <div className="z-10 mb-1">
                    <TabButtons vertical={false} />
                </div>

                {/* Watermark text below tabs */}
                <div className="overflow-hidden pointer-events-none select-none -mb-6 opacity-[0.05]">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={activeTab + '-m-wm'}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.35 }}
                            className="block text-[4.5rem] sm:text-[6.5rem] md:text-[8.5rem] font-sans font-black tracking-tighter uppercase text-green-950 leading-none text-center"
                        >
                            {activeTab}
                        </motion.span>
                    </AnimatePresence>
                </div>

                {/* Product image */}
                <div className="flex items-center justify-center z-10 mt-0 mb-1">
                    <ProductImage maxW="max-w-[340px]" h="h-[300px]" />
                </div>

                {/* Service portal link */}
                <div className="flex items-center justify-between z-10 mt-1 px-1">
                    <div>
                        <p className="text-[10px] text-neutral-400 font-semibold tracking-wide uppercase font-mono">Service Portal</p>
                        <p className="text-sm font-bold text-neutral-800 mt-0.5">
                            {activeTab === 'Solar' && 'Explore Solar Systems'}
                            {activeTab === 'CCTV' && 'Explore CCTV Systems'}
                            {activeTab === 'Inverter' && 'Explore Inverter Systems'}
                        </p>
                    </div>
                    <a
                        href={activeTab === 'Solar' ? '/services#solar-section' : activeTab === 'CCTV' ? '/services#cctv-section' : '/services#inverter-section'}
                        className="w-11 h-11 bg-green-900 text-white rounded-full flex items-center justify-center hover:bg-green-800 transition-all duration-300 shadow-md group cursor-pointer"
                    >
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                    </a>
                </div>

            </div>
        </>
    );
}