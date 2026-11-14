import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { AdminLogin } from '../components/admin/AdminLogin';
import { AdminSidebar, ADMIN_NAV_ITEMS } from '../components/admin/AdminSidebar';
import { DashboardOverview } from '../components/admin/DashboardOverview';
import { ProjectGalleryManager } from '../components/admin/ProjectGalleryManager';
import { FaqManager } from '../components/admin/FaqManager';
import { QuotationEditor } from '../components/admin/QuotationEditor';
import { InquiryManager } from '../components/admin/InquiryManager';
import { LetterheadEditor } from '../components/admin/LetterheadEditor';
import { QuotationHistoryManager } from '../components/admin/QuotationHistoryManager';
import { PaymentManager } from '../components/admin/PaymentManager';
import { ReportManager } from '../components/admin/reports/ReportManager';
import { AgreementEditor } from '../components/admin/AgreementEditor';
import { Toaster, toast } from 'react-hot-toast';
import {
    LogOut,
    Globe,
    User,
    AlertTriangle,
    X,
    Menu
} from 'lucide-react';

const VALID_TABS = ['dashboard', 'inquiries', 'projects', 'faqs', 'letterhead', 'quotation', 'agreement', 'quotation-history', 'payments', 'reports'];

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

    // Sidebar Collapsed Rail State (persisted in localStorage)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        try {
            return localStorage.getItem('solar_admin_sidebar_collapsed') === 'true';
        } catch {
            return false;
        }
    });

    const toggleSidebarCollapse = (val) => {
        setIsSidebarCollapsed((prev) => {
            const next = typeof val === 'boolean' ? val : !prev;
            try {
                localStorage.setItem('solar_admin_sidebar_collapsed', String(next));
            } catch {
                // Ignore storage availability errors
            }
            return next;
        });
    };

    // Mobile slide-over drawer state (< md screens)
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const mainRef = useRef(null);

    // Keyboard shortcut (⌘B or Ctrl+B) to toggle rail / expanded sidebar
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                toggleSidebarCollapse();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

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
            } catch {
                // Network unreachable — preserve existing UI state
            }
        };

        verifySession();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        if (mainRef.current) {
            mainRef.current.scrollTo(0, 0);
        }
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
        } catch {
            // Ignore logout network errors
        }

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
        } catch {
            // Ignore logout network errors
        }

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

    const activeTabItem = ADMIN_NAV_ITEMS.find((item) => item.id === activeTab) || ADMIN_NAV_ITEMS[0];
    const ActiveTabIcon = activeTabItem.icon;
    const isDocumentTab = activeTab === 'quotation' || activeTab === 'letterhead' || activeTab === 'agreement';

    return (
        <div className="w-full h-screen bg-[#F8FAFC] flex font-poppins admin-poppins-theme overflow-hidden">
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

            {/* Admin Sidebar (Collapsible Rail on desktop, Slide-over Drawer on mobile) */}
            <AdminSidebar
                activeTab={activeTab}
                onTabChange={handleTabChange}
                pendingInquiriesCount={pendingInquiriesCount}
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={toggleSidebarCollapse}
                isMobileOpen={isMobileSidebarOpen}
                setIsMobileOpen={setIsMobileSidebarOpen}
                onLogout={() => setIsLogoutModalOpen(true)}
            />

            {/* Main Content Column */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Single-Row Clean Top Header */}
                <header className="h-[60px] bg-white/95 backdrop-blur-md border-b border-neutral-200/90 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 shadow-2xs">
                    {/* Left: Mobile hamburger menu toggle + Current Tab Name */}
                    <div className="flex items-center gap-3">
                        {/* Hamburger button for mobile (< md) */}
                        <button
                            type="button"
                            onClick={() => setIsMobileSidebarOpen(true)}
                            aria-label="Open navigation menu"
                            className="md:hidden p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                        >
                            <Menu size={20} />
                        </button>

                        {/* Current Active Tab Info */}
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1A4D2E] flex items-center justify-center shrink-0 border border-emerald-100/60">
                                <ActiveTabIcon size={16} />
                            </div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-sm sm:text-base font-bold text-neutral-900 leading-tight">
                                    {activeTabItem.label}
                                </h1>
                                {activeTabItem.id === 'inquiries' && pendingInquiriesCount > 0 && (
                                    <span className="bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                                        {pendingInquiriesCount} pending
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 sm:gap-2.5">
                        <a
                            href="/projects"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm text-neutral-700 hover:text-[#1A4D2E] font-semibold border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
                            title="View Public Website Projects"
                        >
                            <Globe size={14} />
                            <span className="hidden sm:inline">View Website</span>
                        </a>

                        <div
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-xl text-xs sm:text-sm font-semibold text-neutral-700 select-none"
                            title="Logged in as admin"
                        >
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <User size={14} className="text-[#1A4D2E]" />
                            <span>admin</span>
                        </div>

                        <button
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm text-neutral-700 hover:text-red-600 font-semibold bg-neutral-100 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                            title="Log out of admin session"
                        >
                            <LogOut size={14} />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <main
                    ref={mainRef}
                    className={`flex-1 overflow-y-auto min-h-0 ${isDocumentTab ? 'font-sans' : 'font-poppins'} ${isDocumentTab ? 'pb-0' : 'pb-12'}`}
                    data-lenis-prevent
                >
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
                {activeTab === 'agreement' && (
                    <AgreementEditor
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
                {activeTab === 'payments' && (
                    <PaymentManager
                        onNavigate={handleTabChange}
                        onUnauthorized={handleUnauthorized}
                    />
                )}
                {activeTab === 'reports' && (
                    <ReportManager
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
        </div>

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
                            <h3 className="text-base font-semibold text-neutral-900">
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
                                className="px-4 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs sm:text-sm font-medium text-neutral-700 transition-all cursor-pointer"
                            >
                                Stay Logged In
                            </button>
                            <button
                                type="button"
                                onClick={confirmLogout}
                                className="px-5 py-2 rounded-xl bg-[#1A4D2E] hover:bg-[#143c24] text-white text-xs sm:text-sm font-medium transition-all shadow-xs cursor-pointer"
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
