import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, ChevronLeft, ChevronRight, Eye, Sparkles, 
    LayoutGrid, SlidersHorizontal, MapPin, ArrowRight 
} from 'lucide-react';

const Projects = () => {
    // Dynamic gallery items fetched exclusively from Admin / Database API (no hardcoded dummy images)
    const [galleryItems, setGalleryItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');

    // View mode: 'grid' (horizontal landscape cards in 3 columns) | 'reel' (horizontal snap scroll reel)
    const [viewMode, setViewMode] = useState('grid');
    const reelRef = useRef(null);

    // Show 9 images initially in grid mode
    const [visibleCount, setVisibleCount] = useState(9);
    // Selected image index for full-screen preview lightbox modal (null when closed)
    const [previewIndex, setPreviewIndex] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchGallery = async () => {
            try {
                const res = await fetch('/api/projects.php');
                if (!res.ok) throw new Error(`HTTP error ${res.status}`);
                const data = await res.json();

                if (data.success && Array.isArray(data.projects)) {
                    const items = [];
                    data.projects.forEach((proj) => {
                        const images = (proj.images && proj.images.length > 0)
                            ? proj.images
                            : (proj.cover_image ? [proj.cover_image] : []);

                        images.forEach((imgSrc, idx) => {
                            items.push({
                                id: `${proj.id}-${idx}`,
                                projectId: proj.id,
                                src: imgSrc,
                                title: proj.title,
                                location: proj.location,
                                category: (proj.category || 'solar').toLowerCase(),
                                description: proj.description
                            });
                        });
                    });

                    if (isMounted) {
                        setGalleryItems(items);
                    }
                }
            } catch (err) {
                console.warn('Could not load gallery projects:', err.message);
                if (isMounted) setGalleryItems([]);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchGallery();
        return () => { isMounted = false; };
    }, []);

    const filteredItems = galleryItems.filter(item => {
        if (selectedCategory === 'all') return true;
        return (item.category || 'solar') === selectedCategory;
    });

    const visibleImages = filteredItems.slice(0, visibleCount);
    const hasMore = visibleCount < filteredItems.length;

    const handleLoadMore = () => {
        setVisibleCount((prev) => Math.min(prev + 6, filteredItems.length));
    };

    const openPreview = (index) => {
        setPreviewIndex(index);
    };

    const closePreview = () => {
        setPreviewIndex(null);
    };

    const prevPreview = (e) => {
        e.stopPropagation();
        setPreviewIndex((prev) => (prev === 0 ? galleryItems.length - 1 : prev - 1));
    };

    const nextPreview = (e) => {
        e.stopPropagation();
        setPreviewIndex((prev) => (prev === galleryItems.length - 1 ? 0 : prev + 1));
    };

    const scrollReel = (direction) => {
        if (reelRef.current) {
            const amount = direction === 'left' ? -reelRef.current.offsetWidth * 0.75 : reelRef.current.offsetWidth * 0.75;
            reelRef.current.scrollBy({ left: amount, behavior: 'smooth' });
        }
    };

    return (
        <>
            {/* SEO Meta Tags for Projects Page */}
            <Helmet>
                <title>Project Gallery | Solar Edge Innovation - Installed Solar & Security Systems</title>
                <meta
                    name="description"
                    content="Explore the official project gallery of Solar Edge Innovation featuring real solar panel rooftop installations, inverters, and CCTV systems across Kerala."
                />
                <meta
                    name="keywords"
                    content="solar projects, solar gallery, solar panel installation photo, Solar Edge Innovation portfolio, Kerala solar projects"
                />
                <link rel="canonical" href="https://www.solaredgeinnovation.in/projects" />
            </Helmet>

            <div className="min-h-screen bg-[#FAFCFA] pt-32 sm:pt-40 pb-24 px-6 sm:px-10 lg:px-16 font-sans">
                <div className="max-w-7xl xl:max-w-[1380px] mx-auto">

                    {/* Header with proper spacing below navbar */}
                    <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
                        <div className="inline-flex items-center gap-2 bg-[#E5F3E7] text-[#1A4D2E] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4 shadow-2xs">
                            <Sparkles className="w-3.5 h-3.5 fill-[#1A4D2E]" />
                            <span>OUR WORK GALLERY</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold font-playfair text-neutral-900 leading-tight mb-4 tracking-tight">
                            Project Showcase
                        </h1>
                        <p className="text-neutral-600 text-sm sm:text-base font-medium leading-relaxed max-w-xl mx-auto">
                            A clean visual showcase of our real solar rooftop installations and security systems. Click any image to preview.
                        </p>
                    </div>

                    {/* Category Filter Pills: All | Solar | Battery | CCTV */}
                    {galleryItems.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
                            {[
                                { id: 'all', label: 'All Projects', count: galleryItems.length },
                                { id: 'solar', label: '☀️ Solar', count: galleryItems.filter(i => (i.category || 'solar') === 'solar').length },
                                { id: 'battery', label: '🔋 Battery', count: galleryItems.filter(i => (i.category || '') === 'battery').length },
                                { id: 'cctv', label: '📹 CCTV', count: galleryItems.filter(i => (i.category || '') === 'cctv').length }
                            ].map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                                        selectedCategory === cat.id
                                            ? 'bg-[#1A4D2E] text-white shadow-md scale-105'
                                            : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200/80 hover:bg-neutral-50 shadow-2xs'
                                    }`}
                                >
                                    {cat.label} <span className="opacity-75 font-normal">({cat.count})</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* View Controls & Counter Bar (Visible when projects exist) */}
                    {galleryItems.length > 0 && (
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-200/80">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                                    Showing {viewMode === 'grid' ? visibleImages.length : filteredItems.length} Installations
                                </span>
                            </div>

                            {/* Layout Mode Selector (Horizontal Grid vs Horizontal Slider) */}
                            <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-2xl border border-neutral-200/80">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        viewMode === 'grid'
                                            ? 'bg-[#1A4D2E] text-white shadow-xs'
                                            : 'text-neutral-600 hover:text-neutral-900'
                                    }`}
                                >
                                    <LayoutGrid size={13} />
                                    <span>Horizontal Grid</span>
                                </button>

                                <button
                                    onClick={() => setViewMode('reel')}
                                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        viewMode === 'reel'
                                            ? 'bg-[#1A4D2E] text-white shadow-xs'
                                            : 'text-neutral-600 hover:text-neutral-900'
                                    }`}
                                >
                                    <SlidersHorizontal size={13} />
                                    <span>Horizontal Slider</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="py-24 text-center">
                            <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-sm font-medium text-neutral-500">Loading project gallery...</p>
                        </div>
                    )}

                    {/* Default Professional Empty State */}
                    {!isLoading && galleryItems.length === 0 && (
                        <div className="text-center py-20 px-6 sm:px-12 bg-white border border-neutral-200/80 rounded-3xl max-w-xl mx-auto shadow-sm">
                            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-emerald-50 text-[#1A4D2E] flex items-center justify-center border border-emerald-100/60">
                                <LayoutGrid size={26} />
                            </div>
                            <h3 className="font-playfair text-2xl sm:text-3xl font-bold text-neutral-900 mb-3 tracking-tight">
                                Portfolio Updates in Progress
                            </h3>
                            <p className="text-sm sm:text-base text-neutral-600 font-light leading-relaxed max-w-md mx-auto mb-6">
                                We are currently curating and documenting our latest residential, commercial, and industrial solar installations across Kerala. In the meantime, please feel free to connect with our team for detailed project references or customized consultations.
                            </p>
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2 px-7 py-3 bg-[#1A4D2E] hover:bg-[#143e24] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                            >
                                Contact Our Team
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    )}

                    {/* VIEW MODE 1: Horizontal Landscape Grid (3 Columns, 16:10 Widescreen) */}
                    {!isLoading && galleryItems.length > 0 && viewMode === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                            {visibleImages.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: (index % 6) * 0.08 }}
                                    whileHover={{ y: -6 }}
                                    onClick={() => openPreview(index)}
                                    className="group relative aspect-[16/10] w-full rounded-3xl overflow-hidden shadow-xs hover:shadow-2xl border border-neutral-200/80 bg-neutral-950 cursor-pointer transition-all duration-300"
                                >
                                    {/* Main Widescreen Image */}
                                    <img
                                        src={item.src}
                                        alt={item.title || "Solar Edge Innovation Project Preview"}
                                        className="w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-106"
                                    />

                                    {/* Subtle Gradient & Hover Info Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5">
                                        {/* Top Badges */}
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold text-white bg-black/40 backdrop-blur-md border border-white/20">
                                                {item.category === 'battery' ? '🔋 Battery' : item.category === 'cctv' ? '📹 CCTV' : '☀️ Solar'}
                                            </span>

                                            {item.location ? (
                                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white/90 bg-white/20 backdrop-blur-md border border-white/20 flex items-center gap-1">
                                                    <MapPin size={11} /> {item.location}
                                                </span>
                                            ) : <div />}
                                        </div>

                                        {/* Bottom Title & Center Hover Eye */}
                                        <div className="flex items-end justify-between gap-3">
                                            {item.title && (
                                                <h3 className="text-white text-base font-bold leading-snug line-clamp-1 drop-shadow-sm">
                                                    {item.title}
                                                </h3>
                                            )}

                                            <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md text-white flex items-center justify-center shrink-0 transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-md">
                                                <Eye className="w-4.5 h-4.5 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* VIEW MODE 2: Horizontal Reel / Carousel Slider */}
                    {!isLoading && galleryItems.length > 0 && viewMode === 'reel' && (
                        <div className="relative">
                            {/* Left Scroll Arrow */}
                            <button
                                onClick={() => scrollReel('left')}
                                className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-xl hover:shadow-2xl border border-neutral-200 text-[#1A4D2E] flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                                aria-label="Scroll left"
                            >
                                <ChevronLeft size={22} />
                            </button>

                            {/* Right Scroll Arrow */}
                            <button
                                onClick={() => scrollReel('right')}
                                className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-xl hover:shadow-2xl border border-neutral-200 text-[#1A4D2E] flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                                aria-label="Scroll right"
                            >
                                <ChevronRight size={22} />
                            </button>

                            {/* Scrollable Container with horizontal snap */}
                            <div 
                                ref={reelRef}
                                className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scroll-smooth scrollbar-none"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {filteredItems.map((item, index) => (
                                    <div
                                        key={item.id}
                                        onClick={() => openPreview(index)}
                                        className="group relative shrink-0 w-[300px] sm:w-[420px] md:w-[480px] aspect-[16/10] rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border border-neutral-200/80 bg-neutral-950 cursor-pointer transition-all duration-300 snap-center"
                                    >
                                        <img
                                            src={item.src}
                                            alt={item.title || "Solar Edge Innovation Project"}
                                            className="w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-106"
                                        />

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold text-white bg-black/40 backdrop-blur-md border border-white/20">
                                                    {item.category === 'battery' ? '🔋 Battery' : item.category === 'cctv' ? '📹 CCTV' : '☀️ Solar'}
                                                </span>

                                                {item.location ? (
                                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold text-white/90 bg-white/20 backdrop-blur-md border border-white/20 flex items-center gap-1">
                                                        <MapPin size={11} /> {item.location}
                                                    </span>
                                                ) : <div />}
                                            </div>

                                            <div className="flex items-end justify-between gap-3">
                                                {item.title && (
                                                    <h3 className="text-white text-base font-bold leading-snug line-clamp-1 drop-shadow-sm">
                                                        {item.title}
                                                    </h3>
                                                )}

                                                <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md text-white flex items-center justify-center shrink-0 transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-md">
                                                    <Eye className="w-4.5 h-4.5 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Load More Button in Grid View */}
                    {!isLoading && viewMode === 'grid' && hasMore && (
                        <div className="flex justify-center mt-12 sm:mt-16">
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={handleLoadMore}
                                className="px-8 py-3.5 bg-[#1A4D2E] hover:bg-[#143e24] text-white rounded-full text-xs font-bold tracking-widest uppercase shadow-md hover:shadow-xl transition-all cursor-pointer"
                            >
                                Load More Projects ({galleryItems.length - visibleCount} Remaining)
                            </motion.button>
                        </div>
                    )}

                </div>
            </div>

            {/* Lightbox / Preview Modal (When image card is clicked) */}
            <AnimatePresence>
                {previewIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-8"
                        onClick={closePreview}
                    >
                        {/* Modal Box */}
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.92, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={closePreview}
                                className="absolute -top-12 right-0 sm:top-4 sm:right-4 z-50 w-11 h-11 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20 backdrop-blur-md"
                                aria-label="Close preview"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>

                            {/* Left Navigation Arrow */}
                            <button
                                onClick={prevPreview}
                                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 backdrop-blur-md"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </button>

                            {/* Right Navigation Arrow */}
                            <button
                                onClick={nextPreview}
                                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 backdrop-blur-md"
                                aria-label="Next image"
                            >
                                <ChevronRight className="w-6 h-6 text-white" />
                            </button>

                            {/* Main Preview Image */}
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 max-h-[82vh] flex items-center justify-center bg-black/40">
                                <img
                                    src={galleryItems[previewIndex]?.src}
                                    alt={galleryItems[previewIndex]?.title || "Solar Edge Project Preview"}
                                    className="max-h-[82vh] w-auto max-w-full object-contain block select-none"
                                />
                            </div>

                            {/* Image Caption & Counter Bar */}
                            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between w-full text-white/90 gap-2 px-2">
                                <div className="text-sm font-semibold text-white/90 text-center sm:text-left">
                                    {galleryItems[previewIndex]?.title}
                                    {galleryItems[previewIndex]?.location && (
                                        <span className="text-xs text-white/60 ml-2 font-normal">
                                            📍 {galleryItems[previewIndex].location}
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs font-mono text-white/70 font-bold bg-white/10 px-4 py-1.5 rounded-full border border-white/15 shrink-0">
                                    {previewIndex + 1} / {galleryItems.length}
                                </span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Projects;