import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    History,
    Search,
    RefreshCw,
    Calendar,
    FileText,
    Download,
    Eye,
    Trash2,
    Edit3,
    User,
    Phone,
    MapPin,
    Zap,
    X,
    Filter,
    FilterX,
    Clock,
    Plus,
    CheckCircle2,
    XCircle,
    ExternalLink,
    CreditCard,
    FileSignature,
    RotateCcw,
    Lock,
    Unlock,
    AlertCircle,
    Check
} from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { Pagination } from './Pagination';

export const QuotationHistoryManager = ({ onNavigate, onUnauthorized }) => {
    const [quotations, setQuotations] = useState([]);
    const [stats, setStats] = useState({ total: 0, today: 0, this_month: 0, filtered_count: 0 });
    const [isLoading, setIsLoading] = useState(true);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [datePreset, setDatePreset] = useState('all'); // 'all' | 'today' | 'week' | 'month' | 'custom'
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [workflowFilter, setWorkflowFilter] = useState('all');
    const [showFilter, setShowFilter] = useState(false);

    // Delete Modal state
    const [quotationToDelete, setQuotationToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Reject Modal state
    const [quotationToReject, setQuotationToReject] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);

    // Approving indicator
    const [isApprovingId, setIsApprovingId] = useState(null);

    // PDF Preview Modal
    const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
    const [previewPdfTitle, setPreviewPdfTitle] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Handle date preset change
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
        }
    };

    const loadQuotations = async (isManual = false) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery.trim()) params.append('search', searchQuery.trim());
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            if (workflowFilter !== 'all') params.append('workflow_status', workflowFilter);

            const url = `/api/admin-quotations.php?${params.toString()}`;
            const res = await fetch(url, {
                credentials: 'include'
            });

            if (res.status === 401) {
                if (onUnauthorized) {
                    onUnauthorized();
                    return;
                }
            }

            const data = await res.json();
            if (res.ok && data.success) {
                setQuotations(data.data || []);
                if (data.stats) {
                    setStats(data.stats);
                }
                if (isManual) toast.success('Quotation history refreshed!');
            } else {
                toast.error(data.message || 'Failed to load quotation history.');
            }
        } catch {
            toast.error('Unable to connect to quotations server.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        loadQuotations();
    }, [startDate, endDate, workflowFilter]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        loadQuotations();
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setDatePreset('all');
        setStartDate('');
        setEndDate('');
        setWorkflowFilter('all');
        setCurrentPage(1);
    };

    // Client Approval Handler
    const handleApproveQuotation = async (quote) => {
        setIsApprovingId(quote.id);
        try {
            const res = await fetch(`/api/admin-quotations-approve.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id: quote.id })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(`Quotation #${quote.ref_no} marked as Approved by Client!`);
                loadQuotations();
            } else {
                toast.error(data.message || 'Failed to approve quotation.');
            }
        } catch {
            toast.error('Network error approving quotation.');
        } finally {
            setIsApprovingId(null);
        }
    };

    // Client Rejection Handler
    const handleConfirmReject = async () => {
        if (!quotationToReject) return;
        setIsRejecting(true);
        try {
            const res = await fetch(`/api/admin-quotations-reject.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    id: quotationToReject.id,
                    reason: rejectionReason.trim() || 'Client declined quotation'
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(`Quotation #${quotationToReject.ref_no} marked as Rejected by Client.`);
                setQuotationToReject(null);
                setRejectionReason('');
                loadQuotations();
            } else {
                toast.error(data.message || 'Failed to reject quotation.');
            }
        } catch {
            toast.error('Network error rejecting quotation.');
        } finally {
            setIsRejecting(false);
        }
    };

    // Reopen Quotation Handler
    const handleReopenQuotation = async (quote) => {
        if (!window.confirm(`Reopen quotation #${quote.ref_no} for editing? This resets its status to 'Quotation Approval Pending'.`)) {
            return;
        }
        try {
            const res = await fetch(`/api/admin-quotations-reopen.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id: quote.id })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(`Quotation #${quote.ref_no} reopened for editing!`);
                loadQuotations();
            } else {
                toast.error(data.message || 'Failed to reopen quotation.');
            }
        } catch {
            toast.error('Network error reopening quotation.');
        }
    };

    // Edit Quotation Click
    const handleEditQuotation = (quote) => {
        if (!quote.is_editable) {
            toast.error(`Quotation is ${quote.workflow_status_label}. Editing is disabled unless explicitly reopened.`);
            return;
        }
        if (onNavigate) {
            onNavigate('quotation', { editId: quote.id });
        }
    };

    // Delete quotation
    const handleConfirmDelete = async () => {
        if (!quotationToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch('/api/admin-quotations-delete.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    action: 'delete',
                    id: quotationToDelete.id
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success('Quotation deleted successfully.');
                setQuotations(prev => prev.filter(q => q.id !== quotationToDelete.id));
                setStats(prev => ({
                    ...prev,
                    total: Math.max(0, prev.total - 1),
                    filtered_count: Math.max(0, prev.filtered_count - 1)
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

    return (
        <div className="w-full px-4 sm:px-8 py-8 space-y-6 font-poppins max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">
                        Quotation History
                    </h1>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                        Manage saved quotations, edit pending quotes, record client approval/rejection, and track agreements.
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
                        onClick={() => loadQuotations(true)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 font-semibold rounded-xl text-xs transition-all cursor-pointer"
                        title="Reload latest records from database"
                    >
                        <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>

                    {onNavigate && (
                        <button
                            type="button"
                            onClick={() => onNavigate('quotation')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1A4D2E] hover:bg-[#143c24] text-white font-semibold rounded-xl text-xs transition-all shadow-xs cursor-pointer"
                        >
                            <Plus size={14} />
                            <span>New Quote</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Overview Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
                    <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Saved</div>
                    <div className="text-2xl sm:text-3xl font-semibold text-neutral-900 mt-1 font-poppins">{stats.total}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">Historical records</div>
                </div>
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
                    <div className="text-xs font-medium text-emerald-700 uppercase tracking-wider">Saved Today</div>
                    <div className="text-2xl sm:text-3xl font-semibold text-[#1A4D2E] mt-1 font-poppins">{stats.today}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">Created today</div>
                </div>
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
                    <div className="text-xs font-medium text-blue-700 uppercase tracking-wider">This Month</div>
                    <div className="text-2xl sm:text-3xl font-semibold text-blue-900 mt-1 font-poppins">{stats.this_month}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">Current month</div>
                </div>
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
                    <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Matching Filter</div>
                    <div className="text-2xl sm:text-3xl font-semibold text-neutral-800 mt-1 font-poppins">{quotations.length}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">Active search/date results</div>
                </div>
            </div>

            {/* Filter Controls Bar */}
            {showFilter && (
                <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-4">
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                        {/* Search Input */}
                        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search client, ref #, phone, city, capacity..."
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

                    {/* Status Filter Tabs & Custom Date Range */}
                    <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-bold text-neutral-500 mr-1">Status:</span>
                            {[
                                { id: 'all', label: 'All Statuses' },
                                { id: 'approval_pending', label: 'Approval Pending' },
                                { id: 'approved', label: 'Approved by Client' },
                                { id: 'rejected', label: 'Rejected by Client' },
                                { id: 'agreement_created', label: 'Agreement Created' },
                                { id: 'completed', label: 'Completed' },
                            ].map((st) => (
                                <button
                                    key={st.id}
                                    type="button"
                                    onClick={() => setWorkflowFilter(st.id)}
                                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                        workflowFilter === st.id
                                            ? 'bg-neutral-900 text-white'
                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    }`}
                                >
                                    {st.label}
                                </button>
                            ))}
                        </div>

                        {(startDate || endDate || searchQuery || workflowFilter !== 'all') && (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl transition-all cursor-pointer ml-auto"
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
                    <p className="text-xs font-semibold text-neutral-500">Loading saved quotation history...</p>
                </div>
            ) : quotations.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 border border-neutral-200/80 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#1A4D2E] flex items-center justify-center mx-auto">
                        <FileText size={26} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-bold text-neutral-900">No Quotations Found</h3>
                        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                            {startDate || endDate || searchQuery || workflowFilter !== 'all'
                                ? "No quotations matched your active filters. Try adjusting or clearing your filters."
                                : "You haven't saved any quotations to history yet. Open the Quotation Builder, create a quote, and click Save."}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xs overflow-hidden">
                    {(() => {
                        const totalItems = quotations.length;
                        const paginatedQuotations = quotations.slice((currentPage - 1) * perPage, currentPage * perPage);

                        return (
                            <>
                                {/* Desktop View: Responsive Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-neutral-50/80 border-b border-neutral-200/80 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                                                <th className="py-3.5 px-3 sm:px-4 text-center w-12 font-mono">#</th>
                                                <th className="py-3.5 px-4 sm:px-6">Ref & Date</th>
                                                <th className="py-3.5 px-4">Client Details</th>
                                                <th className="py-3.5 px-4">System Specs</th>
                                                <th className="py-3.5 px-4">Total Amount</th>
                                                <th className="py-3.5 px-4">Workflow Status</th>
                                                <th className="py-3.5 px-4 text-center">PDF</th>
                                                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100">
                                            {paginatedQuotations.map((quote, idx) => (
                                                <tr key={quote.id} className="hover:bg-emerald-50/25 transition-colors group">
                                                    {/* Serial Number */}
                                                    <td className="py-4 px-3 sm:px-4 text-center font-mono text-neutral-400 text-xs font-semibold">
                                                        {(currentPage - 1) * perPage + idx + 1}
                                                    </td>

                                                    {/* Ref & Date */}
                                                    <td className="py-4 px-4 sm:px-6">
                                                        <div className="font-mono font-bold text-neutral-900 text-xs">
                                                            {quote.ref_no}
                                                        </div>
                                                        <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1">
                                                            <Clock size={11} />
                                                            <span>{quote.created_at_formatted || quote.quotation_date}</span>
                                                        </div>
                                                    </td>

                                                    {/* Client Details */}
                                                    <td className="py-4 px-4">
                                                        <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                                                            <User size={13} className="text-emerald-700 shrink-0" />
                                                            <span className="truncate max-w-[170px]">{quote.client_name}</span>
                                                        </div>
                                                        <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                                                            <Phone size={11} className="text-neutral-400 shrink-0" />
                                                            <span>{quote.client_phone}</span>
                                                        </div>
                                                        {quote.client_address !== '-' && (
                                                            <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5 truncate max-w-[180px]">
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
                                                        <div className="font-semibold text-[#1A4D2E] text-sm">
                                                            ₹{quote.total_amount}
                                                        </div>
                                                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                                                            Quotation
                                                        </span>
                                                    </td>

                                                    {/* Status Badge */}
                                                    <td className="py-4 px-4">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                                            quote.workflow_status === 'completed'
                                                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                                : quote.workflow_status === 'agreement_created'
                                                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                                : quote.workflow_status === 'approved'
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                : quote.workflow_status === 'rejected'
                                                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                                        }`}>
                                                            {quote.workflow_status === 'approved' && <Check size={11} />}
                                                            {quote.workflow_status === 'rejected' && <X size={11} />}
                                                            {quote.workflow_status === 'approval_pending' && <Clock size={11} />}
                                                            <span>{quote.workflow_status_label}</span>
                                                        </span>
                                                        {quote.rejection_reason && quote.workflow_status === 'rejected' && (
                                                            <div className="text-[10px] text-rose-600 mt-0.5 max-w-[150px] truncate" title={quote.rejection_reason}>
                                                                Reason: {quote.rejection_reason}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* PDF Document Column */}
                                                    <td className="py-4 px-4 text-center">
                                                        {quote.pdf_url ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setPreviewPdfUrl(quote.pdf_url);
                                                                    setPreviewPdfTitle(`Quotation: ${quote.client_name} (${quote.ref_no})`);
                                                                }}
                                                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 font-semibold text-xs transition-all cursor-pointer"
                                                                title="View PDF Document"
                                                            >
                                                                <Eye size={12} />
                                                                <span>View</span>
                                                            </button>
                                                        ) : (
                                                            <span className="text-[11px] text-neutral-400 italic">No PDF</span>
                                                        )}
                                                    </td>

                                                    {/* Workflow Actions */}
                                                    <td className="py-4 px-4 sm:px-6 text-right">
                                                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                            {/* 1. Edit Quotation (Active only if approval_pending) */}
                                                            {quote.is_editable ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleEditQuotation(quote)}
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 text-xs font-semibold transition-all cursor-pointer"
                                                                    title="Edit quotation fields"
                                                                >
                                                                    <Edit3 size={12} />
                                                                    <span>Edit</span>
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleReopenQuotation(quote)}
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-50 hover:bg-amber-50 text-neutral-500 hover:text-amber-700 border border-neutral-200 text-xs font-semibold transition-all cursor-pointer"
                                                                    title="Reopen quotation for editing"
                                                                >
                                                                    <RotateCcw size={11} />
                                                                    <span>Reopen</span>
                                                                </button>
                                                            )}

                                                            {/* 2. Client Approval / Rejection Actions (if still pending) */}
                                                            {quote.workflow_status === 'approval_pending' && (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        disabled={isApprovingId === quote.id}
                                                                        onClick={() => handleApproveQuotation(quote)}
                                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all cursor-pointer border border-emerald-200/60"
                                                                        title="Mark approved by client"
                                                                    >
                                                                        <CheckCircle2 size={12} className={isApprovingId === quote.id ? 'animate-spin' : ''} />
                                                                        <span>Approve</span>
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setQuotationToReject(quote);
                                                                            setRejectionReason('');
                                                                        }}
                                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer border border-rose-200/60"
                                                                        title="Mark rejected by client"
                                                                    >
                                                                        <XCircle size={12} />
                                                                        <span>Reject</span>
                                                                    </button>
                                                                </>
                                                            )}

                                                            {/* 3. If Approved -> Generate Agreement */}
                                                            {quote.workflow_status === 'approved' && onNavigate && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onNavigate('agreement', { quotation: quote, quotationId: quote.id })}
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1A4D2E] hover:bg-[#143c24] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                                                                    title="Generate Model RTS Agreement"
                                                                >
                                                                    <FileSignature size={12} />
                                                                    <span>Agreement</span>
                                                                </button>
                                                            )}

                                                            {/* Delete */}
                                                            <button
                                                                type="button"
                                                                onClick={() => setQuotationToDelete(quote)}
                                                                className="p-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-600 hover:text-neutral-900 transition-all flex items-center justify-center cursor-pointer"
                                                                title="Delete quotation"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile View: Dedicated Card Views */}
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
                                                <div className="text-right">
                                                    <span className="text-sm font-semibold text-[#1A4D2E]">
                                                        ₹{quote.total_amount}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="bg-neutral-50/70 rounded-xl p-2.5 space-y-1.5 text-xs">
                                                <div className="font-bold text-neutral-900 flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <User size={13} className="text-emerald-700 shrink-0" />
                                                        <span>{quote.client_name}</span>
                                                    </div>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                        quote.workflow_status === 'approved'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : quote.workflow_status === 'rejected'
                                                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}>
                                                        {quote.workflow_status_label}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                                                    <Phone size={11} className="text-neutral-400 shrink-0" />
                                                    <span>{quote.client_phone}</span>
                                                </div>
                                            </div>

                                            {/* Action bar on Mobile */}
                                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100">
                                                <div className="flex items-center gap-1.5">
                                                    {quote.is_editable && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditQuotation(quote)}
                                                            className="py-1 px-2.5 rounded-xl bg-neutral-100 text-neutral-700 font-semibold text-xs flex items-center gap-1"
                                                        >
                                                            <Edit3 size={11} />
                                                            <span>Edit</span>
                                                        </button>
                                                    )}
                                                    {quote.workflow_status === 'approval_pending' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleApproveQuotation(quote)}
                                                                className="py-1 px-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center gap-1"
                                                            >
                                                                <CheckCircle2 size={11} />
                                                                <span>Approve</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setQuotationToReject(quote);
                                                                    setRejectionReason('');
                                                                }}
                                                                className="py-1 px-2.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs flex items-center gap-1"
                                                            >
                                                                <XCircle size={11} />
                                                                <span>Reject</span>
                                                            </button>
                                                        </>
                                                    )}
                                                    {quote.workflow_status === 'approved' && onNavigate && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onNavigate('agreement', { quotation: quote, quotationId: quote.id })}
                                                            className="py-1 px-3 rounded-xl bg-[#1A4D2E] text-white font-bold text-xs flex items-center gap-1"
                                                        >
                                                            <FileSignature size={11} />
                                                            <span>Generate Agreement</span>
                                                        </button>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => setQuotationToDelete(quote)}
                                                    className="p-1.5 rounded-xl bg-neutral-100 text-neutral-600 hover:text-red-600"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Pagination
                                    currentPage={currentPage}
                                    totalItems={totalItems}
                                    perPage={perPage}
                                    onPageChange={setCurrentPage}
                                    onPerPageChange={setPerPage}
                                    itemLabel="quotations"
                                />
                            </>
                        );
                    })()}
                </div>
            )}

            {/* Reject Quotation Modal */}
            {quotationToReject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                    <XCircle size={22} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-neutral-900">
                                        Mark as Rejected by Client
                                    </h3>
                                    <p className="text-xs text-neutral-500">
                                        Quotation #{quotationToReject.ref_no} ({quotationToReject.client_name})
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setQuotationToReject(null)}
                                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-neutral-700">
                                Reason for Rejection (Optional)
                            </label>
                            <textarea
                                rows={3}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="E.g., Client requested different capacity, budget constraints, postponed installation..."
                                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 outline-none focus:border-rose-500 focus:bg-white resize-none"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100">
                            <button
                                type="button"
                                onClick={() => setQuotationToReject(null)}
                                className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isRejecting}
                                onClick={handleConfirmReject}
                                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                            >
                                {isRejecting ? <RefreshCw size={13} className="animate-spin" /> : null}
                                <span>Confirm Rejection</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Embedded PDF Preview Modal */}
            {previewPdfUrl && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/75 backdrop-blur-xs animate-in fade-in duration-200"
                    onClick={() => setPreviewPdfUrl(null)}
                >
                    <div 
                        className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl border border-neutral-100 overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-neutral-200/80 flex items-center justify-between bg-neutral-50/80">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#1A4D2E] flex items-center justify-center">
                                    <FileText size={16} />
                                </div>
                                <h3 className="text-sm font-bold text-neutral-900 leading-tight">
                                    {previewPdfTitle}
                                </h3>
                            </div>

                            <div className="flex items-center gap-2">
                                <a
                                    href={previewPdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                                >
                                    <ExternalLink size={13} />
                                    <span>New Tab</span>
                                </a>
                                <a
                                    href={previewPdfUrl}
                                    download="Solar_Quotation.pdf"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1A4D2E] hover:bg-[#143c24] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                                >
                                    <Download size={13} />
                                    <span>Download</span>
                                </a>
                                <button
                                    onClick={() => setPreviewPdfUrl(null)}
                                    className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 flex items-center justify-center transition-all cursor-pointer ml-1"
                                >
                                    <X size={15} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 bg-neutral-200 relative">
                            <iframe src={previewPdfUrl} title={previewPdfTitle} className="w-full h-full border-none" />
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            <ConfirmDeleteModal
                isOpen={!!quotationToDelete}
                onClose={() => setQuotationToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Quotation"
                itemName={quotationToDelete ? `${quotationToDelete.client_name} (${quotationToDelete.ref_no})` : ''}
                itemType="quotation"
                message="Are you sure you want to permanently delete this quotation record and its archived PDF file? This cannot be undone."
                isDeleting={isDeleting}
                confirmText="Yes, Delete Quotation"
            />
        </div>
    );
};
