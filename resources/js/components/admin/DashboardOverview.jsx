import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { 
    Users, 
    FileText, 
    Zap, 
    Sun,
    Trophy, 
    TrendingUp, 
    TrendingDown,
    Lightbulb, 
    ArrowUpRight, 
    ArrowUpDown,
    RefreshCw, 
    Mail, 
    Clock, 
    CheckCircle2, 
    FolderGit2, 
    Image as ImageIcon,
    History,
    Calendar,
    Phone,
    MapPin,
    Sparkles,
    ChevronRight,
    PieChart,
    BarChart3,
    ExternalLink,
    HelpCircle,
    Activity,
    Check,
    X,
    User
} from 'lucide-react';

export const DashboardOverview = ({ onNavigate, onUnauthorized }) => {
    const [stats, setStats] = useState(null);
    const [recentProjects, setRecentProjects] = useState([]);
    const [recentInquiries, setRecentInquiries] = useState([]);
    const [recentQuotations, setRecentQuotations] = useState([]);
    const [recentApplications, setRecentApplications] = useState([]);
    const [totalApplicationsCount, setTotalApplicationsCount] = useState(0);
    const [isLoadingApplications, setIsLoadingApplications] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    // Interactive chart states
    const [activeQuotationTab, setActiveQuotationTab] = useState('distribution'); // 'distribution' | 'monthly'
    const [hoveredMonthIdx, setHoveredMonthIdx] = useState(null);
    const [hoveredQuotationMonthIdx, setHoveredQuotationMonthIdx] = useState(null);
    const [hoveredDonutIdx, setHoveredDonutIdx] = useState(null);
    
    // Overview table active tab: 'applications' (default) | 'inquiries' | 'quotations'
    const [tableTab, setTableTab] = useState('applications');

    const loadApplications = async () => {
        setIsLoadingApplications(true);
        try {
            const res = await fetch('/api/admin-quotations-tracking.php?limit=5', {
                credentials: 'include'
            });
            if (res.status === 401 && onUnauthorized) {
                onUnauthorized();
                return;
            }
            const data = await res.json();
            if (res.ok && data.success) {
                setRecentApplications(data.data || []);
                setTotalApplicationsCount(data.total || (data.data ? data.data.length : 0));
            }
        } catch {
            // silent failover
        } finally {
            setIsLoadingApplications(false);
        }
    };

    const loadStats = async (isManual = false) => {
        setIsLoading(true);
        try {
            loadApplications();
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
                setRecentQuotations(data.recent_quotations || []);
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
        loadApplications();
    }, []);

    // 1. Monthly inquiries data from server (Real data only)
    const monthlyInquiries = useMemo(() => {
        if (stats?.monthly_inquiries && stats.monthly_inquiries.length > 0) {
            return stats.monthly_inquiries;
        }
        return [];
    }, [stats]);

    // 2. Monthly quotations data from server (Real data only)
    const monthlyQuotations = useMemo(() => {
        if (stats?.monthly_quotations && stats.monthly_quotations.length > 0) {
            return stats.monthly_quotations;
        }
        return [];
    }, [stats]);

    // 3. Quotation category breakdown (Donut data - Real categories from database)
    const quotationDistribution = useMemo(() => {
        if (stats?.quotation_distribution && stats.quotation_distribution.length > 0) {
            return stats.quotation_distribution;
        }
        return [
            { name: 'Solar Quotations', share: 100, color: '#1A4D2E', count: stats?.total_quotations || 0 },
        ];
    }, [stats]);

    // Calculate peaks for chart scaling based strictly on real data
    const maxInquiry = useMemo(() => {
        const counts = monthlyInquiries.map(m => m.count || 0);
        const max = Math.max(...counts, 0);
        return max > 0 ? max : 1;
    }, [monthlyInquiries]);

    const peakInquiryMonth = useMemo(() => {
        if (monthlyInquiries.length === 0) return { label: 'Recent', count: 0 };
        let maxItem = monthlyInquiries[0];
        monthlyInquiries.forEach(m => {
            if ((m.count || 0) > (maxItem.count || 0)) {
                maxItem = m;
            }
        });
        return maxItem;
    }, [monthlyInquiries]);

    const maxQuotation = useMemo(() => {
        const counts = monthlyQuotations.map(m => m.count || 0);
        const max = Math.max(...counts, 0);
        return max > 0 ? max : 1;
    }, [monthlyQuotations]);

    const peakQuotationMonth = useMemo(() => {
        if (monthlyQuotations.length === 0) return { label: 'Recent', count: 0, total_amount: 0 };
        let maxItem = monthlyQuotations[0];
        monthlyQuotations.forEach(m => {
            if ((m.count || 0) > (maxItem.count || 0)) {
                maxItem = m;
            }
        });
        return maxItem;
    }, [monthlyQuotations]);

    // Format currency in INR
    const formatINR = (val) => {
        const num = parseFloat(val) || 0;
        if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
        if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
        return `₹${num.toLocaleString('en-IN')}`;
    };

    // KPI Cards data (3 cards: Enquiries, Quotations, FAQs)
    const kpiCards = [
        {
            title: 'Total Enquiries',
            value: stats ? stats.total_inquiries : '0',
            badgeText: stats?.pending_inquiries > 0 ? `${stats.pending_inquiries} Pending` : 'All Addressed',
            badgeType: stats?.pending_inquiries > 0 ? 'warning' : 'positive',
            subtitle: 'Customer consultation submissions',
            icon: Users,
            onClick: () => onNavigate('inquiries'),
        },
        {
            title: 'Quotations Sent',
            value: stats ? stats.total_quotations : '0',
            badgeText: stats?.total_quotations > 0 ? `${stats.total_quotations} Active` : 'None Yet',
            badgeType: 'positive',
            subtitle: 'Saved client proposals',
            icon: FileText,
            onClick: () => onNavigate('quotation-history'),
        },
        {
            title: 'Website FAQs',
            value: stats ? stats.total_faqs : '0',
            badgeText: stats?.active_faqs > 0 ? `${stats.active_faqs} Published` : 'Help Center',
            badgeType: 'positive',
            subtitle: 'Customer self-help Q&As',
            icon: HelpCircle,
            onClick: () => onNavigate('faqs'),
        },
    ];

    // SVG Donut calculation
    const donutRadius = 64;
    const donutCircumference = 2 * Math.PI * donutRadius; // ~ 402.12

    const donutSegments = useMemo(() => {
        let accumulatedOffset = 0;
        return quotationDistribution.map((item) => {
            const strokeDash = (item.share / 100) * donutCircumference;
            const dashOffset = -accumulatedOffset;
            accumulatedOffset += strokeDash;
            return {
                ...item,
                strokeDash,
                dashOffset,
            };
        });
    }, [quotationDistribution, donutCircumference]);

    return (
        <div className="w-full px-4 sm:px-8 py-8 space-y-8 font-poppins bg-[#F8FAFC]">
            
            {/* Top Bar / Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">
                        Dashboard Overview
                    </h1>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                        Real-time tracking of inquiries, quotation generation, solar system composition, and customer leads.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-center">
                    <button
                        onClick={() => loadStats(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-medium border border-neutral-200/90 shadow-2xs transition-all cursor-pointer"
                        title="Refresh live data"
                    >
                        <RefreshCw size={13} className={isLoading ? 'animate-spin text-[#1A4D2E]' : 'text-neutral-500'} />
                        <span>Refresh</span>
                    </button>

                    <button
                        onClick={() => onNavigate('quotation')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A4D2E] hover:bg-[#143c24] text-white text-xs font-medium shadow-xs transition-all cursor-pointer"
                    >
                        <FileText size={14} />
                        <span>New Quotation</span>
                    </button>
                </div>
            </div>

            {/* 1. TOP KPI ROW (3 Cards: Enquiries, Quotations, FAQs) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {kpiCards.map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                        <div
                            key={idx}
                            onClick={kpi.onClick}
                            className="bg-white rounded-2xl p-5 sm:p-6 border border-neutral-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                        >
                            <div>
                                <div className="flex items-center gap-2 text-neutral-500 mb-3">
                                    <Icon size={16} className="text-neutral-500 group-hover:text-[#1A4D2E] transition-colors" />
                                    <span className="text-xs font-medium tracking-wide text-neutral-600">
                                        {kpi.title}
                                    </span>
                                </div>
                                
                                <div className="text-3xl sm:text-[32px] font-semibold text-neutral-900 tracking-tight leading-none mb-3">
                                    {isLoading ? '...' : kpi.value}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs pt-1">
                                <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-medium text-[11px] ${
                                    kpi.badgeType === 'positive' 
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                                        : kpi.badgeType === 'warning'
                                        ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                                        : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                                }`}>
                                    {kpi.badgeText}
                                </span>
                                <span className="text-neutral-400 text-[11px] truncate">
                                    {kpi.subtitle}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 2. CHARTS ROW (Side-by-side 2 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* CHART 1: Quotations Chart (Donut Composition & Monthly Trend) */}
                <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                    <div>
                        {/* Header with Switcher */}
                        <div className="flex items-center justify-between pb-5 border-b border-neutral-100">
                            <div>
                                <h2 className="text-sm sm:text-base font-semibold text-neutral-900 tracking-tight">
                                    {activeQuotationTab === 'distribution' ? 'Quotation Composition' : 'Monthly Quotations'}
                                </h2>
                                <p className="text-[11px] text-neutral-400">
                                    {activeQuotationTab === 'distribution'
                                        ? 'Breakdown of solar system categories & requests'
                                        : 'Total quotation value & count generated by month'}
                                </p>
                            </div>

                            <div className="inline-flex p-1 bg-neutral-100 rounded-xl text-xs font-medium">
                                <button
                                    onClick={() => setActiveQuotationTab('distribution')}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                                        activeQuotationTab === 'distribution'
                                            ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                                            : 'text-neutral-500 hover:text-neutral-800'
                                    }`}
                                >
                                    Composition
                                </button>
                                <button
                                    onClick={() => setActiveQuotationTab('monthly')}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${
                                        activeQuotationTab === 'monthly'
                                            ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                                            : 'text-neutral-500 hover:text-neutral-800'
                                    }`}
                                >
                                    Monthly
                                </button>
                            </div>
                        </div>

                        {/* Chart Body */}
                        {activeQuotationTab === 'distribution' ? (
                            /* Donut Chart View */
                            <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                                {/* SVG Donut */}
                                <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r={donutRadius}
                                            fill="transparent"
                                            stroke="#F1F5F9"
                                            strokeWidth="22"
                                        />

                                        {donutSegments.map((item, idx) => {
                                            const isHovered = hoveredDonutIdx === idx;
                                            return (
                                                <circle
                                                    key={idx}
                                                    cx="80"
                                                    cy="80"
                                                    r={donutRadius}
                                                    fill="transparent"
                                                    stroke={item.color}
                                                    strokeWidth={isHovered ? 26 : 22}
                                                    strokeDasharray={`${item.strokeDash} ${donutCircumference}`}
                                                    strokeDashoffset={item.dashOffset}
                                                    strokeLinecap="round"
                                                    onMouseEnter={() => setHoveredDonutIdx(idx)}
                                                    onMouseLeave={() => setHoveredDonutIdx(null)}
                                                    className="transition-all duration-300 cursor-pointer"
                                                />
                                            );
                                        })}
                                    </svg>

                                    {/* Donut Center Display */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                                        <span className="text-[10px] uppercase font-medium text-neutral-400 tracking-wider truncate max-w-[110px]">
                                            {hoveredDonutIdx !== null ? quotationDistribution[hoveredDonutIdx]?.name : 'Total Quotes'}
                                        </span>
                                        <span className="text-xl font-semibold text-neutral-900 leading-tight">
                                            {hoveredDonutIdx !== null 
                                                ? `${quotationDistribution[hoveredDonutIdx]?.share}%`
                                                : (stats?.total_quotations || 0)
                                            }
                                        </span>
                                        <span className="text-[10px] text-neutral-400 font-normal">
                                            {hoveredDonutIdx !== null ? `${quotationDistribution[hoveredDonutIdx]?.count} requests` : 'Active'}
                                        </span>
                                    </div>
                                </div>

                                {/* Legend Breakdown on Right */}
                                <div className="flex-1 w-full space-y-2.5">
                                    {quotationDistribution.map((item, idx) => {
                                        const isHovered = hoveredDonutIdx === idx;
                                        return (
                                            <div
                                                key={idx}
                                                onMouseEnter={() => setHoveredDonutIdx(idx)}
                                                onMouseLeave={() => setHoveredDonutIdx(null)}
                                                className={`flex items-center justify-between py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                                                    isHovered ? 'bg-neutral-50 shadow-2xs' : 'hover:bg-neutral-50/60'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <span
                                                        className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                                                        style={{ backgroundColor: item.color }}
                                                    />
                                                    <span className={`text-xs truncate ${isHovered ? 'font-semibold text-neutral-900' : 'text-neutral-600 font-normal'}`}>
                                                        {item.name}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-semibold text-neutral-800 ml-2 font-mono">
                                                    {item.share}%
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            /* Monthly Quotations Bar View */
                            <div className="py-6">
                                <div className="flex items-end justify-between gap-2 h-48 px-2 pt-8 pb-2">
                                    {monthlyQuotations.map((item, idx) => {
                                        const count = item.count || 0;
                                        const isZero = count === 0;
                                        const heightPercent = isZero ? 4 : Math.max(Math.round((count / maxQuotation) * 100), 12);
                                        const isHovered = hoveredQuotationMonthIdx === idx;
                                        const isPeak = count > 0 && count === maxQuotation;
                                        const isHighlighted = isHovered || (hoveredQuotationMonthIdx === null && isPeak);

                                        return (
                                            <div
                                                key={idx}
                                                onMouseEnter={() => setHoveredQuotationMonthIdx(idx)}
                                                onMouseLeave={() => setHoveredQuotationMonthIdx(null)}
                                                className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group relative min-w-0"
                                            >
                                                {/* Value pill tooltip on active/hovered bar */}
                                                {isHighlighted && count > 0 && (
                                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#1A4D2E] text-white text-[10px] font-medium px-2 py-0.5 rounded-md shadow-xs whitespace-nowrap z-10 transition-all">
                                                        {count} ({formatINR(item.total_amount)})
                                                    </div>
                                                )}

                                                {/* Bar */}
                                                <div
                                                    style={{ height: `${heightPercent}%` }}
                                                    className={`w-full max-w-[42px] rounded-t-lg sm:rounded-t-xl transition-all duration-300 ${
                                                        isHighlighted && count > 0
                                                            ? 'bg-[#1A4D2E] shadow-sm'
                                                            : isZero
                                                            ? 'bg-neutral-100 group-hover:bg-neutral-200'
                                                            : 'bg-emerald-100 group-hover:bg-emerald-200'
                                                    }`}
                                                />

                                                {/* Month label */}
                                                <span className={`text-[10px] sm:text-[11px] mt-2.5 transition-colors truncate max-w-full ${
                                                    isHighlighted ? 'text-neutral-900 font-semibold' : 'text-neutral-400 font-normal'
                                                }`}>
                                                    {item.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Insight Footer */}
                    <div className="pt-3 border-t border-neutral-100 flex items-center gap-2 text-xs text-neutral-500">
                        <Lightbulb size={14} className="text-amber-500 shrink-0" />
                        <span className="truncate">
                            {peakQuotationMonth.count > 0
                                ? `Peak quotation demand recorded in ${peakQuotationMonth.label} with ${peakQuotationMonth.count} client quotes (${formatINR(peakQuotationMonth.total_amount)}).`
                                : 'Track live customer quotation requests and solar system capacity breakdown.'}
                        </span>
                    </div>
                </div>

                {/* CHART 2: Monthly Enquiries Chart (Matches "Performance Analytics" bar chart from screenshot) */}
                <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs flex flex-col justify-between">
                    <div>
                        {/* Header */}
                        <div className="flex items-center justify-between pb-5 border-b border-neutral-100">
                            <div>
                                <h2 className="text-sm sm:text-base font-semibold text-neutral-900 tracking-tight">
                                    Enquiries Monthly-wise
                                </h2>
                                <p className="text-[11px] text-neutral-400">
                                    Customer consultation and contact form submissions
                                </p>
                            </div>

                            <button
                                onClick={() => onNavigate('inquiries')}
                                className="inline-flex items-center gap-1 text-xs font-medium text-[#1A4D2E] hover:underline cursor-pointer"
                            >
                                <span>Manage All</span>
                                <ChevronRight size={14} />
                            </button>
                        </div>

                        {/* Bar Chart Container */}
                        <div className="py-6">
                            <div className="flex items-end justify-between gap-2 h-48 px-2 pt-8 pb-2">
                                {monthlyInquiries.map((item, idx) => {
                                    const count = item.count || 0;
                                    const isZero = count === 0;
                                    const heightPercent = isZero ? 4 : Math.max(Math.round((count / maxInquiry) * 100), 14);
                                    const isHovered = hoveredMonthIdx === idx;
                                    const isPeak = count > 0 && count === maxInquiry;
                                    const isHighlighted = isHovered || (hoveredMonthIdx === null && isPeak);

                                    return (
                                        <div
                                            key={idx}
                                            onMouseEnter={() => setHoveredMonthIdx(idx)}
                                            onMouseLeave={() => setHoveredMonthIdx(null)}
                                            className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group relative min-w-0"
                                        >
                                            {/* Peak / Active value indicator above bar */}
                                            {isHighlighted && count > 0 && (
                                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#1A4D2E] text-white text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-xs whitespace-nowrap z-10 animate-in fade-in zoom-in duration-200">
                                                    {count}
                                                </div>
                                            )}

                                            {/* The Bar */}
                                            <div
                                                style={{ height: `${heightPercent}%` }}
                                                className={`w-full max-w-[44px] rounded-t-lg sm:rounded-t-xl transition-all duration-300 ${
                                                    isHighlighted && count > 0
                                                        ? 'bg-[#1A4D2E] shadow-sm'
                                                        : isZero
                                                        ? 'bg-neutral-100 group-hover:bg-neutral-200'
                                                        : 'bg-emerald-100 group-hover:bg-emerald-200'
                                                }`}
                                            />

                                            {/* Month X-axis Label */}
                                            <span className={`text-[10px] sm:text-[11px] mt-2.5 transition-colors truncate max-w-full ${
                                                isHighlighted ? 'text-neutral-900 font-semibold' : 'text-neutral-400 font-normal'
                                            }`}>
                                                {item.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Insight Footer */}
                    <div className="pt-3 border-t border-neutral-100 flex items-center gap-2 text-xs text-neutral-500">
                        <Lightbulb size={14} className="text-amber-500 shrink-0" />
                        <span className="truncate">
                            {peakInquiryMonth.count > 0 
                                ? `${peakInquiryMonth.label} achieved the highest customer inquiry volume with ${peakInquiryMonth.count} inquiries.`
                                : 'Live inquiry monitoring across all residential and commercial leads.'
                            }
                        </span>
                    </div>
                </div>

            </div>

            {/* 3. OVERVIEW TABLE SECTION */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
                {/* Table Header with Tabs and View All */}
                <div className="p-5 sm:p-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <h2 className="text-base sm:text-lg font-semibold text-neutral-900 tracking-tight flex items-center gap-2">
                            <Activity size={18} className="text-[#1A4D2E]" />
                            <span>Recent Overview</span>
                        </h2>

                        {/* Filter Tabs */}
                        <div className="inline-flex p-1 bg-neutral-100 rounded-xl text-xs font-medium flex-wrap gap-1">
                            <button
                                onClick={() => setTableTab('applications')}
                                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                                    tableTab === 'applications'
                                        ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                                        : 'text-neutral-500 hover:text-neutral-800'
                                }`}
                            >
                                <Activity size={12} className={tableTab === 'applications' ? 'text-[#1A4D2E]' : 'text-neutral-400'} />
                                <span>Application Tracking ({totalApplicationsCount || recentApplications.length})</span>
                            </button>
                            <button
                                onClick={() => setTableTab('inquiries')}
                                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                    tableTab === 'inquiries'
                                        ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                                        : 'text-neutral-500 hover:text-neutral-800'
                                }`}
                            >
                                Inquiries ({recentInquiries.length})
                            </button>
                            <button
                                onClick={() => setTableTab('quotations')}
                                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                    tableTab === 'quotations'
                                        ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                                        : 'text-neutral-500 hover:text-neutral-800'
                                }`}
                            >
                                Quotations ({recentQuotations.length})
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (tableTab === 'applications') onNavigate('application-tracking');
                            else if (tableTab === 'inquiries') onNavigate('inquiries');
                            else onNavigate('quotation-history');
                        }}
                        className="text-xs font-semibold text-[#1A4D2E] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto bg-emerald-50/70 hover:bg-emerald-100/70 px-3 py-1.5 rounded-xl border border-emerald-200/60 transition-all"
                    >
                        <span>
                            {tableTab === 'applications' ? 'View All Applications' : tableTab === 'inquiries' ? 'View All Inquiries' : 'View All Quotations'}
                        </span>
                        <ArrowUpRight size={14} />
                    </button>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                    {tableTab === 'applications' ? (
                        /* Application Tracking Table (Showing top 5) */
                        <div>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-neutral-100 text-[11px] font-bold text-neutral-400 uppercase tracking-wider bg-neutral-50/50">
                                        <th className="py-3.5 px-4 text-center w-12 font-mono">#</th>
                                        <th className="py-3.5 px-6">Applicant Name</th>
                                        <th className="py-3.5 px-4">Ref & Date</th>
                                        <th className="py-3.5 px-4">System Specs</th>
                                        <th className="py-3.5 px-4">Current Workflow Status</th>
                                        <th className="py-3.5 px-4">Financial Progress</th>
                                        <th className="py-3.5 px-6 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
                                    {isLoadingApplications ? (
                                        <tr>
                                            <td colSpan="7" className="py-12 text-center text-neutral-400 font-normal">
                                                <div className="flex items-center justify-center gap-2">
                                                    <RefreshCw size={15} className="animate-spin text-[#1A4D2E]" />
                                                    <span>Loading applications...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : recentApplications.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="py-12 text-center text-neutral-400 font-normal">
                                                No applications tracked yet. Create a quotation to begin tracking applicant journeys.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentApplications.slice(0, 5).map((app, idx) => (
                                            <tr
                                                key={app.id}
                                                onClick={() => onNavigate('application-tracking', { applicantId: app.id })}
                                                className="hover:bg-emerald-50/25 transition-colors cursor-pointer group"
                                            >
                                                {/* Serial */}
                                                <td className="py-4 px-4 text-center font-mono text-neutral-400 text-xs font-semibold">
                                                    {idx + 1}
                                                </td>

                                                {/* Applicant Name */}
                                                <td className="py-4 px-6 font-semibold text-neutral-900 group-hover:text-[#1A4D2E]">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#1A4D2E] font-semibold flex items-center justify-center text-xs shrink-0 border border-emerald-200/50">
                                                            {app.client_name ? app.client_name.charAt(0).toUpperCase() : 'A'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-neutral-900 group-hover:text-[#1A4D2E] flex items-center gap-1">
                                                                <span>{app.client_name}</span>
                                                            </div>
                                                            <div className="text-[11px] text-neutral-400 font-normal flex items-center gap-1">
                                                                <Phone size={11} className="text-neutral-400 shrink-0" />
                                                                <span>{app.client_phone}</span>
                                                                {app.client_address && app.client_address !== '-' && (
                                                                    <span className="truncate max-w-[150px]">· {app.client_address}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Ref & Date */}
                                                <td className="py-4 px-4">
                                                    <div className="font-mono text-xs font-bold text-neutral-900">
                                                        {app.ref_no}
                                                    </div>
                                                    <div className="text-[11px] text-neutral-400 font-normal flex items-center gap-1">
                                                        <Clock size={11} />
                                                        <span>{app.created_at_formatted}</span>
                                                    </div>
                                                </td>

                                                {/* System Specs */}
                                                <td className="py-4 px-4 text-neutral-600 font-normal">
                                                    <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 text-[11px] font-semibold">
                                                        {app.capacity || 'Solar RTS'}
                                                    </span>
                                                    {app.system_type && (
                                                        <div className="text-[10px] text-neutral-400 mt-0.5 font-medium">
                                                            {app.system_type}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Status Badge */}
                                                <td className="py-4 px-4">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                                        app.workflow_status === 'completed'
                                                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                            : app.workflow_status === 'agreement_created'
                                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                            : app.workflow_status === 'approved'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : app.workflow_status === 'rejected'
                                                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}>
                                                        {app.workflow_status === 'completed' && <CheckCircle2 size={11} />}
                                                        {app.workflow_status === 'agreement_created' && <FileText size={11} />}
                                                        {app.workflow_status === 'approved' && <Check size={11} />}
                                                        {app.workflow_status === 'rejected' && <X size={11} />}
                                                        {app.workflow_status === 'approval_pending' && <Clock size={11} />}
                                                        <span>{app.workflow_status_label}</span>
                                                    </span>
                                                </td>

                                                {/* Financial Progress */}
                                                <td className="py-4 px-4">
                                                    <div className="font-semibold text-neutral-900 text-xs">
                                                        ₹{String(app.total_amount).replace(/[^0-9.]/g, '') ? Number(String(app.total_amount).replace(/[^0-9.]/g, '')).toLocaleString('en-IN') : app.total_amount}
                                                    </div>
                                                    <div className="text-[10px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                                                        <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                                                            app.payment_status === 'paid'
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : app.payment_status === 'partial'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-neutral-100 text-neutral-600'
                                                        }`}>
                                                            {app.payment_status === 'paid' ? 'Paid' : app.payment_status === 'partial' ? 'Partial' : 'Pending'}
                                                        </span>
                                                        <span>Paid: ₹{Number(app.amount_paid || 0).toLocaleString('en-IN')}</span>
                                                    </div>
                                                </td>

                                                {/* Action */}
                                                <td className="py-4 px-6 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onNavigate('application-tracking', { applicantId: app.id });
                                                        }}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1A4D2E] hover:bg-[#143c24] text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                                                        title="Track applicant timeline journey"
                                                    >
                                                        <span>Track</span>
                                                        <ChevronRight size={12} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>

                            {/* Footer navigation button to Application Tracking */}
                            <div className="p-4 bg-neutral-50/80 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="text-xs text-neutral-500">
                                    Showing top <span className="font-bold text-neutral-800">{Math.min(recentApplications.length, 5)}</span> of{' '}
                                    <span className="font-bold text-neutral-800">{totalApplicationsCount || recentApplications.length}</span> applications
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onNavigate('application-tracking')}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#1A4D2E] hover:bg-[#143c24] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                                >
                                    <Activity size={14} />
                                    <span>View All in Application Tracking Page</span>
                                    <ArrowUpRight size={14} />
                                </button>
                            </div>
                        </div>
                    ) : tableTab === 'inquiries' ? (
                        /* Inquiries Table */
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-100 text-[11px] font-medium text-neutral-400 uppercase tracking-wider bg-neutral-50/50">
                                    <th className="py-3.5 px-6">
                                        <div className="flex items-center gap-1">
                                            <span>Customer Name</span>
                                            <ArrowUpDown size={11} className="text-neutral-300" />
                                        </div>
                                    </th>
                                    <th className="py-3.5 px-6">
                                        <div className="flex items-center gap-1">
                                            <span>Service / System</span>
                                            <ArrowUpDown size={11} className="text-neutral-300" />
                                        </div>
                                    </th>
                                    <th className="py-3.5 px-6">
                                        <div className="flex items-center gap-1">
                                            <span>Contact</span>
                                            <ArrowUpDown size={11} className="text-neutral-300" />
                                        </div>
                                    </th>
                                    <th className="py-3.5 px-6">
                                        <div className="flex items-center gap-1">
                                            <span>Location</span>
                                            <ArrowUpDown size={11} className="text-neutral-300" />
                                        </div>
                                    </th>
                                    <th className="py-3.5 px-6">
                                        <div className="flex items-center gap-1">
                                            <span>Date</span>
                                            <ArrowUpDown size={11} className="text-neutral-300" />
                                        </div>
                                    </th>
                                    <th className="py-3.5 px-6 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <span>Status</span>
                                            <ArrowUpDown size={11} className="text-neutral-300" />
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-neutral-400 font-normal">
                                            Loading inquiries...
                                        </td>
                                    </tr>
                                ) : recentInquiries.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-neutral-400 font-normal">
                                            No recent inquiries found.
                                        </td>
                                    </tr>
                                ) : (
                                    recentInquiries.map((inq) => {
                                        const isResponded = inq.status === 'responded';
                                        return (
                                            <tr
                                                key={inq.id}
                                                onClick={() => onNavigate('inquiries')}
                                                className="hover:bg-neutral-50/80 transition-colors cursor-pointer group"
                                            >
                                                {/* Customer Name */}
                                                <td className="py-4 px-6 font-semibold text-neutral-900 group-hover:text-[#1A4D2E]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#1A4D2E] font-semibold flex items-center justify-center text-xs shrink-0 border border-emerald-200/50">
                                                            {inq.name ? inq.name.charAt(0).toUpperCase() : 'U'}
                                                        </div>
                                                        <span className="truncate max-w-[160px] sm:max-w-xs">{inq.name}</span>
                                                    </div>
                                                </td>

                                                {/* Service */}
                                                <td className="py-4 px-6 text-neutral-600 font-normal">
                                                    <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-[11px] font-medium">
                                                        {inq.service || 'Solar Rooftop'}
                                                    </span>
                                                </td>

                                                {/* Contact */}
                                                <td className="py-4 px-6 font-mono text-[11px] text-neutral-500 font-normal">
                                                    {inq.phone || inq.email || '-'}
                                                </td>

                                                {/* Location */}
                                                <td className="py-4 px-6 text-neutral-500 font-normal">
                                                    {inq.place ? `${inq.place}, ${inq.district}` : (inq.district || 'Kerala')}
                                                </td>

                                                {/* Date */}
                                                <td className="py-4 px-6 text-neutral-400 text-[11px] font-normal">
                                                    {inq.created_at_human || 'Recent'}
                                                </td>

                                                {/* Status Pill */}
                                                <td className="py-4 px-6 text-right">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium ${
                                                        isResponded
                                                            ? 'bg-emerald-50 text-[#1A4D2E] border border-emerald-200/70'
                                                            : 'bg-amber-50 text-amber-800 border border-amber-200/70'
                                                    }`}>
                                                        {isResponded ? 'Responded' : 'Pending'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    ) : (
                        /* Quotations Table */
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-100 text-[11px] font-medium text-neutral-400 uppercase tracking-wider bg-neutral-50/50">
                                    <th className="py-3.5 px-6">
                                        <div className="flex items-center gap-1">
                                            <span>Client Name</span>
                                            <ArrowUpDown size={11} className="text-neutral-300" />
                                        </div>
                                    </th>
                                    <th className="py-3.5 px-6">
                                        <div className="flex items-center gap-1">
                                            <span>Quote Ref</span>
                                            <ArrowUpDown size={11} className="text-neutral-300" />
                                        </div>
                                    </th>
                                    <th className="py-3.5 px-6">
                                        <div className="flex items-center gap-1">
                                            <span>Capacity</span>
                                            <ArrowUpDown size={11} className="text-neutral-300" />
                                        </div>
                                    </th>
                                    <th className="py-3.5 px-6">
                                        <div className="flex items-center gap-1">
                                            <span>Total Amount</span>
                                            <ArrowUpDown size={11} className="text-neutral-300" />
                                        </div>
                                    </th>
                                    <th className="py-3.5 px-6">
                                        <div className="flex items-center gap-1">
                                            <span>Date</span>
                                            <ArrowUpDown size={11} className="text-neutral-300" />
                                        </div>
                                    </th>
                                    <th className="py-3.5 px-6 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <span>Status</span>
                                            <ArrowUpDown size={11} className="text-neutral-300" />
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-neutral-400 font-normal">
                                            Loading quotations...
                                        </td>
                                    </tr>
                                ) : recentQuotations.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-neutral-400 font-normal">
                                            No saved quotations yet.
                                        </td>
                                    </tr>
                                ) : (
                                    recentQuotations.map((qt) => (
                                        <tr
                                            key={qt.id}
                                            onClick={() => onNavigate('quotation-history')}
                                            className="hover:bg-neutral-50/80 transition-colors cursor-pointer group"
                                        >
                                            <td className="py-4 px-6 font-semibold text-neutral-900 group-hover:text-[#1A4D2E]">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#1A4D2E] font-semibold flex items-center justify-center text-xs shrink-0 border border-emerald-200/50">
                                                        {qt.client_name ? qt.client_name.charAt(0).toUpperCase() : 'C'}
                                                    </div>
                                                    <span className="truncate max-w-[160px] sm:max-w-xs">{qt.client_name}</span>
                                                </div>
                                            </td>

                                            <td className="py-4 px-6 font-mono text-[11px] text-neutral-500 font-normal">
                                                {qt.ref_no || `QT-${qt.id}`}
                                            </td>

                                            <td className="py-4 px-6 text-neutral-600 font-normal">
                                                <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-[11px] font-medium">
                                                    {qt.capacity || '3 kW On-Grid'}
                                                </span>
                                            </td>

                                            <td className="py-4 px-6 font-semibold text-neutral-900 font-mono">
                                                {qt.total_amount ? formatINR(qt.total_amount) : '₹ 1,85,000'}
                                            </td>

                                            <td className="py-4 px-6 text-neutral-400 text-[11px] font-normal">
                                                {qt.created_at_formatted || 'Recent'}
                                            </td>

                                            <td className="py-4 px-6 text-right">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-[#1A4D2E] border border-emerald-200/70">
                                                    Active
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Quick Navigation Footer Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <button
                    onClick={() => onNavigate('application-tracking')}
                    className="p-4 rounded-2xl bg-white border border-neutral-200/80 hover:border-[#1A4D2E] hover:bg-emerald-50/20 text-left transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#1A4D2E] flex items-center justify-center">
                            <Activity size={17} />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-neutral-900 group-hover:text-[#1A4D2E]">
                                Application Tracking
                            </div>
                            <div className="text-[10px] text-neutral-400 font-normal">
                                {totalApplicationsCount ? `${totalApplicationsCount} applications tracked` : 'Track client journeys'}
                            </div>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-neutral-400 group-hover:text-[#1A4D2E]" />
                </button>

                <button
                    onClick={() => onNavigate('inquiries')}
                    className="p-4 rounded-2xl bg-white border border-neutral-200/80 hover:border-amber-400 hover:bg-amber-50/20 text-left transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                            <Mail size={17} />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-neutral-900 group-hover:text-amber-800">
                                Inquiries Manager
                            </div>
                            <div className="text-[10px] text-neutral-400 font-normal">
                                {stats?.pending_inquiries ? `${stats.pending_inquiries} awaiting reply` : 'View all inquiries'}
                            </div>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-neutral-400 group-hover:text-amber-800" />
                </button>

                <button
                    onClick={() => onNavigate('quotation')}
                    className="p-4 rounded-2xl bg-white border border-neutral-200/80 hover:border-[#1A4D2E] hover:bg-emerald-50/20 text-left transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#1A4D2E] flex items-center justify-center">
                            <FileText size={17} />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-neutral-900 group-hover:text-[#1A4D2E]">
                                Quotation Builder
                            </div>
                            <div className="text-[10px] text-neutral-400 font-normal">
                                Generate customized proposal
                            </div>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-neutral-400 group-hover:text-[#1A4D2E]" />
                </button>

                <button
                    onClick={() => onNavigate('projects')}
                    className="p-4 rounded-2xl bg-white border border-neutral-200/80 hover:border-emerald-500 hover:bg-emerald-50/20 text-left transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#1A4D2E] flex items-center justify-center">
                            <FolderGit2 size={17} />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-neutral-900 group-hover:text-[#1A4D2E]">
                                Project Showcase
                            </div>
                            <div className="text-[10px] text-neutral-400 font-normal">
                                {stats ? `${stats.active_projects || 0} projects published` : 'Gallery management'}
                            </div>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-neutral-400 group-hover:text-[#1A4D2E]" />
                </button>
            </div>

        </div>
    );
};
