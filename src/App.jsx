import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import Services from './pages/Services';
import Projects from './pages/Projects';
import Navbar from './components/Navbar';
import { Footer } from './components/Footer';
import RotatingRings from './utils/RotatingRings';
import ProjectDetails from './pages/ProjectDetails';
import Lenis from 'lenis';
import PrivacyPolicy from './pages/LegalPrivacy';
import TermsOfService from './pages/TermsOfService';
import AdminPage from './pages/AdminPage';
import Contact from './pages/Contact';

const ScrollToTop = () => {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) {
            setTimeout(() => {
                const element = document.getElementById(hash.substring(1));
                if (element) {
                    if (window.lenis) {
                        window.lenis.scrollTo(element, { duration: 1.2 });
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
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/services" element={<Services />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetails />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/:tab" element={<AdminPage />} />
            </Routes>
            {!isAdminRoute && <Footer />}
        </>
    );
};

const App = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            {
                isLoading ? (
                    <div className="min-h-screen w-full flex items-center justify-center bg-white">
                        <RotatingRings size="xl" message="Loading..." />
                    </div>
                ) : (
                    <AppContent />
                )
            }
        </>
    );

};

export default App;
