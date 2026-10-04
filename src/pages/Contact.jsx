import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    Send,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    ShieldCheck,
    ChevronDown,
    Building2,
    Calendar,
    ArrowRight,
    ExternalLink,
    HelpCircle,
    SunMedium,
    BatteryCharging,
    Cctv,
    Wrench,
    Check,
    X
} from 'lucide-react';
import { PiWhatsappLogoThin } from 'react-icons/pi';
import { assets } from '../assets/assets';

const serviceOptions = [
    { id: 'solar', label: 'Rooftop Solar (On-Grid / Hybrid)', icon: SunMedium },
    { id: 'inverter', label: 'Hybrid Inverters & Battery Storage', icon: BatteryCharging },
    { id: 'cctv', label: 'AI CCTV & Security Surveillance', icon: Cctv },
    { id: 'maintenance', label: 'System Maintenance & AMC', icon: Wrench },
    { id: 'general', label: 'General Consultation / Other', icon: HelpCircle },
];

const coverageAreas = [
    'Varkala',
    'Trivandrum',
    'Kollam',
    'Parippally',
    'Elakamon',
    'Ayiroor',
    'Paravoor',
    'Attingal',
    'Kallambalam',
    'Pathanamthitta',
];

const keralaDistricts = [
    'Thiruvananthapuram',
    'Kollam',
    'Pathanamthitta',
    'Alappuzha',
    'Kottayam',
    'Idukki',
    'Ernakulam',
    'Thrissur',
    'Palakkad',
    'Malappuram',
    'Kozhikode',
    'Wayanad',
    'Kannur',
    'Kasaragod',
];

const defaultFaqs = [
    {
        q: 'Do you offer free on-site solar inspections and feasibility surveys?',
        a: 'Yes! Our certified solar engineering specialists provide complimentary site surveys across Trivandrum, Kollam, and nearby regions across Kerala. We inspect your rooftop orientation, shading analysis, electrical load, and structure to calculate optimal solar yield and customized savings.',
        category: 'Residential Solar',
    },
    {
        q: 'Can you help us apply for PM Surya Ghar Muft Bijli Yojana subsidies?',
        a: 'Absolutely. We handle end-to-end documentation, KSEB net-metering approvals, and national subsidy portal filings for the PM Surya Ghar Muft Bijli Yojana. Eligible residential rooftop customers can claim direct central government subsidies of up to ₹78,000.',
        category: 'Residential Solar',
    },
    {
        q: 'How quickly does your team respond to consultation requests?',
        a: 'Our technical customer support team typically reviews all submitted inquiries and responds within 2 to 4 business hours. For urgent inquiries or immediate site visit bookings, you can also reach us directly via WhatsApp or phone at +91 95268 01406.',
        category: 'General',
    },
    {
        q: 'What warranties and service assurances are provided with installations?',
        a: 'We provide tier-1 MNRE/ALMM approved solar modules with up to 25 to 27 years linear power performance warranty, 5 to 10 years inverter manufacturer warranty, and comprehensive post-installation maintenance and system monitoring support.',
        category: 'General',
    },
    {
        q: 'Do you provide hybrid backup systems for locations with frequent power cuts?',
        a: 'Yes, our hybrid solar and inverter systems automatically switch between solar energy, battery backup, and the grid within milliseconds during blackouts, ensuring complete uninterrupted power for your lighting, fans, air conditioning, and IT equipment.',
        category: 'Inverters & Batteries',
    },
    {
        q: 'How much rooftop area is required for a 3kW or 5kW solar plant?',
        a: 'Typically, a 1kW solar installation requires approximately 80 to 100 square feet of shadow-free rooftop space. Therefore, a standard 3kW residential system requires around 250 to 300 sq.ft., and a 5kW system requires approximately 450 to 500 sq.ft.',
        category: 'Residential Solar',
    },
    {
        q: 'How does KSEB net metering work with on-grid solar systems?',
        a: 'With on-grid solar and a bi-directional KSEB net meter, excess solar power generated during peak daylight hours is exported back to the KSEB power grid. At night or during cloudy periods, you import energy as needed. You are only billed for the net units consumed, dramatically reducing or eliminating your bi-monthly electricity bill.',
        category: 'Solar',
    },
    {
        q: 'Do you also provide CCTV security and electrical inverter backup solutions?',
        a: 'Yes, Solar Edge Innovation offers integrated smart living services including high-definition IP & HD CCTV surveillance systems, tubular battery backup solutions, solar water heaters, and energy-efficient lightning surge protection systems.',
        category: 'CCTV',
    },
];

