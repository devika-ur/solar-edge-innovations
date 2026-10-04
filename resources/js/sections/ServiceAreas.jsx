import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Sun, Zap, Shield, ChevronRight } from 'lucide-react';

export default function ServiceAreas() {
    const locations = [
        {
            name: "Trivandrum",
            nameMl: "തിരുവനന്തപുരം",
            desc: "Delivering modern sustainable energy grids and advanced smart security setups to houses, apartments, and enterprises in Trivandrum.",
            descMl: "തിരുവനന്തപുരത്തെ വീടുകൾക്കും ഫ്ലാറ്റുകൾക്കും ഓഫീസുകൾക്കുമായി ആധുനിക ഹരിത ഊർജ്ജ സംവിധാനങ്ങളും സ്മാർട്ട് സുരക്ഷാ ക്രമീകരണങ്ങളും ഒരുക്കുന്നു.",
            title: "Solar Edge solutions in Trivandrum",
            titleMl: "തിരുവനന്തപുരത്തെ സോളാർ എഡ്ജ് സൊല്യൂഷനുകൾ",
            solarText: "As the top solar solution provider, we install the best solar in Trivandrum, utilizing premium panels and microinverters for optimal urban space usage.",
            solarTextMl: "തിരുവനന്തപുരത്ത് മികച്ച സോളാർ പാനലുകൾ ഞങ്ങൾ സ്ഥാപിക്കുന്നു. കുറഞ്ഞ സ്ഥലത്ത് നിന്ന് പരമാവധി വൈദ്യുതി ഉല്പാദിപ്പിക്കാൻ സഹായിക്കുന്ന ഡിസൈനുകൾ.",
            inverterText: "We install the best inverter in Trivandrum, featuring zero-flicker UPS backup systems tailored for IT workspaces and homes in Trivandrum.",
            inverterTextMl: "തിരുവനന്തപുരത്ത് മികച്ച ഇൻവെർട്ടർ/യുപിഎസ് പവർ ബാക്കപ്പുകൾ നേടൂ. ഐടി സ്ഥാപനങ്ങൾക്കും വീടുകൾക്കും ഏറ്റവും അനുയോജ്യമായ തടസ്സമില്ലാത്ത ബാക്കപ്പ്.",
            cctvText: "Upgrade to the best CCTV in Trivandrum. Our AI security systems offer intrusion detection, face recognition, and alarm alerts.",
            cctvTextMl: "തിരുവനന്തപുരത്ത് മികച്ച സിസിടിവി സുരക്ഷ സ്വന്തമാക്കൂ. ആർട്ടിഫിഷ്യൽ ഇന്റലിജൻസ് അലേർട്ടുകളോടും ഇൻട്രൂഷൻ ഡിറ്റക്ഷനോടും കൂടിയ ക്യാമറകൾ."
        },
        {
            name: "Kollam",
            nameMl: "കൊല്ലം",
            desc: "Serving Kollam district with top-grade off-grid and on-grid solar solutions, commercial inverters, and multi-location security networks.",
            descMl: "കൊല്ലം ജില്ലയിലെ വീടുകൾക്കും വാണിജ്യ ആവശ്യങ്ങൾക്കുമായി അത്യാധുനിക സോളാർ പാനലുകളും കൊമേഴ്സ്യൽ ഇൻവെർട്ടറുകളും സിസിടിവി സംവിധാനങ്ങളും ഞങ്ങൾ ഒരുക്കുന്നു.",
            title: "Solar Edge solutions in Kollam",
            titleMl: "കൊല്ലത്തെ സോളാർ എഡ്ജ് സൊല്യൂഷനുകൾ",
            solarText: "Locals rank us for the best solar in Kollam. We deliver state-of-the-art on-grid solar grids with rapid ROI and net-metering facilities.",
            solarTextMl: "കൊല്ലത്ത് മികച്ച സോളാർ ഇൻസ്റ്റാളേഷനായി ആളുകൾ ഞങ്ങളെ തിരഞ്ഞെടുക്കുന്നു. നെറ്റ്-മീറ്ററിംഗ് സൗകര്യങ്ങളോടുകൂടിയ സോളാർ സിസ്റ്റങ്ങൾ വേഗത്തിൽ ഇൻസ്റ്റാൾ ചെയ്തു നൽകുന്നു.",
            inverterText: "We supply the best inverter in Kollam, perfect for commercial setups, shops, and industries needing reliable continuous backup power.",
            inverterTextMl: "കൊല്ലത്ത് മികച്ച ഇൻവെർട്ടർ ബാക്കപ്പുകൾ ഞങ്ങൾ വിതരണം ചെയ്യുന്നു. ബിസിനസ്സ് സ്ഥാപനങ്ങൾക്കും വ്യാപാര കേന്ദ്രങ്ങൾക്കും ഏറ്റവും അനുയോജ്യമായവ.",
            cctvText: "Protect your property with the best CCTV in Kollam, featuring high-definition surveillance with 24/7 remote feed monitoring on your smartphone.",
            cctvTextMl: "24/7 റിമോട്ട് മോണിറ്ററിംഗ് സൗകര്യമുള്ള മികച്ച സിസിടിവി സുരക്ഷ കൊല്ലത്ത് ഞങ്ങൾ വാഗ്ദാനം ചെയ്യുന്നു."
        },
        {
            name: "Pathanamthitta",
            nameMl: "പത്തനംതിട്ട",
            desc: "Bringing dependable solar installations, backup solutions, and AI security cameras to residential and business premises across Pathanamthitta.",
            descMl: "പത്തനംതിട്ടയിലെ വീടുകൾക്കും ബിസിനസ്സ് സ്ഥാപനങ്ങൾക്കും വിശ്വസനീയമായ സോളാർ സിസ്റ്റങ്ങളും പവർ ബാക്കപ്പുകളും സെക്യൂരിറ്റി ക്യാമറകളും നൽകുന്നു.",
            title: "Solar Edge solutions in Pathanamthitta",
            titleMl: "പത്തനംതിട്ടയിലെ സോളാർ എഡ്ജ് സൊല്യൂഷനുകൾ",
            solarText: "Get the best solar in Pathanamthitta. We design optimized solar systems that maximize generation in the hilly terrains and forested areas of Pathanamthitta.",
            solarTextMl: "പത്തനംതിട്ടയിൽ മികച്ച സോളാർ സേവനം സ്വന്തമാക്കൂ. ഉയർന്ന കാര്യക്ഷമതയുള്ള സോളാർ പാനലുകൾ ഉപയോഗിച്ച് നിങ്ങളുടെ വൈദ്യുത ആവശ്യങ്ങൾ ഞങ്ങൾ പരിഹരിക്കുന്നു.",
            inverterText: "We offer the best inverter in Pathanamthitta, featuring smart hybrid systems with long life cycles to combat power outages during monsoon and thunderstorm seasons.",
            inverterTextMl: "പത്തനംതിട്ടയിൽ മികച്ച ഇൻവെർട്ടർ ബാക്കപ്പ് ഉറപ്പാക്കൂ. കനത്ത ഇടിമിന്നലും മഴയുമുള്ള സമയത്തും തടസ്സമില്ലാത്ത വൈദ്യുതി ഞങ്ങളുടെ സ്മാർട്ട് ഇൻവെർട്ടറുകൾ നൽകുന്നു.",
            cctvText: "Secure your estate, home, or business with the best CCTV in Pathanamthitta, equipped with weather-proof casings and smart night vision.",
            cctvTextMl: "കാലാവസ്ഥയെ പ്രതിരോധിക്കുന്നതും നൈറ്റ് വിഷൻ സാങ്കേതികവിദ്യയുമുള്ള മികച്ച സിസിടിവി സുരക്ഷ പത്തനംതിട്ടയിൽ ഞങ്ങൾ ഉറപ്പുനൽകുന്നു."
        }
    ];

    const [activeIdx, setActiveIdx] = useState(0);
    const [lang, setLang] = useState('en'); // 'en' or 'ml'
    const activeLoc = locations[activeIdx];

    return (
        <section id="service-areas" className="py-24 px-6 sm:px-8 md:px-16 lg:px-20 bg-gradient-to-b from-neutral-50 to-white border-t border-neutral-100 text-neutral-900 font-sans relative overflow-hidden">
            {/* Background Glow Decors */}
            <div className="absolute top-1/4 right-0 w-96 h-96 bg-green-100/30 rounded-full filter blur-3xl -z-10 pointer-events-none"></div>
            <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-blue-50/40 rounded-full filter blur-3xl -z-10 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-16">
                    <div className="space-y-3 max-w-2xl">
                        <span className="text-[11px] text-green-700 font-bold tracking-widest uppercase font-mono  w-fit">
                            {lang === 'en' ? "Local Service & Support" : "പ്രാദേശിക സേവനവും പിന്തുണയും"}
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold font-playfair tracking-tight text-neutral-900 leading-tight">
                            {lang === 'en' ? (
                                <>Trusted Across Kerala's<br />Key Service Zones</>
                            ) : (
                                <>കേരളത്തിലെ പ്രധാന സേവന മേഖലകളിൽ<br />വിശ്വസനീയമായ സേവനം</>
                            )}
                        </h2>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-4 max-w-md mt-4 md:mt-0">
                        {/* Premium Language Toggle */}
                        <div className="relative inline-flex items-center bg-neutral-100/85 p-1 rounded-full border border-neutral-200/50 backdrop-blur-xs text-[10px] font-mono">
                            <motion.div
                                layout
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="absolute top-1 bottom-1 rounded-full bg-green-950 shadow-xs"
                                style={{
                                    left: lang === 'en' ? '4px' : 'calc(50% + 2px)',
                                    width: 'calc(50% - 6px)'
                                }}
                            />
                            <button
                                onClick={() => setLang('en')}
                                className={`relative z-10 px-4 py-1.5 rounded-full text-xs font-mono font-semibold transition-colors cursor-pointer ${lang === 'en' ? 'text-white' : 'text-neutral-500 hover:text-neutral-900'
                                    }`}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => setLang('ml')}
                                className={`relative z-10 px-4 py-1.5 rounded-full text-xs font-mono font-semibold transition-colors cursor-pointer ${lang === 'ml' ? 'text-white' : 'text-neutral-500 hover:text-neutral-900'
                                    }`}
                            >
                                മലയാളം
                            </button>
                        </div>
                        <p className="text-sm text-neutral-500 font-light leading-relaxed text-left md:text-right">
                            {lang === 'en'
                                ? "We offer rapid, on-site installation, quick maintenance support, and dedicated local customer service. Find out how we serve your district."
                                : "ഞങ്ങൾ വേഗത്തിലുള്ള ഓൺ-സൈറ്റ് ഇൻസ്റ്റാളേഷൻ, വേഗതയേറിയ മെയിന്റനൻസ് പിന്തുണ, വിശ്വസനീയമായ കസ്റ്റമർ സർവീസ് എന്നിവ ഉറപ്പുനൽകുന്നു. നിങ്ങളുടെ ജില്ലയിലെ ഞങ്ങളുടെ സേവനങ്ങളെക്കുറിച്ച് കൂടുതലറിയൂ."
                            }
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-4 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-3 pb-4 lg:pb-0 scrollbar-none">
                        {locations.map((loc, idx) => {
                            const isActive = activeIdx === idx;
                            return (
                                <motion.button
                                    key={loc.name}
                                    onClick={() => setActiveIdx(idx)}
                                    whileHover={{ x: isActive ? 0 : 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`relative flex items-center gap-4 text-left px-6 py-4.5 rounded-2xl transition-all duration-300 w-full min-w-[160px] lg:min-w-0 cursor-pointer overflow-hidden border ${isActive
                                        ? 'bg-green-950 text-white shadow-lg border-green-900 shadow-green-950/10'
                                        : 'bg-white text-neutral-600 hover:bg-neutral-50 border-neutral-200/60 shadow-xs'
                                        }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeBorder"
                                            className="absolute left-0 top-0 bottom-0 w-1 bg-green-400"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <div className={`p-2 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isActive ? 'bg-green-800/60 text-green-300' : 'bg-neutral-100 text-neutral-400'
                                        }`}>
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-bold text-sm leading-tight tracking-wide">
                                            {lang === 'en' ? loc.name : loc.nameMl}
                                        </p>
                                        <p className={`hidden lg:block text-[10px] mt-1 font-light line-clamp-1 ${isActive ? 'text-green-200/80' : 'text-neutral-400'
                                            }`}>
                                            {lang === 'en' ? loc.desc : loc.descMl}
                                        </p>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 ml-auto hidden lg:block transition-transform duration-300 ${isActive ? 'rotate-90 text-green-300' : 'text-neutral-300'
                                        }`} />
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Content Display Card */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIdx}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="bg-white/80 backdrop-blur-md rounded-[32px] p-8 sm:p-12 border border-neutral-200/70 shadow-[0_20px_50px_rgba(0,0,0,0.03)] h-full flex flex-col justify-between relative overflow-hidden"
                            >
                                <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-full filter blur-2xl pointer-events-none"></div>

                                <div className="space-y-8 relative z-10">
                                    <div className="flex items-center gap-2 text-[10px] text-green-700 tracking-wider font-bold uppercase font-mono bg-green-50 px-3 py-1.5 rounded-full w-fit">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>{lang === 'en' ? "KERALA SERVICE ZONE" : "കേരള സർവീസ് സോൺ"}</span>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 font-playfair">
                                            {lang === 'en' ? activeLoc.title : activeLoc.titleMl}
                                        </h3>
                                        <p className="text-sm text-neutral-500 leading-relaxed font-light max-w-3xl">
                                            {lang === 'en' ? activeLoc.desc : activeLoc.descMl}
                                        </p>
                                    </div>

                                    {/* Grid of services with local SEO keywords explicitly listed */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-neutral-100">
                                        {/* Solar Card */}
                                        <motion.div
                                            whileHover={{ y: -4, shadow: "0 10px 30px rgba(245,158,11,0.08)", borderColor: "#fecaca" }}
                                            className="bg-neutral-50/50 hover:bg-white rounded-2xl p-6 border border-neutral-200/50 transition-all duration-300 space-y-4"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-sm shadow-amber-500/5">
                                                <Sun className="w-5 h-5" />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-neutral-800">
                                                    {lang === 'en' ? "Solar Panels" : "സോളാർ പാനലുകൾ"}
                                                </h4>
                                                <p className="text-[11px] text-neutral-500 leading-relaxed font-light">
                                                    {lang === 'en' ? activeLoc.solarText : activeLoc.solarTextMl}
                                                </p>
                                            </div>
                                        </motion.div>

                                        {/* Inverter Card */}
                                        <motion.div
                                            whileHover={{ y: -4, shadow: "0 10px 30px rgba(59,130,246,0.08)", borderColor: "#bfdbfe" }}
                                            className="bg-neutral-50/50 hover:bg-white rounded-2xl p-6 border border-neutral-200/50 transition-all duration-300 space-y-4"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-sm shadow-blue-500/5">
                                                <Zap className="w-5 h-5" />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-neutral-800">
                                                    {lang === 'en' ? "Inverter Systems" : "ഇൻവെർട്ടർ സിസ്റ്റംസ്"}
                                                </h4>
                                                <p className="text-[11px] text-neutral-500 leading-relaxed font-light">
                                                    {lang === 'en' ? activeLoc.inverterText : activeLoc.inverterTextMl}
                                                </p>
                                            </div>
                                        </motion.div>

                                        {/* CCTV Card */}
                                        <motion.div
                                            whileHover={{ y: -4, shadow: "0 10px 30px rgba(16,185,129,0.08)", borderColor: "#a7f3d0" }}
                                            className="bg-neutral-50/50 hover:bg-white rounded-2xl p-6 border border-neutral-200/50 transition-all duration-300 space-y-4"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm shadow-emerald-500/5">
                                                <Shield className="w-5 h-5" />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-neutral-800">
                                                    {lang === 'en' ? "CCTV Security" : "സിസിടിവി സെക്യൂരിറ്റി"}
                                                </h4>
                                                <p className="text-[11px] text-neutral-500 leading-relaxed font-light">
                                                    {lang === 'en' ? activeLoc.cctvText : activeLoc.cctvTextMl}
                                                </p>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>

                                <div className="mt-10 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                                    <p className="text-xs text-neutral-400 font-light text-center sm:text-left max-w-md">
                                        {lang === 'en'
                                            ? `Need a site survey in ${activeLoc.name}? Contact our engineers for a custom quote.`
                                            : `${activeLoc.nameMl}ൽ സൌജന്യ സൈറ്റ് പരിശോധന ആവശ്യമുണ്ടോ? കൂടുതൽ വിവരങ്ങൾക്ക് ഞങ്ങളുടെ എഞ്ചിനീയർമാരുമായി ബന്ധപ്പെടുക.`
                                        }
                                    </p>
                                    <motion.a
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        href="tel:+919526801406"
                                        className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-green-950 text-white hover:bg-green-900 transition-colors text-xs font-bold font-mono tracking-wider uppercase shadow-md shadow-green-950/10 cursor-pointer"
                                    >
                                        {lang === 'en' ? "Request Callback" : "തിരിച്ചു വിളിക്കാൻ ആവശ്യപ്പെടുക"}
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </motion.a>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}
