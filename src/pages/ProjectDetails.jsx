import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const ProjectDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();
    
    // State for lightbox/carousel
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);

    // Get project data from navigation state or fetch based on id
    const project = location.state?.project;

    // If no project data, redirect back (in real app, fetch from API/database)
    if (!project) {
        navigate('/projects');
        return null;
    }

    // Lightbox functions
    const openLightbox = (index) => {
        setSelectedImageIndex(index);
    };

    const closeLightbox = () => {
        setSelectedImageIndex(null);
    };

    const navigateImage = (direction) => {
        if (selectedImageIndex === null) return;
        
        if (direction === 'next') {
            setSelectedImageIndex((selectedImageIndex + 1) % project.images.length);
        } else {
            setSelectedImageIndex((selectedImageIndex - 1 + project.images.length) % project.images.length);
        }
    };

    // Keyboard navigation
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (selectedImageIndex === null) return;
            
            if (e.key === 'ArrowRight') navigateImage('next');
            if (e.key === 'ArrowLeft') navigateImage('prev');
            if (e.key === 'Escape') closeLightbox();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImageIndex]);

    return (
        <>
            {/* SEO Meta Tags */}
            <Helmet>
                <title>{project.title} | Solar Edge Innovation</title>
                <meta name="description" content={project.description} />
                <meta name="keywords" content={`${project.title}, Solar Edge Innovation`} />
                <link rel="canonical" href={`https://www.solaredgeinnovation.in/projects/${id}`} />

                <meta property="og:title" content={`${project.title} | Solar Edge Innovation`} />
                <meta property="og:description" content={project.description} />
                <meta property="og:image" content={project.mainImage} />
                <meta property="og:url" content={`https://www.solaredgeinnovation.in/projects/${id}`} />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-6">
                <div className="max-w-7xl mt-30 mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/projects')}
                        className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors mb-8 font-medium cursor-pointer"
                    >
                        <FiArrowLeft size={20} />
                        Back to Projects
                    </button>

                    {/* Project Header */}
                    <div className="bg-white rounded-2xl shadow-xl py-8 px-4 sm:px-8 md:px-16 lg:px-20 mb-8">
                        {project.location && (
                            <div className="flex flex-wrap gap-3 mb-4">
                                <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2">
                                    📍 {project.location}
                                </span>
                            </div>
                        )}

                        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                            {project.title}
                        </h1>

                        <p className="text-gray-600 text-lg leading-relaxed">
                            {project.description}
                        </p>
                    </div>

                    {/* Main Image */}
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        {/* Left Side - Main Image */}
                        <div>
                            <img
                                src={project.mainImage}
                                alt={project.title}
                                className="w-full h-full min-h-[280px] object-cover rounded-2xl shadow-xl"
                            />
                        </div>

                        {/* Right Side - Project Details */}
                        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col justify-center">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Project Details</h2>

                            <div className="space-y-6">
                                {project.location && (
                                    <div className="border-l-4 border-green-600 pl-4">
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Location</h3>
                                        <p className="text-xl text-gray-800 font-medium">{project.location}</p>
                                    </div>
                                )}

                                <div className="border-l-4 border-purple-600 pl-4">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Total Images</h3>
                                    <p className="text-xl text-gray-800 font-medium">{project.images ? project.images.length : 1} Images</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* All Related Images Grid */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Project Gallery</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {project.images.map((image, index) => (
                                <div
                                    key={index}
                                    onClick={() => openLightbox(index)}
                                    className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                                >
                                    <img
                                        src={image}
                                        alt={`${project.title} - Image ${index + 1}`}
                                        className="w-full h-64 object-cover transform transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute bottom-4 left-4 text-white">
                                            <p className="text-sm font-semibold">Image {index + 1}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Additional Info Section */}
                    <div className="mt-8 bg-gradient-to-r from-green-dark to-green-medium rounded-2xl shadow-xl p-8 text-white">
                        <h2 className="text-3xl font-bold mb-4">Interested in a similar project?</h2>
                        <p className="text-lg mb-6 opacity-90">
                            Contact us today to discuss your requirements and get a customized solution for your needs.
                        </p>
                        <a
                            href={`mailto:solaredgeinnovations25@gmail.com?subject=Project Inquiry&body=Hi there,%0D%0A%0D%0AI came across your project portfolio and I'm interested in a similar project for my requirements.%0D%0A%0D%0ACould you please provide more details, pricing, and the next steps?%0D%0A%0D%0ALooking forward to hearing from you!%0D%0A%0D%0AThank you.`}
                            className="bg-white text-green-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 duration-200 transition-colors inline-block"
                        >
                            Get a Quote
                        </a>
                    </div>
                </div>
            </div>

            {/* Lightbox/Carousel Modal */}
            {selectedImageIndex !== null && (
                <div 
                    className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center"
                    onClick={closeLightbox}
                >
                    {/* Close Button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors z-20"
                    >
                        <FiX size={40} />
                    </button>

                    {/* Previous Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigateImage('prev');
                        }}
                        className="absolute left-6 text-white hover:text-gray-300 transition-colors z-20"
                    >
                        <FiChevronLeft size={48} />
                    </button>

                    {/* Image Container */}
                    <div 
                        className="max-w-5xl max-h-[90vh] flex flex-col items-center px-20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={project.images[selectedImageIndex]}
                            alt={`${project.title} - Image ${selectedImageIndex + 1}`}
                            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                        />
                        <div className="text-center mt-6 text-white">
                            <h2 className="text-3xl font-bold mb-2">{project.title}</h2>
                            <p className="text-gray-400 text-lg">
                                Image {selectedImageIndex + 1} of {project.images.length}
                            </p>
                        </div>
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigateImage('next');
                        }}
                        className="absolute right-6 text-white hover:text-gray-300 transition-colors z-20"
                    >
                        <FiChevronRight size={48} />
                    </button>
                </div>
            )}
        </>
    );
};

export default ProjectDetails;