const Contact = () => {
    // Dynamic FAQs with default fallback for immediate, reliable UI display
    const [faqList, setFaqList] = useState(defaultFaqs);
    const [selectedFaqCategory, setSelectedFaqCategory] = useState('All');

    useEffect(() => {
        let isMounted = true;
        const fetchFaqs = async () => {
            try {
                const res = await fetch('/api/faqs.php');
                if (!res.ok) return;
                const data = await res.json();
                if (data.success && Array.isArray(data.faqs) && data.faqs.length > 0) {
                    const formatted = data.faqs.map((f) => ({
                        q: f.question,
                        a: f.answer,
                        category: f.category || 'General',
                    }));
                    if (isMounted) {
                        setFaqList(formatted);
                    }
                }
            } catch {
                // Keep default fallback on network error or offline mode
            }
        };

        fetchFaqs();
        return () => { isMounted = false; };
    }, []);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        service: 'solar',
        place: '',
        district: 'Thiruvananthapuram',
        message: '',
    });

    const [status, setStatus] = useState({
        loading: false,
        success: false,
        error: null,
        responseMsg: '',
    });

    // Success Popup Modal state
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [submittedWhatsAppUrl, setSubmittedWhatsAppUrl] = useState('');

    // Prevent body scrolling & enable ESC to close when modal is open
    useEffect(() => {
        if (showSuccessModal) {
            document.body.style.overflow = 'hidden';
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    setShowSuccessModal(false);
                }
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                document.body.style.overflow = 'unset';
                window.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [showSuccessModal]);

    // FAQ Accordion active index and category filter
    const [activeFaq, setActiveFaq] = useState(0);

    const faqCategories = useMemo(() => {
        const cats = new Set();
        faqList.forEach((f) => {
            if (f.category) cats.add(f.category);
        });
        return ['All', ...Array.from(cats)];
    }, [faqList]);

    const displayedFaqs = useMemo(() => {
        if (selectedFaqCategory === 'All') return faqList;
        return faqList.filter((f) => f.category === selectedFaqCategory);
    }, [faqList, selectedFaqCategory]);

    const handleCategorySelect = (category) => {
        setSelectedFaqCategory(category);
        setActiveFaq(0);
    };

    // Business Hours open/closed indicator
    const isCurrentlyOpen = useMemo(() => {
        try {
            // Get current IST time (UTC+5:30)
            const now = new Date();
            const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
            const istTime = new Date(utcTime + 3600000 * 5.5);
            const day = istTime.getDay(); // 0 is Sunday, 1-6 Mon-Sat
            const hours = istTime.getHours();
            const minutes = istTime.getMinutes();
            const totalMinutes = hours * 60 + minutes;

            // Monday-Saturday: 9:00 AM (540 mins) to 8:00 PM (1200 mins)
            if (day >= 1 && day <= 6) {
                return totalMinutes >= 540 && totalMinutes < 1200;
            }
            return false;
        } catch {
            return true;
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleServiceSelect = (serviceId) => {
        setFormData((prev) => ({ ...prev, service: serviceId }));
    };

    // Office WhatsApp Number (configured as requested)
    const OFFICE_WHATSAPP_NUMBER = '91XXXXXXXXXX';

    /**
     * Generate pre-filled WhatsApp message link with all submitted form details.
     * Properly URL-encodes special characters and multi-line requirements.
     */
    const generateWhatsAppUrl = (data, serviceLabel) => {
        const lines = [
            '*New Contact Inquiry - Solar Edge Innovations*',
            '',
            `*Selected Service:* ${serviceLabel}`,
            `*Full Name:* ${data.name.trim()}`,
            `*Email:* ${data.email.trim()}`,
            `*Phone / WhatsApp:* ${data.phone.trim()}`,
            `*Place / Town:* ${data.place.trim()}`,
            `*District:* ${data.district.trim()}`,
            '',
            `*Requirements:*`,
            data.message.trim()
        ];
        const messageText = lines.join('\n');
        return `https://wa.me/${OFFICE_WHATSAPP_NUMBER}?text=${encodeURIComponent(messageText)}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Validation (matches existing requirements)
        if (
            !formData.name.trim() ||
            !formData.email.trim() ||
            !formData.phone.trim() ||
            !formData.place.trim() ||
            !formData.district.trim() ||
            !formData.message.trim()
        ) {
            setStatus({
                loading: false,
                success: false,
                error: 'Please fill in all required fields.',
                responseMsg: '',
            });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
            setStatus({
                loading: false,
                success: false,
                error: 'Please enter a valid email address.',
                responseMsg: '',
            });
            return;
        }

        setStatus({ loading: true, error: null, success: false, responseMsg: '' });

        const serviceName = serviceOptions.find((s) => s.id === formData.service)?.label || formData.service;

        // 2. Prepare WhatsApp URL with complete inquiry details
        const whatsappUrl = generateWhatsAppUrl(formData, serviceName);
        setSubmittedWhatsAppUrl(whatsappUrl);

        // Pre-open a reference window during the user gesture to avoid popup blocker restrictions
        let whatsappTab = null;
        try {
            whatsappTab = window.open('about:blank', '_blank');
        } catch {
            whatsappTab = null;
        }

        try {
            const response = await fetch('/api/contact.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim(),
                    service: serviceName,
                    place: formData.place.trim(),
                    district: formData.district.trim(),
                    message: formData.message.trim(),
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setStatus({
                    loading: false,
                    success: true,
                    error: null,
                    responseMsg: data.message || 'Your inquiry has been stored. Opening WhatsApp chat with your details...',
                });
                setShowSuccessModal(true);
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    service: 'solar',
                    place: '',
                    district: 'Thiruvananthapuram',
                    message: '',
                });
            } else {
                setStatus({
                    loading: false,
                    success: true,
                    error: null,
                    responseMsg: 'Your inquiry has been prepared. Opening WhatsApp chat to send message...',
                });
                setShowSuccessModal(true);
            }
        } catch (err) {
            console.error('Contact Form error:', err);
            // Fallback for offline/local environments: inquiry still proceeds through WhatsApp
            setStatus({
                loading: false,
                success: true,
                error: null,
                responseMsg: 'Your message has been prepared. Opening WhatsApp chat to complete submission...',
            });
            setShowSuccessModal(true);
        } finally {
            // Navigate the pre-opened tab to the WhatsApp URL, or open window if not pre-opened
            if (whatsappTab && !whatsappTab.closed) {
                whatsappTab.location.href = whatsappUrl;
            } else {
                window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            }
        }
    };

    const toggleFaq = (index) => {
        setActiveFaq((prev) => (prev === index ? null : index));
    };

    const whatsappDirectLink = `https://wa.me/${OFFICE_WHATSAPP_NUMBER}?text=${encodeURIComponent(
        'Hello Solar Edge Innovation team! I would like to inquire about solar panel installation and consultation.'
    )}`;

    return (
        <>
            {/* =========================================================
                SEO HELMET & STRUCTURED DATA
            ========================================================= */}
            <Helmet>
                <title>Contact Us | Solar Edge Innovation - Free Solar & Security Consultation</title>
                <meta
                    name="description"
                    content="Contact Solar Edge Innovation in Varkala, Kerala for free solar rooftop site surveys, hybrid inverters, battery storage, and CCTV installation inquiries."
                />
                <meta
                    name="keywords"
                    content="contact solar edge innovation, solar company varkala contact, solar installer trivandrum phone, solar panel quote kerala, cctv installation varkala contact, solar subsidy inquiry"
                />
                <link rel="canonical" href="https://www.solaredgeinnovation.in/contact" />

                {/* Social Open Graph */}
                <meta property="og:title" content="Contact Us | Solar Edge Innovation" />
                <meta
                    property="og:description"
                    content="Speak with our solar engineers and security specialists. Book your free rooftop assessment across Kerala."
                />
                <meta property="og:url" content="https://www.solaredgeinnovation.in/contact" />
                <meta property="og:type" content="website" />

                {/* Structured JSON-LD */}
                <script type="application/ld+json">
                    {`
{
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact Solar Edge Innovation",
  "url": "https://www.solaredgeinnovation.in/contact",
  "description": "Get in touch with Solar Edge Innovation for rooftop solar panels, hybrid storage, and CCTV security systems in Kerala.",
  "mainEntity": {
    "@type": "LocalBusiness",
    "name": "Solar Edge Innovation",
    "telephone": "+919526801406",
    "email": "solaredgeinnovations25@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Elakamon, Ayiroor, Varkala Paravoor Road",
      "addressLocality": "Varkala",
      "addressRegion": "Kerala",
      "postalCode": "695310",
      "addressCountry": "IN"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "09:00",
        "closes": "20:00"
      }
    ],
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 8.7468,
      "longitude": 76.7163
    }
  }
}
`}
                </script>
            </Helmet>

            <div className="min-h-screen bg-[#FAFCFA] font-sans selection:bg-[#E5F5E8] selection:text-[#1A4D2E]">
                {/* =========================================================
                    HERO HEADER SECTION
                ========================================================= */}
                <header className="relative w-full pt-28 sm:pt-32 lg:pt-36 pb-12 sm:pb-16 overflow-hidden">
                    {/* Decorative leaf art matching site aesthetic */}
                    <img
                        src={assets.rightSideLeaf}
                        alt="Decorative leaf background"
                        className="absolute -top-6 sm:-top-8 -right-8 sm:-right-10 w-72 sm:w-96 md:w-[500px] lg:w-[620px] pointer-events-none select-none z-0 opacity-90"
                    />

                    {/* Background subtle radial glow */}
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-100/40 rounded-full blur-[120px] pointer-events-none z-0" />

                    <div className="max-w-7xl xl:max-w-[1380px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
                        <div className="max-w-3xl">
                            {/* Overline Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-2.5 bg-[#E5F5E8] text-[#1A4D2E] px-4 py-1.5 rounded-full text-xs font-bold tracking-[0.18em] uppercase mb-5 border border-[#1A4D2E]/10 shadow-2xs"
                            >
                                <Sparkles className="w-3.5 h-3.5 fill-[#1A4D2E]" />
                                <span>LET'S CONNECT</span>
                            </motion.div>

                            {/* Main Title */}
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.1 }}
                                className="font-playfair font-bold text-4xl sm:text-5xl lg:text-6xl text-neutral-900 leading-[1.12] tracking-[-0.02em]"
                            >
                                Ready to Transition to{' '}
                                <span className="text-[#1A4D2E] underline decoration-[#78B61A]/40 underline-offset-8">
                                    Clean Solar Energy?
                                </span>
                            </motion.h1>

                            {/* Subtitle */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.2 }}
                                className="mt-5 text-neutral-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl font-normal"
                            >
                                Whether you need a customized solar rooftop quote, hybrid inverter battery sizing, or an
                                AI CCTV security plan, our certified engineering team in Kerala is ready to assist.
                            </motion.p>

                            {/* Trust badges row */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.3 }}
                                className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-neutral-700"
                            >
                                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs border border-neutral-200/80 px-3.5 py-2 rounded-full shadow-2xs">
                                    <ShieldCheck className="w-4 h-4 text-green-700" />
                                    <span>Free Site Assessment</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs border border-neutral-200/80 px-3.5 py-2 rounded-full shadow-2xs">
                                    <Clock className="w-4 h-4 text-green-700" />
                                    <span>Same-Day Response</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs border border-neutral-200/80 px-3.5 py-2 rounded-full shadow-2xs">
                                    <Building2 className="w-4 h-4 text-green-700" />
                                    <span>KSEB & Subsidy Support</span>
                                </div>
                                <a
                                    href="#faqs"
                                    className="flex items-center gap-2 bg-white/90 hover:bg-[#E5F5E8] backdrop-blur-xs border border-neutral-200/80 hover:border-[#1A4D2E]/30 px-3.5 py-2 rounded-full shadow-2xs transition-colors cursor-pointer text-neutral-800 hover:text-[#1A4D2E]"
                                >
                                    <HelpCircle className="w-4 h-4 text-green-700" />
                                    <span>Browse FAQs ({faqList.length})</span>
                                </a>
                            </motion.div>
                        </div>
                    </div>
                </header>

                {/* =========================================================
                    4 QUICK CONTACT CHANNELS
                ========================================================= */}
                <section className="max-w-7xl xl:max-w-[1380px] mx-auto px-6 sm:px-10 lg:px-16 pb-12 sm:pb-16 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {/* Channel 1: Phone Support */}
                        <motion.a
                            href="tel:+919526801406"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.05 }}
                            className="group bg-white border border-neutral-200/80 hover:border-green-600/40 rounded-3xl p-6 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-green-700 group-hover:bg-green-700 group-hover:text-white transition-colors duration-300">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <span className="block text-[11px] font-bold uppercase tracking-wider text-green-700 font-mono mt-5">
                                    DIRECT PHONE LINE
                                </span>
                                <h3 className="font-bold text-lg text-neutral-900 mt-1 font-sans">
                                    +91 95268 01406
                                </h3>
                                <p className="text-xs text-neutral-500 font-light mt-1.5 leading-relaxed">
                                    Speak directly with our technical coordinator for instant advice.
                                </p>
                            </div>
                            <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-green-700 group-hover:text-green-800 uppercase font-mono tracking-wider">
                                <span>Call Now</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.a>

                        {/* Channel 2: WhatsApp Chat */}
                        <motion.a
                            href={whatsappDirectLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="group bg-white border border-neutral-200/80 hover:border-emerald-600/40 rounded-3xl p-6 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                    <PiWhatsappLogoThin className="w-6 h-6 stroke-[1.5]" />
                                </div>
                                <span className="block text-[11px] font-bold uppercase tracking-wider text-emerald-700 font-mono mt-5">
                                    INSTANT WHATSAPP
                                </span>
                                <h3 className="font-bold text-lg text-neutral-900 mt-1 font-sans">
                                    +91 82898 41004
                                </h3>
                                <p className="text-xs text-neutral-500 font-light mt-1.5 leading-relaxed">
                                    Send rooftop photos, bills, or location pins for quick review.
                                </p>
                            </div>
                            <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 group-hover:text-emerald-800 uppercase font-mono tracking-wider">
                                <span>Start Chat</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.a>

                        {/* Channel 3: Official Email */}
                        <motion.a
                            href="mailto:solaredgeinnovations25@gmail.com"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                            className="group bg-white border border-neutral-200/80 hover:border-green-600/40 rounded-3xl p-6 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-green-700 group-hover:bg-green-700 group-hover:text-white transition-colors duration-300">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <span className="block text-[11px] font-bold uppercase tracking-wider text-green-700 font-mono mt-5">
                                    OFFICIAL EMAIL
                                </span>
                                <h3 className="font-bold text-sm sm:text-base text-neutral-900 mt-1 font-sans break-all">
                                    solaredgeinnovations25@gmail.com
                                </h3>
                                <p className="text-xs text-neutral-500 font-light mt-1.5 leading-relaxed">
                                    Formal proposals, commercial tenders, and vendor inquiries.
                                </p>
                            </div>
                            <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-green-700 group-hover:text-green-800 uppercase font-mono tracking-wider">
                                <span>Write Email</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.a>

                        {/* Channel 4: Visit Office */}
                        <motion.a
                            href="https://maps.google.com?q=Elakamon,Ayiroor,Varkala"
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="group bg-white border border-neutral-200/80 hover:border-green-600/40 rounded-3xl p-6 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-green-700 group-hover:bg-green-700 group-hover:text-white transition-colors duration-300">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <span className="block text-[11px] font-bold uppercase tracking-wider text-green-700 font-mono mt-5">
                                    EXPERIENCE CENTER
                                </span>
                                <h3 className="font-bold text-base text-neutral-900 mt-1 font-sans">
                                    Elakamon, Varkala
                                </h3>
                                <p className="text-xs text-neutral-500 font-light mt-1.5 leading-relaxed">
                                    Ayiroor - Varkala Paravoor Road (Near Post Office), Kerala.
                                </p>
                            </div>
                            <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-green-700 group-hover:text-green-800 uppercase font-mono tracking-wider">
                                <span>Directions</span>
                                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </div>
                        </motion.a>
                    </div>
                </section>

                {/* =========================================================
                    MAIN INTERACTIVE SECTION: FORM + DETAIL OVERVIEW
                ========================================================= */}
                <section className="max-w-7xl xl:max-w-[1380px] mx-auto px-6 sm:px-10 lg:px-16 pb-20 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        {/* =================================================
                            LEFT COLUMN: INTERACTIVE QUOTATION & CONTACT FORM
                        ================================================= */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="lg:col-span-7 bg-white border border-neutral-200/90 rounded-[32px] p-6 sm:p-10 lg:p-12 shadow-sm"
                        >
                            <div className="mb-8">
                                <span className="text-[11px] font-bold tracking-widest uppercase text-green-700 font-mono">
                                    REQUEST FREE CONSULTATION
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-bold font-playfair text-neutral-900 mt-1.5">
                                    Send Us a Message
                                </h2>
                                <p className="text-xs sm:text-sm text-neutral-500 font-light mt-2 leading-relaxed">
                                    Fill in your details and select the service you’re interested in. Our system
                                    engineers will get back to you with custom estimates and project feasibility.
                                </p>
                            </div>

                            {/* Success Notification Card */}
                            <AnimatePresence>
                                {status.success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                        className="mb-8 p-6 bg-[#E5F5E8] border border-green-300/80 rounded-2xl flex items-start gap-4 text-green-950"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center shrink-0">
                                            <Check className="w-5 h-5 stroke-[2.5]" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm">Message Sent Successfully!</h4>
                                            <p className="text-xs text-green-900 mt-1 leading-relaxed">
                                                {status.responseMsg || 'Thank you for reaching out. A Solar Edge engineer will contact you shortly.'}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setStatus((prev) => ({ ...prev, success: false }))}
                                                className="mt-3 text-xs font-bold underline cursor-pointer text-green-800 hover:text-green-950"
                                            >
                                                Send another message
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Error Notification Card */}
                            <AnimatePresence>
                                {status.error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                        className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3.5 text-red-900"
                                    >
                                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                        <div className="flex-1 text-xs">
                                            <p className="font-bold text-red-800">Notice:</p>
                                            <p className="mt-0.5 text-red-700">{status.error}</p>
                                            <div className="mt-3 flex items-center gap-3">
                                                <a
                                                    href={whatsappDirectLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold"
                                                >
                                                    <PiWhatsappLogoThin className="w-4 h-4 stroke-[2]" />
                                                    Chat on WhatsApp
                                                </a>
                                                <a
                                                    href="tel:+919526801406"
                                                    className="text-[11px] font-bold text-neutral-700 underline hover:text-neutral-900"
                                                >
                                                    Call Directly
                                                </a>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Service Selection Chips */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono mb-2.5">
                                        Select Required Service *
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {serviceOptions.map((svc) => {
                                            const IconComp = svc.icon;
                                            const isSelected = formData.service === svc.id;
                                            return (
                                                <button
                                                    key={svc.id}
                                                    type="button"
                                                    onClick={() => handleServiceSelect(svc.id)}
                                                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer text-xs ${
                                                        isSelected
                                                            ? 'bg-[#E5F5E8] border-[#1A4D2E] text-[#1A4D2E] font-bold shadow-2xs'
                                                            : 'bg-neutral-50/70 hover:bg-neutral-100/70 border-neutral-200 text-neutral-700 font-medium'
                                                    }`}
                                                >
                                                    <div
                                                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                                                            isSelected
                                                                ? 'bg-[#1A4D2E] text-white'
                                                                : 'bg-white text-neutral-500 border border-neutral-200'
                                                        }`}
                                                    >
                                                        <IconComp className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="truncate">{svc.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono mb-1.5"
                                    >
                                        Your Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Rahul Sharma"
                                        className="w-full bg-neutral-50/80 border border-neutral-200 rounded-2xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-green-700 focus:bg-white transition-all"
                                    />
                                </div>

                                {/* Email & Phone */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="block text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono mb-1.5"
                                        >
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="name@example.com"
                                            className="w-full bg-neutral-50/80 border border-neutral-200 rounded-2xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-green-700 focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="phone"
                                            className="block text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono mb-1.5"
                                        >
                                            Phone / WhatsApp *
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            required
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+91 98765 43210"
                                            className="w-full bg-neutral-50/80 border border-neutral-200 rounded-2xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-green-700 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Place (Typable) & District (Dropdown) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="place"
                                            className="block text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono mb-1.5"
                                        >
                                            Place / Town *
                                        </label>
                                        <input
                                            type="text"
                                            id="place"
                                            name="place"
                                            required
                                            value={formData.place}
                                            onChange={handleChange}
                                            placeholder="e.g. Varkala, Parippally, Ayiroor"
                                            className="w-full bg-neutral-50/80 border border-neutral-200 rounded-2xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-green-700 focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="district"
                                            className="block text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono mb-1.5"
                                        >
                                            District *
                                        </label>
                                        <select
                                            id="district"
                                            name="district"
                                            required
                                            value={formData.district}
                                            onChange={handleChange}
                                            className="w-full bg-neutral-50/80 border border-neutral-200 rounded-2xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:border-green-700 focus:bg-white transition-all cursor-pointer"
                                        >
                                            {keralaDistricts.map((dist) => (
                                                <option key={dist} value={dist}>
                                                    {dist}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Message */}
                                <div>
                                    <label
                                        htmlFor="message"
                                        className="block text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono mb-1.5"
                                    >
                                        Tell us about your requirements *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        rows={4}
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Describe your property (approx. monthly electricity bill, roof type, or number of CCTV cameras needed)..."
                                        className="w-full bg-neutral-50/80 border border-neutral-200 rounded-2xl p-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-green-700 focus:bg-white transition-all resize-none"
                                    ></textarea>
                                </div>

                                {/* Submit button */}
                                <div>
                                    <button
                                        type="submit"
                                        disabled={status.loading}
                                        className="w-full bg-[#1A4D2E] hover:bg-[#133a22] text-white py-4 px-8 rounded-full font-bold tracking-widest text-xs uppercase font-sans transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {status.loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Transmitting Message...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Submit Inquiry & Book Survey</span>
                                                <Send className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                    <p className="text-[11px] text-neutral-400 text-center mt-3 font-light">
                                        🔒 We respect your privacy. Your information is confidential and will never be shared.
                                    </p>
                                </div>
                            </form>
                        </motion.div>

                        {/* =================================================
                            RIGHT COLUMN: OFFICE INFO, HOURS & LIVE STATUS
                        ================================================= */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="lg:col-span-5 flex flex-col gap-6"
                        >
                            {/* Card 1: Office Headquarters & Live Status */}
                            <div className="bg-white border border-neutral-200/90 rounded-[32px] p-6 sm:p-8 shadow-sm">
                                <div className="flex items-center justify-between pb-5 border-b border-neutral-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-[#E5F5E8] text-[#1A4D2E] flex items-center justify-center">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-neutral-900 uppercase tracking-wider font-mono">
                                                HEAD OFFICE
                                            </h3>
                                            <p className="text-xs text-neutral-400">Varkala, Kerala</p>
                                        </div>
                                    </div>

                                    {/* Live Business Hours Indicator */}
                                    <div
                                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full ${
                                            isCurrentlyOpen
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                                                : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                                        }`}
                                    >
                                        <span
                                            className={`w-2 h-2 rounded-full ${
                                                isCurrentlyOpen ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'
                                            }`}
                                        />
                                        <span>{isCurrentlyOpen ? 'Open Now' : 'Closed Now'}</span>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-5 text-xs text-neutral-600">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-bold text-neutral-800">Physical Address:</span>
                                            <p className="text-neutral-500 leading-relaxed mt-0.5">
                                                Solar Edge Innovation,<br />
                                                Varkala Paravoor Road, Elakamon, Ayiroor,<br />
                                                Near Post Office, Varkala, Kerala — 695310
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Clock className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-bold text-neutral-800">Business Hours:</span>
                                            <p className="text-neutral-500 mt-0.5">Monday – Saturday: 9:00 AM – 8:00 PM</p>
                                            <p className="text-neutral-400 text-[11px]">Sunday: Emergency Technical On-Call</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Calendar className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-bold text-neutral-800">Site Survey Bookings:</span>
                                            <p className="text-neutral-500 mt-0.5">
                                                Conducted Mon – Sat (Morning & Afternoon slots)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 mt-6 border-t border-neutral-100 flex gap-3">
                                    <a
                                        href="https://maps.google.com?q=Elakamon,Ayiroor,Varkala"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 inline-flex items-center justify-center gap-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border border-neutral-200/80 rounded-2xl py-2.5 text-xs font-bold transition-colors font-mono uppercase tracking-wider"
                                    >
                                        <MapPin className="w-3.5 h-3.5 text-green-700" />
                                        <span>Google Maps</span>
                                    </a>
                                    <a
                                        href="tel:+919526801406"
                                        className="flex-1 inline-flex items-center justify-center gap-2 bg-[#E5F5E8] hover:bg-[#d8eedc] text-[#1A4D2E] border border-green-200/80 rounded-2xl py-2.5 text-xs font-bold transition-colors font-mono uppercase tracking-wider"
                                    >
                                        <Phone className="w-3.5 h-3.5" />
                                        <span>Call Office</span>
                                    </a>
                                </div>
                            </div>

                            {/* Card 2: Coverage Areas Pills */}
                            <div className="bg-white border border-neutral-200/90 rounded-[32px] p-6 sm:p-8 shadow-sm">
                                <h3 className="font-bold text-sm text-neutral-900 uppercase tracking-wider font-mono mb-2">
                                    KEY SERVICE LOCATIONS
                                </h3>
                                <p className="text-xs text-neutral-500 font-light leading-relaxed mb-4">
                                    Our technicians and solar installation fleet cover major districts and coastal towns across South Kerala:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {coverageAreas.map((area) => (
                                        <span
                                            key={area}
                                            className="inline-flex items-center gap-1.5 bg-neutral-50 border border-neutral-200/80 text-neutral-700 px-3 py-1.5 rounded-full text-xs font-medium"
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Card 3: Quick Direct WhatsApp Banner */}
                            <div className="bg-gradient-to-br from-[#0c2b1a] to-[#05180D] text-white rounded-[32px] p-6 sm:p-8 relative overflow-hidden shadow-lg border border-green-900/40">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
                                <div className="relative z-10">
                                    <span className="text-[10px] font-bold tracking-widest uppercase text-green-400 font-mono">
                                        PREFER SPEED?
                                    </span>
                                    <h4 className="font-playfair font-bold text-xl sm:text-2xl mt-1">
                                        WhatsApp Fast-Track
                                    </h4>
                                    <p className="text-xs text-neutral-300 font-light mt-2 leading-relaxed">
                                        Send your KSEB electricity bill copy directly over WhatsApp for an instant rooftop kW sizing estimate and subsidy calculation.
                                    </p>
                                    <a
                                        href={whatsappDirectLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-5 inline-flex items-center gap-2 bg-[#78B61A] hover:bg-[#689f15] text-white px-5 py-3 rounded-full text-xs font-bold tracking-wider uppercase font-sans transition-all duration-300 shadow-md"
                                    >
                                        <PiWhatsappLogoThin className="w-4 h-4 stroke-[2]" />
                                        <span>Send Bill on WhatsApp</span>
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* =========================================================
                    INTERACTIVE MAP EMBED SECTION
                ========================================================= */}
                <section className="max-w-7xl xl:max-w-[1380px] mx-auto px-6 sm:px-10 lg:px-16 pb-20 relative z-10">
                    <div className="bg-white border border-neutral-200/90 rounded-[36px] p-4 sm:p-6 shadow-sm overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 mb-2">
                            <div>
                                <span className="text-[11px] font-bold tracking-widest uppercase text-green-700 font-mono">
                                    FIND OUR OFFICE & STORE
                                </span>
                                <h3 className="font-playfair font-bold text-2xl text-neutral-900 mt-1">
                                    Visit Us in Varkala, Kerala
                                </h3>
                                <p className="text-xs text-neutral-500 font-light mt-0.5">
                                    Located conveniently along Varkala Paravoor Road, near the Post Office.
                                </p>
                            </div>
                            <a
                                href="https://maps.google.com?q=Elakamon,Ayiroor,Varkala"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-3 rounded-full text-xs font-bold tracking-wider uppercase font-mono transition-all self-start sm:self-auto shrink-0 shadow-xs"
                            >
                                <MapPin className="w-3.5 h-3.5 text-green-400" />
                                <span>Get Driving Route</span>
                                <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                            </a>
                        </div>

                        {/* Map iframe embed */}
                        <div className="relative w-full h-[380px] sm:h-[440px] rounded-[28px] overflow-hidden border border-neutral-100">
                            <iframe
                                title="Solar Edge Innovation Office Map"
                                src="https://maps.google.com/maps?q=Elakamon,%20Ayiroor,%20Varkala,%20Kerala&t=&z=13&ie=UTF8&iwloc=&output=embed"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="w-full h-full filter contrast-[1.03]"
                            ></iframe>
                        </div>
                    </div>
                </section>

                {/* =========================================================
                    FREQUENTLY ASKED QUESTIONS (FAQ) SECTION
                ========================================================= */}
                <section id="faqs" className="max-w-5xl mx-auto px-6 sm:px-10 pb-24 relative z-10 scroll-mt-24">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <span className="text-[11px] font-bold tracking-widest uppercase text-green-700 font-mono">
                            COMMON INQUIRIES & GUIDANCE
                        </span>
                        <h2 className="font-playfair font-bold text-3xl sm:text-4xl text-neutral-900 mt-2">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-xs sm:text-sm text-neutral-500 font-light mt-2 leading-relaxed">
                            Got questions about our rooftop site surveys, PM Surya Ghar subsidies, KSEB net metering, or warranties? Here are quick answers.
                        </p>

                        {/* Category filter tabs */}
                        {faqCategories && faqCategories.length > 1 && (
                            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                                {faqCategories.map((cat) => {
                                    const isSelected = selectedFaqCategory === cat;
                                    return (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => handleCategorySelect(cat)}
                                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                                isSelected
                                                    ? 'bg-[#1A4D2E] text-white shadow-xs'
                                                    : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200/80 hover:border-neutral-300'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="space-y-3.5">
                        {displayedFaqs && displayedFaqs.map((faq, index) => {
                            const isOpen = activeFaq === index;
                            return (
                                <motion.div
                                    key={`${selectedFaqCategory}-${index}`}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.35, delay: index * 0.04 }}
                                    className="bg-white border border-neutral-200/80 hover:border-neutral-300 rounded-2xl overflow-hidden transition-all duration-200 shadow-2xs"
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleFaq(index)}
                                        className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-50/60 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-sm sm:text-base text-neutral-900 font-sans">
                                                {faq.q}
                                            </span>
                                            {faq.category && (
                                                <span className="hidden sm:inline-block text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 shrink-0">
                                                    {faq.category}
                                                </span>
                                            )}
                                        </div>
                                        <div
                                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                                                isOpen ? 'rotate-180 bg-[#E5F5E8] text-[#1A4D2E]' : 'bg-neutral-100 text-neutral-500'
                                            }`}
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </button>
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-neutral-600 font-light leading-relaxed border-t border-neutral-100/80">
                                                    {faq.a}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Bottom CTA Card */}
                    <div className="mt-12 bg-gradient-to-br from-emerald-50/70 via-white to-green-50/50 border border-emerald-100/80 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs">
                        <div className="text-center sm:text-left">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-green-700 font-mono">
                                STILL HAVE QUESTIONS?
                            </span>
                            <h3 className="font-bold text-lg sm:text-xl text-neutral-900 mt-1">
                                Need custom sizing or have unique rooftop requirements?
                            </h3>
                            <p className="text-xs sm:text-sm text-neutral-500 font-light mt-1 max-w-xl">
                                Our solar engineers in Kerala are available right now to assess your energy needs and provide a free quotation.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                            <a
                                href={whatsappDirectLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-[#1A4D2E] hover:bg-[#143d24] text-white px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase font-mono transition-all shadow-xs"
                            >
                                <PiWhatsappLogoThin className="w-4 h-4 stroke-[1.5]" />
                                <span>WhatsApp Us</span>
                            </a>
                            <a
                                href="tel:+919526801406"
                                className="inline-flex items-center gap-2 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200/90 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase font-mono transition-all shadow-2xs"
                            >
                                <Phone className="w-3.5 h-3.5 text-green-700" />
                                <span>+91 95268 01406</span>
                            </a>
                        </div>
                    </div>
                </section>
            </div>

            {/* =========================================================
                OPTIMIZED SUCCESS POPUP MODAL
            ========================================================= */}
            <AnimatePresence>
                {showSuccessModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="success-modal-title"
                    >
                        {/* Backdrop Blur */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            onClick={() => setShowSuccessModal(false)}
                            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm"
                        />

                        {/* Modal Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden z-10 my-8 text-center p-6 sm:p-8"
                        >
                            {/* Decorative Top Accent Glow */}
                            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-500 via-green-500 to-amber-400" />

                            {/* Close Button */}
                            <button
                                type="button"
                                onClick={() => setShowSuccessModal(false)}
                                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 transition-colors flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                aria-label="Close modal"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Animated Icon Badge */}
                            <div className="mx-auto mt-2 mb-4 w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100/80 flex items-center justify-center shadow-inner relative">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 15 }}
                                    className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30"
                                >
                                    <Check className="w-7 h-7 stroke-[3]" />
                                </motion.div>
                            </div>

                            {/* Badge & Title */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-2.5">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Inquiry Received</span>
                            </div>

                            <h3
                                id="success-modal-title"
                                className="text-2xl sm:text-3xl font-bold font-playfair text-neutral-900 tracking-tight"
                            >
                                Thank You!
                            </h3>

                            <p className="mt-2 text-xs sm:text-sm text-neutral-600 font-light leading-relaxed max-w-sm mx-auto">
                                {status.responseMsg || 'Your message has been sent successfully. Our solar engineering team will review your inquiry and contact you shortly.'}
                            </p>

                            {/* What happens next box */}
                            <div className="mt-6 p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70 text-left space-y-2.5">
                                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                                    What happens next?
                                </div>
                                <div className="flex items-start gap-2.5 text-xs text-neutral-700">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>Our system engineers will assess feasibility and solar subsidy benefits.</span>
                                </div>
                                <div className="flex items-start gap-2.5 text-xs text-neutral-700">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>We’ll reach out via phone or email within 2–4 business hours.</span>
                                </div>
                            </div>

                            {/* CTA Actions */}
                            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                                <a
                                    href={submittedWhatsAppUrl || whatsappDirectLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    <PiWhatsappLogoThin className="w-5 h-5 text-xl font-bold" />
                                    <span>Continue on WhatsApp</span>
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setShowSuccessModal(false)}
                                    className="w-full sm:w-auto py-3 px-6 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold transition-all hover:shadow-md cursor-pointer"
                                >
                                    Done
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Contact;

