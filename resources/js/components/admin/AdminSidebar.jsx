import React from 'react';
import {
    LayoutDashboard,
    FolderGit2,
    HelpCircle,
    FileText,
    FileSignature,
    History,
    CreditCard,
    ScrollText,
    Mail,
    BarChart3,
    CheckCircle2,
    Activity,
    PanelLeftClose,
    PanelLeftOpen,
    Sparkles,
    X,
    LogOut,
    User,
    Globe,
    ChevronRight
} from 'lucide-react';
import { assets } from '../../assets/assets';

export const ADMIN_NAV_SECTIONS = [
    {
        title: 'Main',
        items: [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        ],
    },
    {
        title: 'APPLICATION MANAGEMENT',
        items: [
            { id: 'inquiries', label: 'Enquiry', icon: Mail },
            { id: 'quotation', label: 'Quotation Builder', icon: FileText },
            { id: 'quotation-history', label: 'Quotation History', icon: History },
            { id: 'approved-quotations', label: 'Approved Quotations', icon: CheckCircle2 },
            { id: 'agreement', label: 'Agreement', icon: FileSignature },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'application-tracking', label: 'Application Tracking', icon: Activity },
        ],
    },
    {
        title: 'PROJECT MANAGEMENT',
        items: [
            { id: 'projects', label: 'Projects & Gallery', icon: FolderGit2 },
        ],
    },
    {
        title: 'CONTENT MANAGEMENT',
        items: [
            { id: 'faqs', label: 'Website FAQs', icon: HelpCircle },
            { id: 'letterhead', label: 'Letterhead', icon: ScrollText },
        ],
    },
    {
        title: 'REPORTS',
        items: [
            { id: 'reports', label: 'Reports', icon: BarChart3 },
        ],
    },
];

// Flat list preserving the exact requested order
export const ADMIN_NAV_ITEMS = ADMIN_NAV_SECTIONS.flatMap((section) => section.items);

