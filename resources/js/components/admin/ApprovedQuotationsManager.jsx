import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
    CheckCircle2,
    Search,
    RefreshCw,
    Calendar,
    FileText,
    Download,
    Eye,
    FileSignature,
    User,
    Phone,
    MapPin,
    Zap,
    Clock,
    X,
    ExternalLink,
    Filter,
    FilterX,
    ArrowRight,
    AlertCircle,
    Check,
    Trash2,
    XCircle,
    RotateCcw,
    CreditCard
} from 'lucide-react';
import { Pagination } from './Pagination';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

export const ApprovedQuotationsManager = ({ onNavigate, onUnauthorized }) => {
    const [quotations, setQuotations] = useState([]);
    const [stats, setStats] = useState({ total_approved: 0, with_agreement: 0, pending_agreement: 0 });
    // 'approved' -> approved by client (incl. those already moved to agreement/payment)
    // 'rejected' -> rejected by client
    const [activeListTab, setActiveListTab] = useState('approved');
    const [tabCounts, setTabCounts] = useState({ approved: 0, rejected: 0 });
    const isRejectedTab = activeListTab === 'rejected';
    const [isLoading, setIsLoading] = useState(true);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [datePreset, setDatePreset] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [agreementFilter, setAgreementFilter] = useState('all'); // 'all' | 'pending' | 'created'
    const [showFilter, setShowFilter] = useState(false);

    // PDF Preview Modal
    const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
    const [previewPdfTitle, setPreviewPdfTitle] = useState('');

    // Delete Modal state
    const [quotationToDelete, setQuotationToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const handlePresetChange = (preset) => {
        setDatePreset(preset);
        const today = new Date();
        const formatDate = (d) => d.toISOString().split('T')[0];

        if (preset === 'all') {
            setStartDate('');
            setEndDate('');
        } else if (preset === 'today') {
            const todayStr = formatDate(today);
            setStartDate(todayStr);
            setEndDate(todayStr);
        } else if (preset === 'week') {
            const pastWeek = new Date();
            pastWeek.setDate(today.getDate() - 7);
            setStartDate(formatDate(pastWeek));
            setEndDate(formatDate(today));
        } else if (preset === 'month') {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            setStartDate(formatDate(startOfMonth));
            setEndDate(formatDate(today));
        } else if (preset === 'custom') {
            if (!startDate) setStartDate(formatDate(today));
            if (!endDate) setEndDate(formatDate(today));
        }
    };

    const loadApprovedQuotations = async (isManual = false) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            // Approved tab: approved by client, including those that already proceeded to agreement / payment.
            // Rejected tab: rejected by client.
            params.append('workflow_status', isRejectedTab ? 'rejected' : 'approved,agreement_created,completed');
            if (searchQuery.trim()) params.append('search', searchQuery.trim());
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);

            const res = await fetch(`/api/admin-quotations.php?${params.toString()}`, {
                credentials: 'include'
            });

            if (res.status === 401) {
                if (onUnauthorized) onUnauthorized();
                return;
            }

            const data = await res.json();
            if (res.ok && data.success) {
                const list = data.data || [];
                setQuotations(list);

                if (data.stats) {
                    setTabCounts({
                        approved: (data.stats.approved || 0) + (data.stats.agreement_created || 0) + (data.stats.completed || 0),
                        rejected: data.stats.rejected || 0,
                    });
                }

                const withAgreementCount = list.filter((q) => q.has_agreement).length;
                setStats({
                    total_approved: list.length,
                    with_agreement: withAgreementCount,
                    pending_agreement: list.length - withAgreementCount
                });

                if (isManual) toast.success(isRejectedTab ? 'Rejected quotations refreshed!' : 'Approved quotations refreshed!');
            } else {
                toast.error(data.message || 'Failed to load quotations.');
            }
        } catch {
            toast.error('Unable to connect to server.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        loadApprovedQuotations();
    }, [startDate, endDate, activeListTab]);

    const handleTabSwitch = (tab) => {
        if (tab === activeListTab) return;
        setQuotations([]);
        setAgreementFilter('all');
        setActiveListTab(tab);
    };

    // Reopen a rejected quotation -> it goes back to Pending Approval
    const handleReopenRejected = async (quote) => {
        if (!window.confirm(`Reopen quotation #${quote.ref_no} for ${quote.client_name}? It will move back to Pending Approval.`)) return;
        try {
            const res = await fetch('/api/admin-quotations-reopen.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id: quote.id })
            });
            if (res.status === 401) {
                if (onUnauthorized) onUnauthorized();
                return;
            }
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(`Quotation #${quote.ref_no} reopened and moved to Pending Approval.`);
                loadApprovedQuotations();
            } else {
                toast.error(data.message || 'Failed to reopen quotation.');
            }
        } catch {
            toast.error('Network error reopening quotation.');
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        loadApprovedQuotations();
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setDatePreset('all');
        setStartDate('');
        setEndDate('');
        setAgreementFilter('all');
        setCurrentPage(1);
    };

    const handleConfirmDelete = async (password = '') => {
        if (!quotationToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin-quotations-delete.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    id: quotationToDelete.id,
                    action: 'delete',
                    password: password
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(`Quotation #${quotationToDelete.ref_no} deleted successfully.`);
                setTabCounts((prev) => ({ ...prev, [activeListTab]: Math.max(0, prev[activeListTab] - 1) }));
                setQuotations((prev) => prev.filter((q) => q.id !== quotationToDelete.id));
                setStats((prev) => ({
                    ...prev,
                    total_approved: Math.max(0, prev.total_approved - 1),
                    with_agreement: quotationToDelete.has_agreement ? Math.max(0, prev.with_agreement - 1) : prev.with_agreement,
                    pending_agreement: !quotationToDelete.has_agreement ? Math.max(0, prev.pending_agreement - 1) : prev.pending_agreement
                }));
                setQuotationToDelete(null);
            } else {
                toast.error(data.message || 'Failed to delete quotation.');
            }
        } catch {
            toast.error('Network error deleting quotation.');
        } finally {
            setIsDeleting(false);
        }
    };

    // Filter by agreement status locally if toggled
    const filteredQuotations = useMemo(() => {
        return quotations.filter((q) => {
            if (agreementFilter === 'pending') return !q.has_agreement;
            if (agreementFilter === 'created') return q.has_agreement;
            return true;
        });
    }, [quotations, agreementFilter]);

    const totalPages = Math.ceil(filteredQuotations.length / perPage) || 1;
    const paginatedQuotations = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filteredQuotations.slice(start, start + perPage);
    }, [filteredQuotations, currentPage, perPage]);

    const handleGenerateAgreement = (quote) => {
        if (onNavigate) {
            onNavigate('agreement', { quotation: quote, quotationId: quote.id });
        }
    };

    return (
        <div className="w-full px-4 sm:px-8 py-8 space-y-6 font-poppins max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">
                        Approved Quotations
                    </h1>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                        {isRejectedTab
                            ? 'Quotations rejected by clients. Reopen one to send it back to Pending Approval.'
                            : 'Quotations approved by clients. Generate the agreement, then continue to Payments.'}
                    </p>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-center">
                    <button
                        type="button"
                        onClick={() => setShowFilter((prev) => !prev)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                            showFilter
                                ? 'bg-neutral-100 border-neutral-300 text-neutral-800'
                                : 'bg-white hover:bg-neutral-50 border-neutral-200/90 text-neutral-700'
                        }`}
                    >
                        {showFilter ? (
                            <>
                                <FilterX size={14} className="text-neutral-500" />
                                <span>Hide Filter</span>
                            </>
                        ) : (
                            <>
                                <Filter size={14} className="text-neutral-500" />
                                <span>Filter & Search</span>
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => loadApprovedQuotations(true)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200/90 text-neutral-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-60"
                        title="Refresh list"
                    >
                        <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Approved / Rejected Tabs */}
            <div className="flex items-center gap-1 border-b border-neutral-200">
                {[
                    { id: 'approved', label: 'Approved', icon: CheckCircle2, count: tabCounts.approved, active: 'border-[#1A4D2E] text-[#1A4D2E]', badge: 'bg-emerald-100 text-[#1A4D2E]' },
                    { id: 'rejected', label: 'Rejected', icon: XCircle, count: tabCounts.rejected, active: 'border-rose-600 text-rose-700', badge: 'bg-rose-100 text-rose-700' },
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeListTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => handleTabSwitch(tab.id)}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 -mb-px border-b-2 text-sm font-semibold transition-all cursor-pointer ${
                                isActive ? tab.active : 'border-transparent text-neutral-500 hover:text-neutral-800'
                            }`}
                        >
                            <Icon size={15} />
                            <span>{tab.label}</span>
                            <span className={`min-w-[22px] px-1.5 py-0.5 rounded-full text-[11px] font-bold ${isActive ? tab.badge : 'bg-neutral-100 text-neutral-500'}`}>
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Quick Metrics Bar */}
            {isRejectedTab ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
                    <div className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Total Rejected</div>
                    <div className="text-2xl sm:text-3xl font-bold text-rose-700 mt-1 font-poppins">{tabCounts.rejected}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">Declined by clients</div>
                </div>
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
                    <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Matching Filter</div>
                    <div className="text-2xl sm:text-3xl font-bold text-neutral-800 mt-1 font-poppins">{quotations.length}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">Active search/date results</div>
                </div>
            </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
                    <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Total Approved</div>
                    <div className="text-2xl sm:text-3xl font-bold text-[#1A4D2E] mt-1 font-poppins">{stats.total_approved}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">Accepted by clients</div>
                </div>
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
                    <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Agreement Pending</div>
                    <div className="text-2xl sm:text-3xl font-bold text-amber-600 mt-1 font-poppins">{stats.pending_agreement}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">Ready to generate agreement</div>
                </div>
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
                    <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Agreements Created</div>
                    <div className="text-2xl sm:text-3xl font-bold text-blue-800 mt-1 font-poppins">{stats.with_agreement}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">Moved to payment stage</div>
                </div>
            </div>
            )}

            {/* Filter Drawer */}
            {showFilter && (
                <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-4 animate-in fade-in duration-150">
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search client name, ref #, phone, address, capacity..."
                                className="w-full pl-10 pr-24 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[#1A4D2E] focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
                            />
                            <button
                                type="submit"
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#1A4D2E] hover:bg-[#143c24] text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                            >
                                Search
                            </button>
                        </form>

                        {/* Date Presets */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-bold text-neutral-500 mr-1 flex items-center gap-1">
                                <Calendar size={13} />
                                Date:
                            </span>
                            {[
                                { id: 'all', label: 'All Time' },
                                { id: 'today', label: 'Today' },
                                { id: 'week', label: 'Last 7 Days' },
                                { id: 'month', label: 'This Month' },
                                { id: 'custom', label: 'Custom Range' },
                            ].map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => handlePresetChange(p.id)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        datePreset === p.id
                                            ? 'bg-[#1A4D2E] text-white shadow-xs'
                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Date Range Picker - ONLY when datePreset === 'custom' */}
                    {datePreset === 'custom' && (
                        <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center gap-3 animate-in fade-in duration-150">
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-bold text-neutral-600">From:</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:border-[#1A4D2E]"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-bold text-neutral-600">To:</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:border-[#1A4D2E]"
                                />
                            </div>
                        </div>
                    )}

                    {/* Agreement Status Filter Pills */}
                    <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
                        {!isRejectedTab && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-neutral-500">Agreement Status:</span>
                            {[
                                { id: 'all', label: 'All Approved' },
                                { id: 'pending', label: 'Needs Agreement' },
                                { id: 'created', label: 'Agreement Created' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setAgreementFilter(tab.id)}
                                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                        agreementFilter === tab.id
                                            ? 'bg-neutral-900 text-white'
                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        )}

                        {(startDate || endDate || searchQuery || agreementFilter !== 'all') && (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl transition-all cursor-pointer"
                            >
                                <X size={13} />
                                <span>Reset Filters</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Quotations List */}
            {isLoading ? (
                <div className="bg-white rounded-3xl p-12 border border-neutral-200/80 text-center space-y-3">
                    <RefreshCw size={24} className="animate-spin text-[#1A4D2E] mx-auto" />
                    <p className="text-xs font-semibold text-neutral-500">{isRejectedTab ? 'Loading rejected quotations...' : 'Loading approved quotations...'}</p>
                </div>
            ) : filteredQuotations.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 border border-neutral-200/80 text-center space-y-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${isRejectedTab ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-[#1A4D2E]'}`}>
                        {isRejectedTab ? <XCircle size={28} /> : <CheckCircle2 size={28} />}
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-bold text-neutral-900">{isRejectedTab ? 'No Rejected Quotations' : 'No Approved Quotations Found'}</h3>
                        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                            {searchQuery || startDate || endDate || agreementFilter !== 'all'
                                ? "No quotations matched your active filters."
                                : isRejectedTab
                                    ? "No quotations have been rejected by clients."
                                    : "No quotations have been approved by clients yet. Open Pending Approval and click 'Approved by Client' on a quotation."}
                        </p>
                    </div>
                    <div className="pt-2 flex items-center justify-center gap-3">
                        {onNavigate && (
                            <button
                                onClick={() => onNavigate('pending-approval')}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A4D2E] hover:bg-[#143c24] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
                            >
                                <FileText size={15} />
                                <span>Go to Pending Approval</span>
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xs overflow-hidden">
                    {/* Desktop View Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-neutral-50/80 border-b border-neutral-200/80 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-3 sm:px-4 text-center w-12 font-mono">#</th>
                                    <th className="py-3.5 px-4 sm:px-6">{isRejectedTab ? 'Ref & Rejection Date' : 'Ref & Approval Date'}</th>
                                    <th className="py-3.5 px-4">Applicant Details</th>
                                    <th className="py-3.5 px-4">System Specs</th>
                                    <th className="py-3.5 px-4">Quotation Amount</th>
                                    <th className="py-3.5 px-4 text-center">{isRejectedTab ? 'Rejection Reason' : 'Agreement Status'}</th>
                                    <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {paginatedQuotations.map((quote, idx) => (
                                    <tr key={quote.id} className="hover:bg-emerald-50/25 transition-colors group">
                                        {/* Serial */}
                                        <td className="py-4 px-3 sm:px-4 text-center font-mono text-neutral-400 text-xs font-semibold">
                                            {(currentPage - 1) * perPage + idx + 1}
                                        </td>

                                        {/* Ref & Date */}
                                        <td className="py-4 px-4 sm:px-6">
                                            <div className="font-mono font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                                                <span>{quote.ref_no}</span>
                                            </div>
                                            {isRejectedTab ? (
                                                <div className="text-[11px] text-rose-700 font-medium mt-0.5 flex items-center gap-1">
                                                    <XCircle size={11} className="text-rose-600" />
                                                    <span>Rejected: {quote.rejected_at || quote.quotation_date}</span>
                                                </div>
                                            ) : (
                                                <div className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
                                                    <CheckCircle2 size={11} className="text-emerald-600" />
                                                    <span>Approved: {quote.approved_at || quote.quotation_date}</span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Applicant Details */}
                                        <td className="py-4 px-4">
                                            <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                                                <User size={13} className="text-emerald-700 shrink-0" />
                                                <span className="truncate max-w-[180px]">{quote.client_name}</span>
                                            </div>
                                            <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                                                <Phone size={11} className="text-neutral-400 shrink-0" />
                                                <span>{quote.client_phone}</span>
                                            </div>
                                            {quote.client_address !== '-' && (
                                                <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5 truncate max-w-[190px]">
                                                    <MapPin size={11} className="text-neutral-400 shrink-0" />
                                                    <span className="truncate">{quote.client_address}</span>
                                                </div>
                                            )}
                                        </td>

                                        {/* System Specs */}
                                        <td className="py-4 px-4">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-[#1A4D2E] font-bold text-xs">
                                                <Zap size={12} className="text-amber-500 fill-amber-500" />
                                                <span>{quote.capacity}</span>
                                            </div>
                                            <div className="text-[11px] text-neutral-500 mt-1 font-medium">
                                                {quote.system_type}
                                            </div>
                                        </td>

                                        {/* Total Amount */}
                                        <td className="py-4 px-4">
                                            <div className="font-bold text-[#1A4D2E] text-sm">
                                                ₹{quote.total_amount}
                                            </div>
                                            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                                                {isRejectedTab ? 'Quoted Cost' : 'Accepted Cost'}
                                            </span>
                                        </td>

                                        {/* Agreement Status */}
                                        <td className="py-4 px-4 text-center">
                                            {isRejectedTab ? (
                                                <span className="inline-block max-w-[200px] text-left text-[11px] text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl" title={quote.rejection_reason || ''}>
                                                    {quote.rejection_reason || 'No reason given'}
                                                </span>
                                            ) : quote.has_agreement ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full whitespace-nowrap text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                    <Check size={11} />
                                                    <span>Agreement Created</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full whitespace-nowrap text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                    <Clock size={11} />
                                                    <span>Ready to Generate</span>
                                                </span>
                                            )}
                                        </td>

                                        {/* Action Buttons: Generate Agreement & Delete */}
                                        <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                {isRejectedTab ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleReopenRejected(quote)}
                                                        className="inline-flex items-center justify-center gap-1.5 h-9 min-w-[172px] px-4 rounded-xl whitespace-nowrap bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                                                        title="Reopen and move back to Pending Approval"
                                                    >
                                                        <RotateCcw size={13} />
                                                        <span>Reopen</span>
                                                    </button>
                                                ) : quote.has_agreement ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => onNavigate && onNavigate('payments')}
                                                        className="inline-flex items-center justify-center gap-1.5 h-9 min-w-[172px] px-4 rounded-xl whitespace-nowrap bg-[#1A4D2E] hover:bg-[#143c24] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                                                        title="Agreement done - continue to Payments"
                                                    >
                                                        <CreditCard size={13} />
                                                        <span>Go to Payments</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleGenerateAgreement(quote)}
                                                        className="inline-flex items-center justify-center gap-1.5 h-9 min-w-[172px] px-4 rounded-xl whitespace-nowrap bg-[#1A4D2E] hover:bg-[#143c24] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                                                        title="Generate Agreement for this client"
                                                    >
                                                        <FileSignature size={13} />
                                                        <span>Generate Agreement</span>
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => setQuotationToDelete(quote)}
                                                    className="inline-flex items-center justify-center gap-1 h-9 px-3 rounded-xl whitespace-nowrap bg-white hover:bg-rose-50 text-neutral-500 hover:text-rose-600 border border-neutral-200 hover:border-rose-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                                                    title="Delete this quotation"
                                                >
                                                    <Trash2 size={13} />
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View Card List */}
                    <div className="block md:hidden p-3.5 space-y-3 bg-neutral-50/50">
                        {paginatedQuotations.map((quote, idx) => (
                            <div
                                key={quote.id}
                                className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs space-y-3"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
                                            #{(currentPage - 1) * perPage + idx + 1}
                                        </span>
                                        <span className="font-mono font-bold text-neutral-900 text-xs">
                                            {quote.ref_no}
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-[#1A4D2E]">
                                        ₹{quote.total_amount}
                                    </span>
                                </div>

                                <div className="bg-neutral-50/80 rounded-xl p-2.5 space-y-1.5 text-xs">
                                    <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                                        <User size={13} className="text-emerald-700 shrink-0" />
                                        <span>{quote.client_name}</span>
                                    </div>
                                    <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                                        <Phone size={11} className="text-neutral-400 shrink-0" />
                                        <span>{quote.client_phone}</span>
                                    </div>
                                    {quote.client_address !== '-' && (
                                        <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                                            <MapPin size={11} className="text-neutral-400 shrink-0" />
                                            <span className="truncate">{quote.client_address}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-xs pt-1">
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-[#1A4D2E] font-bold text-[11px]">
                                        <Zap size={11} className="text-amber-500 fill-amber-500" />
                                        <span>{quote.capacity}</span>
                                        <span className="text-neutral-400 font-normal ml-1">({quote.system_type})</span>
                                    </div>
                                    {isRejectedTab ? (
                                        <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                                            Rejected
                                        </span>
                                    ) : quote.has_agreement ? (
                                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                            Agreement Created
                                        </span>
                                    ) : (
                                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                            Needs Agreement
                                        </span>
                                    )}
                                </div>

                                {isRejectedTab && (
                                    <div className="text-[11px] text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-2.5 py-1.5">
                                        <span className="font-bold">Reason: </span>{quote.rejection_reason || 'No reason given'}
                                        {quote.rejected_at && <div className="text-rose-500 mt-0.5">Rejected: {quote.rejected_at}</div>}
                                    </div>
                                )}

                                <div className="pt-2 border-t border-neutral-100 flex items-center gap-2">
                                    {isRejectedTab ? (
                                        <button
                                            type="button"
                                            onClick={() => handleReopenRejected(quote)}
                                            className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <RotateCcw size={13} />
                                            <span>Reopen</span>
                                        </button>
                                    ) : quote.has_agreement ? (
                                        <button
                                            type="button"
                                            onClick={() => onNavigate && onNavigate('payments')}
                                            className="flex-1 py-2 px-3 rounded-xl bg-[#1A4D2E] hover:bg-[#143c24] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <CreditCard size={13} />
                                            <span>Go to Payments</span>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleGenerateAgreement(quote)}
                                            className="flex-1 py-2 px-3 rounded-xl bg-[#1A4D2E] hover:bg-[#143c24] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <FileSignature size={13} />
                                            <span>Generate Agreement</span>
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setQuotationToDelete(quote)}
                                        className="py-2 px-3 rounded-xl bg-white hover:bg-rose-50 text-neutral-500 hover:text-rose-600 border border-neutral-200 text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                                        title="Delete this quotation"
                                    >
                                        <Trash2 size={13} />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredQuotations.length}
                        perPage={perPage}
                        onPageChange={setCurrentPage}
                        onPerPageChange={setPerPage}
                        itemLabel={isRejectedTab ? 'rejected quotations' : 'approved quotations'}
                    />
                </div>
            )}

            <ConfirmDeleteModal
                isOpen={!!quotationToDelete}
                onClose={() => setQuotationToDelete(null)}
                onConfirm={handleConfirmDelete}
                title={isRejectedTab ? 'Delete Rejected Quotation' : 'Delete Approved Quotation'}
                message={`Are you sure you want to delete quotation #${quotationToDelete?.ref_no} for ${quotationToDelete?.client_name}? Any associated agreements and payments will also be permanently removed. This action cannot be undone.`}
                isDeleting={isDeleting}
            />
        </div>
    );
};
