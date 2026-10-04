import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { AdminLogin } from '../components/admin/AdminLogin';
import { DashboardOverview } from '../components/admin/DashboardOverview';
import { ProjectGalleryManager } from '../components/admin/ProjectGalleryManager';
import { FaqManager } from '../components/admin/FaqManager';
import { QuotationEditor } from '../components/admin/QuotationEditor';
import { InquiryManager } from '../components/admin/InquiryManager';
import { LetterheadEditor } from '../components/admin/LetterheadEditor';
import { QuotationHistoryManager } from '../components/admin/QuotationHistoryManager';
import { Toaster, toast } from 'react-hot-toast';
import {
    LayoutDashboard,
    FolderGit2,
    HelpCircle,
    FileText,
    History,
    ScrollText,
    LogOut,
    Globe,
    User,
    Sparkles,
    AlertTriangle,
    Mail,
    X
} from 'lucide-react';
import { assets } from '../assets/assets';

const VALID_TABS = ['dashboard', 'inquiries', 'projects', 'faqs', 'quotation', 'quotation-history', 'letterhead'];

const AdminPage = () => {
    const { tab } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return sessionStorage.getItem('solar_admin_auth') === 'true';
    });

    const queryTab = searchParams.get('tab');
    const activeTab = (tab && VALID_TABS.includes(tab.toLowerCase()))
        ? tab.toLowerCase()
        : (queryTab && VALID_TABS.includes(queryTab.toLowerCase()) ? queryTab.toLowerCase() : 'dashboard');

    const handleTabChange = (tabId) => {
        if (VALID_TABS.includes(tabId)) {
            navigate(`/admin/${tabId}`);
        }
    };

    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [pendingInquiriesCount, setPendingInquiriesCount] = useState(0);

    // Fetch pending count periodically or on mount / tab change
    const fetchInquiriesBadge = async () => {
        try {
            const res = await fetch('/api/admin-inquiries.php?status=pending', {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                if (data.counts) {
                    setPendingInquiriesCount(data.counts.pending || 0);
                }
            }
        } catch {
            // Ignore background badge fetch errors
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchInquiriesBadge();
        }
    }, [isAuthenticated, activeTab]);

    // Verify HttpOnly cookie / PHP session with server on initial mount
    useEffect(() => {
        let isMounted = true;
        const verifySession = async () => {
            try {
                const res = await fetch('/api/admin-verify.php', {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.authenticated && isMounted) {
                        sessionStorage.setItem('solar_admin_auth', 'true');
                        setIsAuthenticated(true);
                    }
                } else if (res.status === 401 && isMounted) {
                    sessionStorage.removeItem('solar_admin_auth');
                    setIsAuthenticated(false);
                }
            } catch (err) {
                // Network unreachable — preserve existing UI state
            }
        };

        verifySession();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [activeTab]);

    const handleLoginSuccess = () => {
        sessionStorage.setItem('solar_admin_auth', 'true');
        setIsAuthenticated(true);
    };

    const handleUnauthorized = async () => {
        try {
            await fetch('/api/admin-logout.php', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (e) {}

        sessionStorage.removeItem('solar_admin_auth');
        setIsAuthenticated(false);
        navigate('/admin');
        toast.error('Session expired or unauthorized. Please log in again.');
    };

    const confirmLogout = async () => {
        try {
            await fetch('/api/admin-logout.php', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (e) {}

        sessionStorage.removeItem('solar_admin_auth');
        setIsAuthenticated(false);
        setIsLogoutModalOpen(false);
        navigate('/admin');
        toast.success('Logged out successfully. See you soon!', {
            icon: '👋',
            duration: 3500
        });
    };

    if (!isAuthenticated) {
        return (
            <>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3500,
                        style: {
                            background: '#0F172A',
                            color: '#F8FAFC',
                            borderRadius: '16px',
                            padding: '12px 18px',
                            fontSize: '13px',
                            fontWeight: '600',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
                        },
                    }}
                />
                <AdminLogin onLoginSuccess={handleLoginSuccess} />
            </>
        );
    }

    const navigationItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        {
            id: 'inquiries',
            label: 'Enquiry',
            icon: Mail,
            badge: pendingInquiriesCount > 0 ? pendingInquiriesCount : null,
        },
        { id: 'projects', label: 'Projects & Gallery', icon: FolderGit2 },
        { id: 'faqs', label: 'Website FAQs', icon: HelpCircle },
        { id: 'quotation', label: 'Quotation Builder', icon: FileText },
        { id: 'quotation-history', label: 'Quotation History', icon: History },
        { id: 'letterhead', label: 'Letterhead', icon: ScrollText },
    ];

    return (
        <div className="w-full min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
            {/* Global Hot Toast Container */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3500,
                    style: {
                        background: '#0F172A',
                        color: '#F8FAFC',
                        borderRadius: '16px',
                        padding: '12px 18px',
                        fontSize: '13px',
                        fontWeight: '600',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
                    },
                    success: {
                        iconTheme: {
                            primary: '#10B981',
                            secondary: '#FFFFFF',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#EF4444',
                            secondary: '#FFFFFF',
                        },
                    }
                }}
            />

            {/* Top Navigation Bar */}
            <header className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/90 shadow-sm ${activeTab === 'quotation' || activeTab === 'letterhead' ? 'hidden md:block' : 'block'}`}>
                {/* Top Row: Brand & Action Controls */}
                <div className="px-4 sm:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-4">
                    {/* Brand */}
                    <div className="flex items-center gap-3.5">
                        <img src={assets.logo} alt="Solar Edge Logo" className="h-10 sm:h-12 object-contain transition-transform hover:scale-105" />
                        <div>
                            <span className="text-base sm:text-lg font-black text-neutral-900 block leading-tight tracking-tight">
                                Solar Edge Innovations
                            </span>
                            <span className="text-xs text-emerald-700 font-semibold tracking-wide uppercase flex items-center gap-1 font-mono mt-0.5">
                                <Sparkles size={12} />
                                Admin Panel
                            </span>
                        </div>
                    </div>

                    {/* Right Actions (View Website, admin badge, Logout) */}
                    <div className="flex items-center gap-2.5">
                        <a
                            href="/projects"
                            target="_blank"
                            rel="noreferrer"
                            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm text-neutral-700 hover:text-[#1A4D2E] font-semibold border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
                            title="View Public Website Projects"
                        >
                            <Globe size={15} />
                            <span>View Website</span>
                        </a>

                        <button
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl text-xs sm:text-sm font-semibold text-neutral-700 cursor-pointer transition-all"
                            title="Logged in as admin (Click to Log Out)"
                        >
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <User size={15} className="text-[#1A4D2E]" />
                            <span>admin</span>
                        </button>

                        <button
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm text-neutral-700 hover:text-neutral-900 font-semibold bg-neutral-100 hover:bg-neutral-200/80 rounded-xl transition-all cursor-pointer"
                            title="Log out of admin session"
                        >
                            <LogOut size={15} />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>

                {/* Sub-bar / Primary Navigation Row */}
                <div className="w-full px-4 sm:px-8 pb-3 pt-0 border-t border-neutral-100 sm:border-t-0 flex items-center overflow-x-auto scrollbar-none">
                    <nav className="w-full flex items-center gap-1.5 bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200/80 overflow-x-auto scrollbar-none">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleTabChange(item.id)}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${isActive
                                            ? 'bg-[#1A4D2E] text-white shadow-xs'
                                            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                                        }`}
                                >
                                    <Icon size={16} />
                                    <span>{item.label}</span>
                                    {item.badge != null && (
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-xs font-black leading-none ${
                                                isActive
                                                    ? 'bg-amber-400 text-neutral-950 font-mono shadow-xs'
                                                    : 'bg-amber-500 text-white font-mono'
                                            }`}
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </header>

            {/* Main Content Area */}
            <main className={`flex-1 ${activeTab === 'quotation' || activeTab === 'letterhead' ? 'pb-0' : 'pb-12'}`}>
                {activeTab === 'dashboard' && <DashboardOverview onNavigate={handleTabChange} onUnauthorized={handleUnauthorized} />}
                {activeTab === 'inquiries' && <InquiryManager onUnauthorized={handleUnauthorized} />}
                {activeTab === 'projects' && <ProjectGalleryManager onUnauthorized={handleUnauthorized} />}
                {activeTab === 'faqs' && <FaqManager onUnauthorized={handleUnauthorized} />}
                {activeTab === 'quotation' && (
                    <QuotationEditor
                        onLogout={() => setIsLogoutModalOpen(true)}
                        onBack={() => handleTabChange('dashboard')}
                        onNavigate={handleTabChange}
                    />
                )}
                {activeTab === 'quotation-history' && (
                    <QuotationHistoryManager
                        onNavigate={handleTabChange}
                        onUnauthorized={handleUnauthorized}
                    />
                )}
                {activeTab === 'letterhead' && (
                    <LetterheadEditor
                        onLogout={() => setIsLogoutModalOpen(true)}
                        onBack={() => handleTabChange('dashboard')}
                        onNavigate={handleTabChange}
                    />
                )}
            </main>

            {/* Logout Confirmation Modal Popup */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-neutral-200 space-y-5 relative">
                        <button
                            onClick={() => setIsLogoutModalOpen(false)}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-xl hover:bg-neutral-100 cursor-pointer"
                        >
                            <X size={16} />
                        </button>

                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <AlertTriangle size={24} />
                        </div>

                        <div className="space-y-1.5">
                            <h3 className="text-base font-black text-neutral-900">
                                Confirm Admin Logout
                            </h3>
                            <p className="text-xs text-neutral-500 leading-relaxed">
                                Are you sure you want to end your admin session? You will be signed out from all management tabs.
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-100">
                            <button
                                type="button"
                                onClick={() => setIsLogoutModalOpen(false)}
                                className="px-4 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs sm:text-sm font-semibold text-neutral-700 transition-all cursor-pointer"
                            >
                                Stay Logged In
                            </button>
                            <button
                                type="button"
                                onClick={confirmLogout}
                                className="px-5 py-2 rounded-xl bg-[#1A4D2E] hover:bg-[#143c24] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
                            >
                                Yes, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
