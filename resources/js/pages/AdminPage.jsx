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
import { ApprovedQuotationsManager } from '../components/admin/ApprovedQuotationsManager';
import { ApplicationTrackingManager } from '../components/admin/ApplicationTrackingManager';
import { PaymentManager } from '../components/admin/PaymentManager';
import { ReportManager } from '../components/admin/reports/ReportManager';
import { AgreementEditor } from '../components/admin/AgreementEditor';
import { ActivityLogManager } from '../components/admin/ActivityLogManager';
import { Toaster, toast } from 'react-hot-toast';
import {
    LogOut,
    Globe,
    User,
    AlertTriangle,
    ShieldAlert,
    KeyRound,
    Mail,
    Send,
    CheckCircle2,
    RefreshCw,
    X,
    Menu
} from 'lucide-react';

const VALID_TABS = [
    'dashboard',
    'inquiries',
    'projects',
    'faqs',
    'letterhead',
    'quotation',
    'quotation-history',
    'approved-quotations',
    'agreement',
    'payments',
    'application-tracking',
    'reports',
    'payment-report',
    'quotation-report',
    'approved-quotations-report',
    'activity-log'
];

const AdminPage = () => {
    const { tab } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return sessionStorage.getItem('solar_admin_auth') === 'true';
    });

    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const raw = sessionStorage.getItem('solar_admin_user');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });

    const handleLoginSuccess = () => {
        try {
            const raw = sessionStorage.getItem('solar_admin_user');
            if (raw) setCurrentUser(JSON.parse(raw));
        } catch {}
        setIsAuthenticated(true);
    };

    const queryTab = searchParams.get('tab');
    const activeTab = (tab && VALID_TABS.includes(tab.toLowerCase()))
        ? tab.toLowerCase()
        : (queryTab && VALID_TABS.includes(queryTab.toLowerCase()) ? queryTab.toLowerCase() : 'dashboard');

    const [workflowContext, setWorkflowContext] = useState({});

    const handleTabChange = (tabId, extra = null) => {
        if (VALID_TABS.includes(tabId)) {
            setWorkflowContext((prev) => {
                const next = { ...prev, [tabId]: extra };
                if (tabId !== 'quotation') {
                    delete next['quotation'];
                }
                return next;
            });
            navigate(`/admin/${tabId}`);
        }
    };

    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [pendingInquiriesCount, setPendingInquiriesCount] = useState(0);

    // Change Password via Email Modal (In Logout / Account Section)
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [sendResetEmail, setSendResetEmail] = useState(() => {
        try {
            const raw = sessionStorage.getItem('solar_admin_user');
            const u = raw ? JSON.parse(raw) : null;
            return u?.email || '';
        } catch {
            return '';
        }
    });
    const [isSendingReset, setIsSendingReset] = useState(false);
    const [resetLinkSent, setResetLinkSent] = useState(false);
    const [sentMaskedEmail, setSentMaskedEmail] = useState('');

    const openChangePasswordModal = () => {
        setResetLinkSent(false);
        if (currentUser?.email) {
            setSendResetEmail(currentUser.email);
        }
        setIsChangePasswordModalOpen(true);
    };

    const handleSendResetEmail = async (e) => {
        if (e) e.preventDefault();
        setIsSendingReset(true);
        const sendToast = toast.loading('Sending secure reset link to your email...');

        try {
            const res = await fetch('/api/admin/password/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    delivery_email: sendResetEmail.trim()
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success('Password reset link sent to your email!', { id: sendToast });
                setResetLinkSent(true);
                setSentMaskedEmail(data.masked_email || sendResetEmail);
            } else {
                toast.error(data.message || 'Failed to send reset email.', { id: sendToast });
            }
        } catch {
            toast.error('Network error sending reset email.', { id: sendToast });
        } finally {
            setIsSendingReset(false);
        }
    };

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
                        if (data.admin) {
                            sessionStorage.setItem('solar_admin_user', JSON.stringify(data.admin));
                            setCurrentUser(data.admin);
                        }
                        setIsAuthenticated(true);
                    }
                } else if (res.status === 401 && isMounted) {
                    sessionStorage.removeItem('solar_admin_auth');
                    sessionStorage.removeItem('solar_admin_user');
                    setCurrentUser(null);
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
                onChangePassword={openChangePasswordModal}
                userRole={currentUser?.role}
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
                            title={currentUser?.role === 'super_admin' ? 'Logged in as Super Admin' : 'Logged in as Staff Admin'}
                        >
                            <span className={`w-2 h-2 rounded-full ${currentUser?.role === 'super_admin' ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
                            <User size={14} className={currentUser?.role === 'super_admin' ? 'text-amber-700' : 'text-[#1A4D2E]'} />
                            <span>{currentUser?.username || 'admin'}</span>
                            {currentUser?.role === 'super_admin' && (
                                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                    SUPER ADMIN
                                </span>
                            )}
                        </div>

                        {/* Change Password Button beside Logout */}
                        <button
                            type="button"
                            onClick={openChangePasswordModal}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm text-neutral-700 hover:text-[#1A4D2E] font-semibold bg-neutral-100 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
                            title="Change password via email reset link"
                        >
                            <KeyRound size={14} className="text-[#1A4D2E]" />
                            <span className="hidden sm:inline">Change Password</span>
                        </button>

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
                        key={workflowContext['quotation']?.editId ? `edit-${workflowContext['quotation'].editId}` : 'new-quotation'}
                        editId={workflowContext['quotation']?.editId}
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
                {activeTab === 'approved-quotations' && (
                    <ApprovedQuotationsManager
                        onNavigate={handleTabChange}
                        onUnauthorized={handleUnauthorized}
                    />
                )}
                {activeTab === 'agreement' && (
                    <AgreementEditor
                        quotation={workflowContext['agreement']?.quotation}
                        quotationId={workflowContext['agreement']?.quotationId}
                        onLogout={() => setIsLogoutModalOpen(true)}
                        onBack={() => handleTabChange('dashboard')}
                        onNavigate={handleTabChange}
                    />
                )}
                {activeTab === 'payments' && (
                    <PaymentManager
                        onNavigate={handleTabChange}
                        onUnauthorized={handleUnauthorized}
                    />
                )}
                {activeTab === 'application-tracking' && (
                    <ApplicationTrackingManager
                        initialApplicantId={workflowContext['application-tracking']?.applicantId}
                        onNavigate={handleTabChange}
                        onUnauthorized={handleUnauthorized}
                    />
                )}
                {(activeTab === 'reports' || activeTab === 'payment-report') && (
                    <ReportManager
                        fixedReportType="payment_history"
                        onNavigate={handleTabChange}
                        onUnauthorized={handleUnauthorized}
                    />
                )}
                {activeTab === 'quotation-report' && (
                    <ReportManager
                        fixedReportType="quotation_history"
                        onNavigate={handleTabChange}
                        onUnauthorized={handleUnauthorized}
                    />
                )}
                {activeTab === 'approved-quotations-report' && (
                    <ReportManager
                        fixedReportType="approved_quotations"
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
                {activeTab === 'activity-log' && (
                    currentUser?.role === 'super_admin' ? (
                        <ActivityLogManager
                            onNavigate={handleTabChange}
                            onUnauthorized={handleUnauthorized}
                        />
                    ) : (
                        <div className="max-w-xl mx-auto mt-16 px-4 font-poppins">
                            <div className="bg-white rounded-3xl border border-red-200/90 p-8 sm:p-10 text-center shadow-xl space-y-5">
                                <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
                                    <ShieldAlert size={32} />
                                </div>
                                <div className="space-y-2">
                                    <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full uppercase tracking-wider">
                                        403 Access Denied
                                    </span>
                                    <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
                                        Access Restricted
                                    </h2>
                                    <p className="text-sm text-neutral-600 max-w-md mx-auto">
                                        You do not have permission to view the Activity Log. This section is strictly restricted to Super Admin only.
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange('dashboard')}
                                        className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition cursor-pointer shadow-sm"
                                    >
                                        Back to Dashboard
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
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

                        {/* Direct link to Change Password from Logout Dialog */}
                        <div className="pt-2 text-center border-t border-neutral-100/60">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogoutModalOpen(false);
                                    openChangePasswordModal();
                                }}
                                className="text-xs text-neutral-500 hover:text-[#1A4D2E] font-semibold transition inline-flex items-center gap-1.5 cursor-pointer"
                            >
                                <KeyRound size={12} className="text-[#1A4D2E]" />
                                <span>Change your password instead?</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Password via Email Modal (In Logout / Account Section) */}
            {isChangePasswordModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-fade-in font-poppins"
                    onClick={() => {
                        setIsChangePasswordModalOpen(false);
                        setResetLinkSent(false);
                    }}
                >
                    <div 
                        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-neutral-100 space-y-4 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#1A4D2E] flex items-center justify-center border border-emerald-100">
                                    <KeyRound size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-neutral-900 leading-tight">
                                        Change Admin Password
                                    </h3>
                                    <p className="text-[11px] text-neutral-500 mt-0.5">
                                        Send secure reset link to your email address
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsChangePasswordModalOpen(false);
                                    setResetLinkSent(false);
                                }}
                                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {!resetLinkSent ? (
                            <form onSubmit={handleSendResetEmail} className="space-y-4 pt-1">
                                <div className="p-3.5 bg-emerald-50/80 border border-emerald-100 rounded-2xl text-xs text-emerald-900 leading-relaxed">
                                    For security, password changes require email verification. We will send a secure one-time password reset link to your email.
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-neutral-700 block">
                                        Destination Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                                            <Mail size={15} />
                                        </div>
                                        <input
                                            type="email"
                                            value={sendResetEmail}
                                            onChange={(e) => setSendResetEmail(e.target.value)}
                                            placeholder="Enter your email..."
                                            required
                                            className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm font-medium text-neutral-800 outline-none focus:border-[#1A4D2E] transition"
                                        />
                                    </div>
                                    <p className="text-[10px] text-neutral-400">
                                        The reset link is active for 60 minutes after generation.
                                    </p>
                                </div>

                                <div className="pt-2 border-t border-neutral-100 flex items-center justify-end gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setIsChangePasswordModalOpen(false)}
                                        disabled={isSendingReset}
                                        className="px-4 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-700 cursor-pointer disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSendingReset}
                                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1A4D2E] hover:bg-[#143c24] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                                    >
                                        {isSendingReset ? (
                                            <>
                                                <RefreshCw size={13} className="animate-spin" />
                                                <span>Sending Link...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send size={13} />
                                                <span>Send Reset Link</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4 py-2 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#1A4D2E] flex items-center justify-center mx-auto border border-emerald-100 animate-bounce">
                                    <CheckCircle2 size={28} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-neutral-900">
                                        Reset Link Sent!
                                    </h4>
                                    <p className="text-xs text-neutral-600 max-w-xs mx-auto leading-relaxed">
                                        We sent an email with a secure password reset button to <strong className="text-neutral-900">{sentMaskedEmail}</strong>.
                                    </p>
                                </div>
                                <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80 text-[11px] text-neutral-500 text-left">
                                    👉 Click the <strong>"Reset Your Password"</strong> button in the email to open the reset page and choose your new password.
                                </div>
                                <div className="pt-2 border-t border-neutral-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsChangePasswordModalOpen(false);
                                            setResetLinkSent(false);
                                        }}
                                        className="w-full py-2.5 rounded-xl bg-[#1A4D2E] hover:bg-[#143c24] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
