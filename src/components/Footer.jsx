import React from 'react';
import { assets } from '../assets/assets';
import { PiPhoneCallLight } from "react-icons/pi";
import { CiMail } from "react-icons/ci";
import { PiWhatsappLogoThin } from "react-icons/pi";
import { CiLocationOn } from "react-icons/ci";
import { NavLink } from 'react-router-dom';

export const Footer = () => {
    const linkClass = ({ isActive }) =>
        isActive
            ? "text-green-750 font-semibold text-xs transition-colors"
            : "text-neutral-500 hover:text-green-700 text-xs transition-colors";

    return (
        <footer className="relative bg-white border-t border-neutral-100 pt-16 pb-8 overflow-hidden text-neutral-600">
            {/* Background Vector Drawing */}
            <div
                className="absolute inset-0 bg-no-repeat bg-right-bottom bg-contain opacity-[0.05] pointer-events-none z-0"
                style={{ backgroundImage: `url(${assets.vectorDrawing})` }}
            ></div>

            <div className="relative max-w-7xl mx-auto px-6 sm:px-8 md:px-16 lg:px-20 z-10">
                {/* Top Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 md:gap-12 pb-12 border-b border-neutral-100">

                    {/* Column 1: Brand Info */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="flex items-center gap-4">
                            <img src={assets.logo} alt="Solar Edge Logo" className="w-20 h-20 sm:w-24 sm:h-24 object-contain shrink-0 transition-transform hover:scale-105" />
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold tracking-widest uppercase text-neutral-900 font-mono leading-tight">
                                    SOLAR EDGE
                                </h3>
                                <span className="text-xs sm:text-sm text-green-700 font-bold tracking-wider uppercase font-mono">
                                    INNOVATION
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-neutral-400 font-light leading-relaxed max-w-sm">
                            Engineering next-generation solar arrays, hybrid inverter storage, and AI-powered security surveillance systems across Kerala.
                        </p>
                        {/* Social Icons */}
                        <div className="flex gap-4 pt-2">
                            <a href="tel:+919526801406" className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center hover:bg-green-50 hover:text-green-700 border border-neutral-100 transition-colors">
                                <PiPhoneCallLight size={16} />
                            </a>
                            <a href="mailto:solaredgeinnovations25@gmail.com" className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center hover:bg-green-50 hover:text-green-700 border border-neutral-100 transition-colors">
                                <CiMail size={16} />
                            </a>
                            <a href="https://wa.me/918289841004" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center hover:bg-green-50 hover:text-green-700 border border-neutral-100 transition-colors">
                                <PiWhatsappLogoThin size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="lg:col-span-2 lg:pl-2 space-y-4">
                        <h4 className="text-xs font-bold tracking-wider uppercase text-neutral-800 font-mono">Quick Links</h4>
                        <ul className="space-y-2.5">
                            <li>
                                <NavLink to="/" end className={linkClass}>
                                    Home
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/about" className={linkClass}>
                                    About Us
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/services" className={linkClass}>
                                    Services
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/projects" className={linkClass}>
                                    Projects
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/contact" className={linkClass}>
                                    Contact Us
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Solutions */}
                    <div className="lg:col-span-2 space-y-4">
                        <h4 className="text-xs font-bold tracking-wider uppercase text-neutral-800 font-mono">Our Solutions</h4>
                        <ul className="space-y-2.5 text-xs text-neutral-400 font-medium">
                            <li>
                                <NavLink to="/services#solar-section" className="hover:text-green-700 transition-colors">
                                    Solar Systems
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/services#inverter-section" className="hover:text-green-700 transition-colors">
                                    Hybrid Inverters
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/services#cctv-section" className="hover:text-green-700 transition-colors">
                                    CCTV Surveillance
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Service Areas */}
                    <div className="lg:col-span-2 space-y-4">
                        <h4 className="text-xs font-bold tracking-wider uppercase text-neutral-800 font-mono">Service Areas</h4>
                        <ul className="space-y-2.5 text-xs text-neutral-400 font-medium">
                            <li>
                                <NavLink to="/#service-areas" className="hover:text-green-700 transition-colors">Trivandrum</NavLink>
                            </li>
                            <li>
                                <NavLink to="/#service-areas" className="hover:text-green-700 transition-colors">Kollam</NavLink>
                            </li>
                            <li>
                                <NavLink to="/#service-areas" className="hover:text-green-700 transition-colors">Pathanamthitta</NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Column 5: Contact Details */}
                    <div className="lg:col-span-3 space-y-4">
                        <h4 className="text-xs font-bold tracking-wider uppercase text-neutral-800 font-mono">Contact Office</h4>
                        <div className="space-y-3.5 text-xs">
                            <div className="flex items-start gap-2.5 text-neutral-400 leading-relaxed">
                                <CiLocationOn size={18} className="text-green-700 flex-shrink-0 mt-0.5" />
                                <span>
                                    Elakamon, Ayiroor, Varkala,<br />
                                    Varkala Paravoor Road,<br />
                                    Kerala, India (Near Post Office)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Segment */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-[11px] text-neutral-400 font-medium">
                    <p>© {new Date().getFullYear()} Solar Edge Innovation. All rights reserved.</p>
                    <div className="flex gap-4 mt-2 sm:mt-0">
                        <NavLink to="/privacy" className="hover:text-neutral-600 transition-colors">Privacy Policy</NavLink>
                        <span>•</span>
                        <NavLink to="/terms" className="hover:text-neutral-600 transition-colors">Terms of Service</NavLink>
                    </div>
                </div>
            </div>
        </footer>
    );
};