export const AdminSidebar = ({
    activeTab,
    onTabChange,
    pendingInquiriesCount = 0,
    isCollapsed,
    setIsCollapsed,
    isMobileOpen,
    setIsMobileOpen,
    onLogout
}) => {
    const handleItemClick = (id) => {
        onTabChange(id);
        if (isMobileOpen) {
            setIsMobileOpen(false);
        }
    };

    // Reusable sidebar navigation list with Section Headers
    const renderNavList = (isRail) => (
        <nav
            className={`flex-1 py-2 px-2 overflow-y-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
                isRail ? 'flex flex-col items-center space-y-1' : 'space-y-1'
            }`}
        >
            {ADMIN_NAV_SECTIONS.map((section, sIdx) => (
                <div key={section.title || sIdx} className="w-full">
                    {/* Section Header */}
                    {isRail ? (
                        sIdx > 0 && <div className="w-8 h-[1px] bg-neutral-200 my-2 mx-auto" />
                    ) : (
                        <div className={`px-3 pb-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider ${
                            sIdx === 0 ? 'pt-1' : 'pt-3.5'
                        }`}>
                            {section.title}
                        </div>
                    )}

                    {/* Section Items */}
                    <div className={isRail ? 'space-y-1 w-full flex flex-col items-center' : 'space-y-0.5'}>
                        {section.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            const badge = item.id === 'inquiries' && pendingInquiriesCount > 0 ? pendingInquiriesCount : null;

                            if (isRail) {
                                // Collapsed Rail Mode: Compact centered icon button with floating tooltip
                                return (
                                    <div key={item.id} className="relative group/rail flex items-center justify-center w-full my-0.5">
                                        <button
                                            type="button"
                                            onClick={() => handleItemClick(item.id)}
                                            aria-label={item.label}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative shrink-0 ${
                                                isActive
                                                    ? 'bg-[#1A4D2E] text-white shadow-xs font-semibold'
                                                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 font-medium'
                                            }`}
                                        >
                                            <Icon size={18} className="shrink-0" />

                                            {/* Badge Indicator on Rail icon */}
                                            {badge != null && (
                                                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-500 text-white leading-none shadow-xs">
                                                    {badge}
                                                </span>
                                            )}
                                        </button>

                                        {/* Floating Tooltip in Rail Mode */}
                                        <div className="absolute left-full ml-3 px-3 py-1.5 bg-neutral-900/95 backdrop-blur-xs text-white text-xs font-semibold rounded-xl whitespace-nowrap shadow-xl opacity-0 translate-x-1 group-hover/rail:opacity-100 group-hover/rail:translate-x-0 pointer-events-none transition-all duration-150 z-50 flex items-center gap-2 border border-neutral-700/50">
                                            <span>{item.label}</span>
                                            {badge != null && (
                                                <span className="bg-amber-400 text-neutral-950 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                                                    {badge}
                                                </span>
                                            )}
                                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-neutral-900/95" />
                                        </div>
                                    </div>
                                );
                            }

                            // Expanded Mode: Full icon + text label + badge
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleItemClick(item.id)}
                                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-[13px] transition-all cursor-pointer group ${
                                        isActive
                                            ? 'bg-[#1A4D2E] text-white shadow-xs font-semibold'
                                            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/90 font-medium'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Icon
                                            size={17}
                                            className={`shrink-0 transition-colors ${
                                                isActive ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-900'
                                            }`}
                                        />
                                        <span className="truncate">{item.label}</span>
                                    </div>

                                    {badge != null && (
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold leading-none shrink-0 ${
                                                isActive
                                                    ? 'bg-amber-400 text-neutral-950 font-mono shadow-xs'
                                                    : 'bg-amber-500 text-white font-mono'
                                            }`}
                                        >
                                            {badge}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </nav>
    );

    return (
        <>
            {/* ============================================================== */}
            {/* DESKTOP SIDEBAR: FIXED AS A VERTICAL RAIL OR EXPANDED SIDEBAR */}
            {/* ============================================================== */}
            <aside
                className={`hidden md:flex flex-col shrink-0 bg-white border-r border-neutral-200/90 h-full transition-[width] duration-300 ease-in-out z-30 select-none ${
                    isCollapsed ? 'w-[72px]' : 'w-64'
                }`}
            >
                {/* 1. Header: Logo Branding & Rail Toggle */}
                <div
                    className={`h-[60px] border-b border-neutral-100 flex items-center px-3 shrink-0 ${
                        isCollapsed ? 'justify-center' : 'justify-between'
                    }`}
                >
                    {isCollapsed ? (
                        // Collapsed Rail Header: Compact Logo
                        <button
                            type="button"
                            onClick={() => setIsCollapsed(false)}
                            title="Expand sidebar"
                            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-neutral-100 transition-colors cursor-pointer group relative"
                        >
                            <img
                                src={assets.logo}
                                alt="Solar Edge Logo"
                                className="w-7 h-7 object-contain transition-transform group-hover:scale-105"
                            />
                            <div className="absolute left-full ml-3 px-2.5 py-1 bg-neutral-900 text-white text-[11px] font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                                Expand sidebar
                            </div>
                        </button>
                    ) : (
                        // Expanded Header: Full Logo + Brand Name + Collapse Button
                        <>
                            <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                    src={assets.logo}
                                    alt="Solar Edge Logo"
                                    className="h-8 w-8 object-contain shrink-0"
                                />
                                <div className="min-w-0">
                                    <span className="text-[13px] font-bold text-neutral-900 block leading-tight truncate">
                                        Solar Edge
                                    </span>
                                    <span className="text-[10.5px] text-emerald-700 font-medium tracking-wider uppercase flex items-center gap-1">
                                        <Sparkles size={10} />
                                        Admin Panel
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsCollapsed(true)}
                                title="Collapse to rail"
                                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer shrink-0"
                            >
                                <PanelLeftClose size={18} />
                            </button>
                        </>
                    )}
                </div>

                {/* 2. Navigation Menu List */}
                {renderNavList(isCollapsed)}

                {/* 3. Bottom Footer in Sidebar */}
                <div className="p-2 border-t border-neutral-100 shrink-0">
                    {isCollapsed ? (
                        // Collapsed Rail Bottom: Single Expand Icon Button
                        <div className="flex flex-col items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => setIsCollapsed(false)}
                                title="Expand sidebar"
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer group relative"
                            >
                                <PanelLeftOpen size={18} />
                                <div className="absolute left-full ml-3 px-2.5 py-1 bg-neutral-900 text-white text-[11px] font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                                    Expand sidebar
                                </div>
                            </button>
                        </div>
                    ) : (
                        // Expanded Bottom: Collapse button & Admin status
                        <div className="space-y-1">
                            <button
                                type="button"
                                onClick={() => setIsCollapsed(true)}
                                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    <PanelLeftClose size={15} />
                                    <span>Collapse to rail</span>
                                </div>
                                <span className="text-[10px] text-neutral-400 font-mono">⌘B</span>
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* ============================================================== */}
            {/* MOBILE DRAWER: SLIDE-OVER SIDEBAR FOR SMALL SCREENS (< md)    */}
            {/* ============================================================== */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
                    {/* Backdrop */}
                    <div
                        onClick={() => setIsMobileOpen(false)}
                        className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity"
                    />

                    {/* Mobile Drawer Panel */}
                    <div className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl z-10 animate-slide-right">
                        {/* Drawer Header */}
                        <div className="h-[60px] px-4 border-b border-neutral-100 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2.5">
                                <img
                                    src={assets.logo}
                                    alt="Solar Edge Logo"
                                    className="h-8 w-8 object-contain"
                                />
                                <div>
                                    <span className="text-sm font-bold text-neutral-900 block leading-tight">
                                        Solar Edge Innovations
                                    </span>
                                    <span className="text-[11px] text-emerald-700 font-medium uppercase tracking-wider flex items-center gap-1">
                                        <Sparkles size={10} />
                                        Admin Panel
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsMobileOpen(false)}
                                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Drawer Nav List (Expanded style) */}
                        {renderNavList(false)}

                        {/* Drawer Footer Actions */}
                        <div className="p-3 border-t border-neutral-100 space-y-2 shrink-0 bg-neutral-50/60">
                            <a
                                href="/projects"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-neutral-700 hover:text-[#1A4D2E] bg-white border border-neutral-200 rounded-xl"
                            >
                                <Globe size={15} />
                                <span>View Website</span>
                            </a>

                            <button
                                type="button"
                                onClick={() => {
                                    setIsMobileOpen(false);
                                    onLogout();
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 bg-white border border-red-200/80 rounded-xl cursor-pointer"
                            >
                                <LogOut size={15} />
                                <span>Log out</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

