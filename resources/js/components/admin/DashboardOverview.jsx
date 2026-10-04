import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
    FolderGit2, 
    Image as ImageIcon, 
    HelpCircle, 
    PlusCircle, 
    ArrowUpRight, 
    FileText, 
    ScrollText,
    History,
    CreditCard,
    RefreshCw,
    Sparkles,
    Mail,
    Clock,
    CheckCircle2,
    MessageSquare,
    ExternalLink,
    BarChart3
} from 'lucide-react';

export const DashboardOverview = ({ onNavigate, onUnauthorized }) => {
    const [stats, setStats] = useState(null);
    const [recentProjects, setRecentProjects] = useState([]);
    const [recentInquiries, setRecentInquiries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadStats = async (isManual = false) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin-stats.php', {
                credentials: 'include'
            });

            if (res.status === 401) {
                if (onUnauthorized) {
                    onUnauthorized();
                    return;
                }
                return;
            }

            const data = await res.json();
            if (res.ok && data.success) {
                setStats(data.stats);
                setRecentProjects(data.recent_projects || []);
                setRecentInquiries(data.recent_inquiries || []);
                if (isManual) {
                    toast.success('Dashboard metrics refreshed!');
                }
            } else {
                if (isManual) toast.error('Failed to refresh stats.');
            }
        } catch {
            if (isManual) toast.error('Connection error.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    const kpis = [
        {
            title: 'Contact Inquiries',
            value: stats ? stats.total_inquiries : '-',
            subtitle: stats?.pending_inquiries > 0
                ? `${stats.pending_inquiries} awaiting response`
                : 'All answered',
            icon: Mail,
            color: 'from-amber-500 to-orange-600',
            badge: stats?.pending_inquiries > 0 ? `${stats.pending_inquiries} pending` : null,
            action: () => onNavigate('inquiries'),
            actionLabel: 'View Inquiries'
        },
        {
            title: 'Total Projects',
            value: stats ? stats.total_projects : '-',
            subtitle: `${stats ? stats.active_projects : 0} published online`,
            icon: FolderGit2,
            color: 'from-emerald-500 to-green-700',
            action: () => onNavigate('projects'),
            actionLabel: 'Manage Projects'
        },
        {
            title: 'Gallery Images',
            value: stats ? stats.total_images : '-',
            subtitle: 'Stored in /uploads/projects/',
            icon: ImageIcon,
            color: 'from-teal-500 to-emerald-700',
            action: () => onNavigate('projects'),
            actionLabel: 'Upload Images'
        },
        {
            title: 'Website FAQs',
            value: stats ? stats.total_faqs : '-',
            subtitle: `${stats ? stats.active_faqs : 0} active in Contact section`,
            icon: HelpCircle,
            color: 'from-blue-500 to-indigo-700',
            action: () => onNavigate('faqs'),
            actionLabel: 'Manage FAQs'
        },
        {
            title: 'Quotation History',
            value: stats?.total_quotations !== undefined ? stats.total_quotations : '0',
            subtitle: `${stats?.total_quotations ?? 0} saved client quotations`,
            icon: History,
            color: 'from-purple-500 to-indigo-700',
            action: () => onNavigate('quotation-history'),
            actionLabel: 'View History'
        },
        {
            title: 'Official Letterhead',
            value: 'Ready',
            subtitle: 'Live Letterhead & Print',
            icon: ScrollText,
            color: 'from-emerald-600 to-teal-700',
            action: () => onNavigate('letterhead'),
            actionLabel: 'Open Letterhead'
        },
    ];

    return (
        <div className="w-full px-4 sm:px-8 py-8 space-y-8 font-sans">
            {/* Header Greeting */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0C2417] via-[#1A4D2E] to-[#0E351F] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold backdrop-blur-md mb-2">
                        <Sparkles size={12} />
                        Solar Edge Innovations Admin
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                        Welcome to Solar Edge Control Panel
                    </h1>
                    <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl">
                        Manage website inquiries, customer leads, live projects, photo gallery, FAQs, and quotations.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <button
                        onClick={() => loadStats(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 text-xs sm:text-sm font-semibold border border-neutral-200 shadow-2xs transition-all cursor-pointer"
                        title="Refresh live data"
                    >
                        <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={() => onNavigate('inquiries')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
                    >
                        <Mail size={14} />
                        <span>View Inquiries</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {kpis.map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                        <div
                            key={idx}
                            className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                                            {kpi.title}
                                        </span>
                                    </div>
                                    <div className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight font-mono">
                                        {isLoading ? '...' : kpi.value}
                                    </div>
                                    <p className="text-[11px] text-neutral-400 font-medium">
                                        {kpi.subtitle}
                                    </p>
                                </div>
                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${kpi.color} text-white flex items-center justify-center shadow-xs shrink-0`}>
                                    <Icon size={20} />
                                </div>
                            </div>

                            <button
                                onClick={kpi.action}
                                className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-neutral-600 group-hover:text-[#1A4D2E] transition-colors cursor-pointer"
                            >
                                <span>{kpi.actionLabel}</span>
                                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Grid: Inquiries & Projects & Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Inquiries Section (2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Contact Inquiries */}
                    <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base font-black text-neutral-900">Recent Contact Inquiries</h2>
                                        {stats?.pending_inquiries > 0 && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                                {stats.pending_inquiries} pending
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-neutral-500">Messages submitted through website contact form</p>
                                </div>
                            </div>
                            <button
                                onClick={() => onNavigate('inquiries')}
                                className="text-xs font-bold text-[#1A4D2E] hover:underline cursor-pointer"
                            >
                                All Inquiries →
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="py-8 text-center text-xs text-neutral-400">Loading inquiries...</div>
                        ) : recentInquiries.length === 0 ? (
                            <div className="py-8 text-center space-y-2">
                                <Mail className="w-8 h-8 text-neutral-300 mx-auto" />
                                <p className="text-xs text-neutral-500 font-medium">No contact inquiries yet.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-neutral-100">
                                {recentInquiries.map((inquiry) => (
                                    <div
                                        key={inquiry.id}
                                        onClick={() => onNavigate('inquiries')}
                                        className="py-3 flex items-center justify-between gap-3 hover:bg-neutral-50 rounded-xl px-2 transition-colors cursor-pointer group"
                                    >
                                        <div className="min-w-0 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-neutral-900 group-hover:text-[#1A4D2E]">
                                                    {inquiry.name}
                                                </span>
                                                {inquiry.is_responded ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                        <CheckCircle2 size={10} /> Responded
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                                        <Clock size={10} /> Pending
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[11px] text-neutral-500 truncate max-w-md">
                                                <span className="font-semibold text-neutral-700">{inquiry.service}</span> • {inquiry.place}, {inquiry.district}
                                            </div>
                                            <div className="text-[10px] text-neutral-400">
                                                {inquiry.created_at_human}
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onNavigate('inquiries');
                                            }}
                                            className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-700 transition-all shrink-0 cursor-pointer"
                                        >
                                            View
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Projects List */}
                    <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                            <div>
                                <h2 className="text-base font-black text-neutral-900">Recent Projects in Showcase</h2>
                                <p className="text-xs text-neutral-500">Live projects published on the website</p>
                            </div>
                            <button
                                onClick={() => onNavigate('projects')}
                                className="text-xs font-bold text-[#1A4D2E] hover:underline cursor-pointer"
                            >
                                View All Projects →
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="py-8 text-center text-xs text-neutral-400">Loading projects...</div>
                        ) : recentProjects.length === 0 ? (
                            <div className="py-8 text-center space-y-3">
                                <FolderGit2 className="w-8 h-8 text-neutral-300 mx-auto" />
                                <p className="text-xs text-neutral-500 font-medium">No projects added yet.</p>
                                <button
                                    onClick={() => onNavigate('projects')}
                                    className="px-5 py-2 bg-[#1A4D2E] hover:bg-[#143c24] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                                >
                                    Add Your First Project
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-neutral-100">
                                {recentProjects.map((proj) => (
                                    <div key={proj.id} className="py-3 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200">
                                                {proj.cover_image ? (
                                                    <img src={proj.cover_image} alt={proj.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                                        <ImageIcon size={16} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-xs font-bold text-neutral-900 truncate">
                                                    {proj.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 font-medium">
                                                        {proj.category || 'Solar'}
                                                    </span>
                                                    <span className={`text-[10px] font-semibold ${proj.is_active ? 'text-emerald-600' : 'text-neutral-400'}`}>
                                                        {proj.is_active ? '● Live' : '○ Draft'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => onNavigate('projects')}
                                            className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-700 transition-all shrink-0 cursor-pointer"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* System & Quick Nav Panel (1 col) */}
                <div className="space-y-6">
                    {/* Quick Access Tiles */}
                    <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
                        <h2 className="text-base font-black text-neutral-900">Admin Modules</h2>
                        <div className="space-y-2">
                            <button
                                onClick={() => onNavigate('inquiries')}
                                className="w-full p-3 rounded-2xl border border-neutral-200/80 hover:border-amber-400 hover:bg-amber-50/40 text-left transition-all flex items-center justify-between cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                                        <Mail size={17} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-neutral-900 group-hover:text-amber-800 flex items-center gap-1.5">
                                            <span>Contact Inquiries</span>
                                            {stats?.pending_inquiries > 0 && (
                                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                            )}
                                        </div>
                                        <div className="text-[10px] text-neutral-400">
                                            {stats?.pending_inquiries > 0
                                                ? `${stats.pending_inquiries} waiting for reply`
                                                : 'View customer messages'}
                                        </div>
                                    </div>
                                </div>
                                <ArrowUpRight size={14} className="text-neutral-400 group-hover:text-amber-800" />
                            </button>

                            <button
                                onClick={() => onNavigate('projects')}
                                className="w-full p-3 rounded-2xl border border-neutral-200/80 hover:border-[#1A4D2E] hover:bg-emerald-50/40 text-left transition-all flex items-center justify-between cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#1A4D2E] flex items-center justify-center">
                                        <ImageIcon size={17} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-neutral-900 group-hover:text-[#1A4D2E]">
                                            Projects & Gallery
                                        </div>
                                        <div className="text-[10px] text-neutral-400">Add photos & descriptions</div>
                                    </div>
                                </div>
                                <ArrowUpRight size={14} className="text-neutral-400 group-hover:text-[#1A4D2E]" />
                            </button>

                            <button
                                onClick={() => onNavigate('faqs')}
                                className="w-full p-3 rounded-2xl border border-neutral-200/80 hover:border-[#1A4D2E] hover:bg-emerald-50/40 text-left transition-all flex items-center justify-between cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                                        <HelpCircle size={17} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-neutral-900 group-hover:text-blue-700">
                                            FAQ Manager
                                        </div>
                                        <div className="text-[10px] text-neutral-400">Questions on Contact page</div>
                                    </div>
                                </div>
                                <ArrowUpRight size={14} className="text-neutral-400 group-hover:text-blue-700" />
                            </button>

                            <button
                                onClick={() => onNavigate('quotation')}
                                className="w-full p-3 rounded-2xl border border-neutral-200/80 hover:border-[#1A4D2E] hover:bg-emerald-50/40 text-left transition-all flex items-center justify-between cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                                        <FileText size={17} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-neutral-900 group-hover:text-purple-700">
                                            Quotation Builder
                                        </div>
                                        <div className="text-[10px] text-neutral-400">Create 6-page solar quotes</div>
                                    </div>
                                </div>
                                <ArrowUpRight size={14} className="text-neutral-400 group-hover:text-purple-700" />
                            </button>

                            <button
                                onClick={() => onNavigate('quotation-history')}
                                className="w-full p-3 rounded-2xl border border-neutral-200/80 hover:border-indigo-600 hover:bg-indigo-50/40 text-left transition-all flex items-center justify-between cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                                        <History size={17} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-neutral-900 group-hover:text-indigo-700">
                                            Quotation History
                                        </div>
                                        <div className="text-[10px] text-neutral-400">Saved quotes & PDF downloads</div>
                                    </div>
                                </div>
                                <ArrowUpRight size={14} className="text-neutral-400 group-hover:text-indigo-700" />
                            </button>

                            <button
                                onClick={() => onNavigate('payments')}
                                className="w-full p-3 rounded-2xl border border-neutral-200/80 hover:border-emerald-600 hover:bg-emerald-50/40 text-left transition-all flex items-center justify-between cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                                        <CreditCard size={17} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-neutral-900 group-hover:text-emerald-800">
                                            Payments Tracker
                                        </div>
                                        <div className="text-[10px] text-neutral-400">Track client payments & balance</div>
                                    </div>
                                </div>
                                <ArrowUpRight size={14} className="text-neutral-400 group-hover:text-emerald-800" />
                            </button>

                            <button
                                onClick={() => onNavigate('reports')}
                                className="w-full p-3 rounded-2xl border border-neutral-200/80 hover:border-teal-700 hover:bg-teal-50/40 text-left transition-all flex items-center justify-between cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                                        <BarChart3 size={17} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-neutral-900 group-hover:text-teal-800">
                                            Reports & Exports
                                        </div>
                                        <div className="text-[10px] text-neutral-400">Export Excel & PDF reports</div>
                                    </div>
                                </div>
                                <ArrowUpRight size={14} className="text-neutral-400 group-hover:text-teal-800" />
                            </button>

                            <button
                                onClick={() => onNavigate('letterhead')}
                                className="w-full p-3 rounded-2xl border border-neutral-200/80 hover:border-[#1A4D2E] hover:bg-emerald-50/40 text-left transition-all flex items-center justify-between cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#1A4D2E] flex items-center justify-center">
                                        <ScrollText size={17} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-neutral-900 group-hover:text-[#1A4D2E]">
                                            Letterhead Creator
                                        </div>
                                        <div className="text-[10px] text-neutral-400">Official letterhead & print</div>
                                    </div>
                                </div>
                                <ArrowUpRight size={14} className="text-neutral-400 group-hover:text-[#1A4D2E]" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
