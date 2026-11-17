import React, { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import { Footer } from './components/Footer';

// Code-split all secondary routes and admin bundle to keep initial landing page ultra-light
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Services = lazy(() => import('./pages/Services'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'));
const PrivacyPolicy = lazy(() => import('./pages/LegalPrivacy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Contact = lazy(() => import('./pages/Contact'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AdminResetPasswordPage = lazy(() => import('./pages/AdminResetPasswordPage').then(m => ({ default: m.AdminResetPasswordPage })));
import Lenis from 'lenis';

const ScrollToTop = () => {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) {
            setTimeout(() => {
                const element = document.getElementById(hash.substring(1));
                if (element) {
                    if (window.lenis) {
                        window.lenis.scrollTo(element, { duration: 1.2, offset: -90 });
                    } else {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }, 150);
        } else {
            if (window.lenis) {
                window.lenis.scrollTo(0, { immediate: true });
            } else {
                window.scrollTo(0, 0);
            }
        }
    }, [pathname, hash]);

    return null;
};

const AppContent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isAdminRoute = location.pathname.startsWith('/admin');
    const prevPathRef = useRef(location.pathname);

    useEffect(() => {
        const isAuth = sessionStorage.getItem('solar_admin_auth') === 'true';

        // If user was on /admin/*, is authenticated, and browser back tried to move away from /admin/*
        if (prevPathRef.current.startsWith('/admin') && !location.pathname.startsWith('/admin') && isAuth) {
            navigate(prevPathRef.current, { replace: true });
            toast('Please use the Logout button to exit the admin panel.', {
                icon: '🔒',
                id: 'admin-back-lock',
                duration: 3000
            });
            return;
        }

        prevPathRef.current = location.pathname;
    }, [location.pathname, navigate]);

    useEffect(() => {
        let rafId = null;

        if (isAdminRoute) {
            // Completely destroy and detach Lenis on Admin routes to ensure 100% native browser scrolling
            if (window.lenis) {
                try {
                    window.lenis.destroy();
                } catch { }
                window.lenis = null;
            }
            document.documentElement.style.overflow = 'auto';
            document.body.style.overflow = 'auto';
        } else {
            // Initialize Lenis smooth scroll for public website pages
            if (!window.lenis) {
                const lenis = new Lenis({
                    duration: 1.2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                    smoothWheel: true,
                    smoothTouch: false,
                });
                window.lenis = lenis;

                function raf(time) {
                    lenis.raf(time);
                    rafId = requestAnimationFrame(raf);
                }
                rafId = requestAnimationFrame(raf);
            }
        }

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [isAdminRoute]);

    return (
        <>
            <ScrollToTop />
            {!isAdminRoute && <Navbar />}
            <Suspense fallback={
                <div className="min-h-[60vh] w-full flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-[#1A4D2E] border-t-transparent rounded-full animate-spin" />
                </div>
            }>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/projects/:id" element={<ProjectDetails />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/admin/reset-password" element={<AdminResetPasswordPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/admin/:tab" element={<AdminPage />} />
                </Routes>
            </Suspense>
            {!isAdminRoute && <Footer />}
        </>
    );
};

const App = () => {
    return <AppContent />;
};

export default App;
