import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';

const ProjectShowcase = () => {
    const navigate = useNavigate();
    const [showcaseImages, setShowcaseImages] = useState([]);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchShowcase = async () => {
            try {
                const res = await fetch('/api/projects.php');
                if (!res.ok) return;
                const data = await res.json();
                if (data.success && Array.isArray(data.projects)) {
                    const items = [];
                    data.projects.forEach((proj) => {
                        const cover = proj.cover_image || (proj.images && proj.images[0]);
                        if (cover) {
                            items.push({
                                id: proj.id,
                                src: cover,
                                title: proj.title,
                                location: proj.location
                            });
                        }
                    });
                    if (isMounted) {
                        setShowcaseImages(items.slice(0, 4));
                    }
                }
            } catch {
                if (isMounted) setShowcaseImages([]);
            } finally {
                if (isMounted) setHasLoaded(true);
            }
        };

        fetchShowcase();
        return () => { isMounted = false; };
    }, []);

    // Staggered scroll animation
    const fadeInScale = {
        hidden: { opacity: 0, y: 25, scale: 0.98 },
        visible: (customDelay) => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.5, delay: customDelay, ease: [0.16, 1, 0.3, 1] }
        })
    };

    // If projects have loaded from database and none exist, hide the section until admin adds them
    if (hasLoaded && showcaseImages.length === 0) {
        return null;
    }

    return (
        <section className="w-full px-6 sm:px-8 md:px-16 lg:px-20 py-12 sm:py-16 bg-white font-sans">
            <div className="max-w-7xl xl:max-w-[1380px] mx-auto w-full">
                {/* Header Row with View All Button */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-6 h-[2px] bg-[#1A4D2E]" />
                            <span className="text-[11px] text-[#1A4D2E] font-bold tracking-[0.2em] uppercase font-mono">
                                OUR PORTFOLIO
                            </span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold font-playfair tracking-tight text-neutral-900 leading-tight">
                            Featured Operations & Highlights
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <p className="text-xs sm:text-sm text-neutral-500 font-medium max-w-sm leading-relaxed hidden lg:block">
                            Explore state-of-the-art solar arrays & security installations across Kerala.
                        </p>

                        <button
                            onClick={() => navigate('/projects')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A4D2E] hover:bg-[#143e24] text-white rounded-full text-xs font-bold tracking-wider transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer uppercase shrink-0 group"
                        >
                            View All Projects
                            <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                        </button>
                    </div>
                </div>

                {/* 4-Card Compact Grid - Pure Image Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {showcaseImages.map((project, index) => (
                        <motion.div
                            key={project.id}
                            custom={index * 0.1}
                            variants={fadeInScale}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.1 }}
                            onClick={() => navigate('/projects')}
                            className="group relative h-[320px] rounded-3xl overflow-hidden border border-neutral-100/80 shadow-2xs hover:shadow-xl transition-all duration-500 cursor-pointer"
                        >
                            {/* Background Image */}
                            <img
                                src={project.src}
                                alt="Solar Edge Project Showcase"
                                className="w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-108"
                            />

                            {/* Subtle Hover Overlay */}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-5">
                                <div className="w-11 h-11 rounded-full bg-white/30 backdrop-blur-md text-white flex items-center justify-center transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-md">
                                    <Eye className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProjectShowcase;
