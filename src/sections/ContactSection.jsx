import React from 'react';
import { assets } from '../assets/assets';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const contactData = [
    {
        id: 1,
        icon: <Mail className="w-5 h-5" />,
        title: "Chat with Us",
        desc: "Speak with our support representatives for technical inquiries and custom quotes.",
        link: "mailto:solaredgeinnovations25@gmail.com",
        linkLabel: "Email Us",
    },
    {
        id: 2,
        icon: <Phone className="w-5 h-5" />,
        title: "Call or WhatsApp",
        desc: "Get direct phone assistance or prompt mobile support chat at your convenience.",
        link: "tel:+919526801406",
        linkLabel: "+91 95268 01406",
    },
    {
        id: 3,
        icon: <MapPin className="w-5 h-5" />,
        title: "Visit Our Shop",
        desc: "Meet our system engineers, inspect solar equipment panels, and get technical aid.",
        link: "https://maps.google.com?q=Elakamon,Ayiroor,Varkala",
        linkLabel: "Get Directions",
    },
    {
        id: 4,
        icon: <Clock className="w-5 h-5" />,
        title: "Working Hours",
        desc: "Our customer support desks and engineering site surveyors are active.",
        link: "#",
        linkLabel: "Mon – Sat | 9 AM – 8 PM",
    },
];

const ContactSection = () => {
    return (
        <section className="py-20 px-6 sm:px-8 md:px-16 lg:px-20 max-w-7xl mx-auto flex flex-col items-center w-full">
            {/* Header Section */}
            <div className="flex flex-col items-center text-center max-w-xl space-y-3 mb-14">
                <span className="text-[11px] text-green-700 font-semibold tracking-widest uppercase font-mono">
                    GET IN TOUCH
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-playfair tracking-tight text-neutral-900">
                    Connect With Our Team
                </h2>
                <p className="text-sm text-neutral-500 font-light leading-relaxed">
                    Have questions about installations, hybrid backup capacity, or security setups? We are ready to help you customize the perfect system.
                </p>
            </div>

            {/* Grid Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                {contactData.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.08 }}
                        className="bg-white border border-neutral-100/80 p-8 flex flex-col justify-between h-[300px] hover:shadow-md hover:border-neutral-200 rounded-[28px] transition-all duration-300 group cursor-pointer"
                    >
                        <div>
                            {/* Icon Wrapper */}
                            <div className="bg-green-50 text-green-700 w-12 h-12 flex items-center justify-center rounded-2xl border border-green-100/50 group-hover:bg-green-700 group-hover:text-white transition-colors duration-300">
                                {item.icon}
                            </div>

                            {/* Text Blocks */}
                            <h3 className="font-bold text-base text-neutral-950 font-sans tracking-tight mt-6">
                                {item.title}
                            </h3>
                            <p className="text-xs text-neutral-400 font-light leading-relaxed mt-2">
                                {item.desc}
                            </p>
                        </div>

                        {/* Interactive Link or Status Tag */}
                        {item.id === 4 ? (
                            <div className="inline-flex items-center gap-1.5 text-[10px] text-neutral-500 font-bold uppercase tracking-wider font-mono bg-neutral-50 border border-neutral-100/60 px-4 py-2.5 rounded-full select-none w-max mt-4">
                                {item.linkLabel}
                            </div>
                        ) : (
                            <a
                                href={item.link}
                                target={item.link.startsWith("http") ? "_blank" : "_self"}
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-green-700 hover:text-green-600 font-semibold tracking-wider uppercase font-mono mt-4 self-start group/btn"
                            >
                                <span>{item.linkLabel}</span>
                                <span className="group-hover/btn:translate-x-0.5 transition-transform duration-300">→</span>
                            </a>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Map Frame */}
            <div className="w-full mt-16 overflow-hidden rounded-[32px] border border-neutral-100 shadow-xs">
                <img
                    src={assets.mapSvg}
                    alt="Service location map illustration"
                    className="w-full h-auto object-cover opacity-85 hover:opacity-100 transition-opacity duration-500"
                />
            </div>
        </section>
    );
};

export default ContactSection;
