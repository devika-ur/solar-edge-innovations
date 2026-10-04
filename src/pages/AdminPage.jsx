import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { AdminLogin } from '../components/admin/AdminLogin';
import { DashboardOverview } from '../components/admin/DashboardOverview';
import { ProjectGalleryManager } from '../components/admin/ProjectGalleryManager';
import { FaqManager } from '../components/admin/FaqManager';
import { QuotationEditor } from '../components/admin/QuotationEditor';
import { InquiryManager } from '../components/admin/InquiryManager';
import { Toaster, toast } from 'react-hot-toast';
import {
    LayoutDashboard,
    FolderGit2,
    HelpCircle,
    FileText,
    LogOut,
    Globe,
    User,
    Sparkles,
    AlertTriangle,
    Mail,
    X
} from 'lucide-react';
import { assets } from '../assets/assets';

const VALID_TABS = ['dashboard', 'inquiries', 'projects', 'faqs', 'quotation'];

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
            label: 'Contact Inquiries',
            icon: Mail,
            badge: pendingInquiriesCount > 0 ? pendingInquiriesCount : null,
        },
        { id: 'projects', label: 'Projects & Gallery', icon: FolderGit2 },
        { id: 'faqs', label: 'Website FAQs', icon: HelpCircle },
        { id: 'quotation', label: 'Quotation Builder', icon: FileText },
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
            <header className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/90 px-4 sm:px-6 py-2.5 items-center justify-between gap-3 shadow-2xs ${activeTab === 'quotation' ? 'hidden md:flex' : 'flex flex-wrap'}`}>
                {/* Brand */}
                <div className="flex items-center gap-3">
                    <img src={assets.logo} alt="Solar Edge Logo" className="h-8 object-contain" />
                    <div>
                        <span className="text-sm font-black text-neutral-900 block leading-tight">
                            Solar Edge Innovations
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold tracking-wide uppercase flex items-center gap-1 font-mono">
                            <Sparkles size={10} />
                            React Admin Portal
                        </span>
                    </div>
                </div>

                {/* Primary Nav Switcher */}
                <nav className="flex items-center gap-1 bg-neutral-100 p-1 rounded-2xl border border-neutral-200/80 overflow-x-auto max-w-full scrollbar-none">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleTabChange(item.id)}
                                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${isActive
                                        ? 'bg-[#1A4D2E] text-white shadow-xs'
                                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60'
                                    }`}
                            >
                                <Icon size={14} />
                                <span>{item.label}</span>
                                {item.badge != null && (
                                    <span
                                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none ${
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

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    <a
                        href="/projects"
                        target="_blank"
                        rel="noreferrer"
                        className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-600 hover:text-[#1A4D2E] font-semibold border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
                        title="View Public Website Projects"
                    >
                        <Globe size={13} />
                        <span>View Website</span>
                    </a>

                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="hidden lg:flex items-center gap-2 px-3 py-1 bg-neutral-100/90 hover:bg-red-50 hover:border-red-200 rounded-xl text-xs font-semibold text-neutral-700 hover:text-red-700 border border-neutral-200/80 cursor-pointer transition-colors"
                        title="Logged in as admin (Click to Log Out)"
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <User size={13} className="text-[#1A4D2E]" />
                        <span>admin</span>
                    </button>

                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:text-red-700 font-semibold bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
                        title="Log out of admin session"
                    >
                        <LogOut size={13} />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className={`flex-1 ${activeTab === 'quotation' ? 'pb-0' : 'pb-12'}`}>
                {activeTab === 'dashboard' && <DashboardOverview onNavigate={handleTabChange} onUnauthorized={handleUnauthorized} />}
                {activeTab === 'inquiries' && <InquiryManager onUnauthorized={handleUnauthorized} />}
                {activeTab === 'projects' && <ProjectGalleryManager onUnauthorized={handleUnauthorized} />}
                {activeTab === 'faqs' && <FaqManager onUnauthorized={handleUnauthorized} />}
                {activeTab === 'quotation' && (
                    <QuotationEditor
                        onLogout={() => setIsLogoutModalOpen(true)}
                        onBack={() => handleTabChange('dashboard')}
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
                                className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                            >
                                Stay Logged In
                            </button>
                            <button
                                type="button"
                                onClick={confirmLogout}
                                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
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
