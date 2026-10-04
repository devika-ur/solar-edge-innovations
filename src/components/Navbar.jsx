import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, LayoutGrid, Zap, Share2, Mail, Phone, X as CloseIcon, Info } from "lucide-react";
import { PiWhatsappLogoThin } from "react-icons/pi";
import { FiChevronRight } from "react-icons/fi";
import { NavLink, useLocation } from "react-router-dom";
import { assets } from "../assets/assets";

export default function Navbar() {
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  // Determine active route state dynamically
  const getActiveId = () => {
    if (pathname === "/") return "home";
    if (pathname.startsWith("/about")) return "about";
    if (pathname.startsWith("/services")) return "services";
    if (pathname.startsWith("/projects")) return "projects";
    if (pathname.startsWith("/contact")) return "contact";
    return "home";
  };

  const activePage = getActiveId();

  const desktopLinks = [
    { name: "Home", id: "home", path: "/" },
    { name: "About Us", id: "about", path: "/about" },
    { name: "Services", id: "services", path: "/services" },
    { name: "Projects", id: "projects", path: "/projects" },
    { name: "Contact", id: "contact", path: "/contact" },
  ];

  const mobileLinks = [
    { name: "Home", id: "home", path: "/", icon: <Home size={17} /> },
    { name: "About", id: "about", path: "/about", icon: <Info size={17} /> },
    { name: "Services", id: "services", path: "/services", icon: <Zap size={17} /> },
    { name: "Projects", id: "projects", path: "/projects", icon: <LayoutGrid size={17} /> },
    { name: "Contact", id: "contact", path: "/contact", icon: <Mail size={17} /> },
  ];

  return (
    <>
      {/* --- DESKTOP NAVBAR --- */}
      <div className="fixed top-0 left-0 w-full hidden md:flex justify-center z-50 p-4 pointer-events-none">
        <nav className="relative pointer-events-auto flex justify-between items-center transition-all duration-500 ease-in-out bg-white/95 backdrop-blur-md border border-neutral-100/80 rounded-full px-6 py-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.08)] w-full max-w-4xl">
          
          {/* Left Side: Logo */}
          <NavLink to="/" className="relative z-10 flex items-center shrink-0">
            <img
              src={assets.logo}
              alt="Solar Edge Logo"
              className="h-14 md:h-16 w-auto object-contain transition-all hover:scale-105"
            />
          </NavLink>

          {/* Navigation Links */}
          <ul className="relative z-10 flex items-center gap-2 text-[11px] font-bold tracking-widest font-sans uppercase">
            {desktopLinks.map((link) => {
              const isActive = activePage === link.id;
              return (
                <li key={link.name} className="relative flex items-center justify-center">
                  {isActive && (
                    <motion.div
                      layoutId="desktopActivePill"
                      className="absolute inset-0 bg-neutral-100/70 border border-neutral-200/40 rounded-full z-0 shadow-xs"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <NavLink
                    to={link.path}
                    className={`relative z-10 px-3.5 py-2 transition-colors duration-300 ${
                      isActive ? "text-green-950 font-extrabold" : "text-neutral-500 hover:text-green-900"
                    }`}
                  >
                    {link.name}
                  </NavLink>
                </li>
              );
            })}
          </ul>

          {/* Right Side: CTA */}
          <NavLink
            to="/contact"
            className="relative z-10 inline-flex items-center gap-2 bg-green-950 text-white rounded-full font-medium transition-all group hover:bg-green-900 pl-4 pr-1.5 py-1.5 text-xs shrink-0"
          >
            Get in touch
            <span className="bg-white text-green-950 rounded-full transition-transform group-hover:translate-x-0.5 p-1 flex items-center justify-center">
              <FiChevronRight size={12} />
            </span>
          </NavLink>
        </nav>
      </div>

      {/* --- MOBILE BOTTOM TAB BAR --- */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 w-[95%] max-w-md md:hidden pointer-events-auto">
        {/* Main Tab capsule */}
        <div className="flex-1 bg-[#05180D]/95 backdrop-blur-lg border border-[#0d2e1c]/85 rounded-full py-1.5 px-2 flex items-center justify-around shadow-xl">
          {mobileLinks.map((link) => {
            const isActive = activePage === link.id;
            return (
              <NavLink
                key={link.id}
                to={link.path}
                className={`flex flex-col items-center justify-center flex-1 py-1 rounded-2xl transition-all duration-300 relative ${
                  isActive ? "text-green-50" : "text-neutral-400 hover:text-green-50"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-[#0d2e1c] rounded-2xl z-0 shadow-inner border border-green-900/30"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.icon}</span>
                <span className="text-[9px] font-medium mt-1 tracking-wider relative z-10">
                  {link.name}
                </span>
              </NavLink>
            );
          })}
        </div>

        {/* Circular Action Button */}
        <div className="relative">
          <button
            onClick={() => setIsSocialOpen(!isSocialOpen)}
            className={`w-12 h-12 bg-[#05180D]/95 backdrop-blur-lg border border-[#0d2e1c]/85 rounded-full flex items-center justify-center shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all ${
              isSocialOpen ? "text-white bg-[#0d2e1c] border-green-800 rotate-180" : "text-neutral-400 hover:text-white"
            }`}
            aria-label="Social links"
          >
            {isSocialOpen ? <CloseIcon size={20} /> : <Share2 size={20} />}
          </button>

          {/* Social dropdown popup */}
          <AnimatePresence>
            {isSocialOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                className="absolute bottom-16 right-0 bg-[#05180D]/95 backdrop-blur-md border border-[#0d2e1c]/85 rounded-2xl p-3 flex flex-col gap-3 shadow-2xl z-50 min-w-[50px] items-center"
              >
                <a
                  href="tel:+919526801406"
                  className="w-9 h-9 rounded-full bg-[#0d2e1c] hover:bg-green-800 flex items-center justify-center text-green-50 hover:text-white transition-all shadow-sm"
                  aria-label="Call Support"
                >
                  <Phone size={16} />
                </a>
                <a
                  href="https://wa.me/918289841004"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#0d2e1c] hover:bg-green-800 flex items-center justify-center text-green-50 hover:text-white transition-all shadow-sm"
                  aria-label="WhatsApp Support"
                >
                  <PiWhatsappLogoThin size={18} />
                </a>
                <a
                  href="mailto:solaredgeinnovations25@gmail.com"
                  className="w-9 h-9 rounded-full bg-[#0d2e1c] hover:bg-green-800 flex items-center justify-center text-green-50 hover:text-white transition-all shadow-sm"
                  aria-label="Email Support"
                >
                  <Mail size={16} />
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}