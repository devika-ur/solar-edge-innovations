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
    ArrowUpRight,
    User,
    Phone,
    MapPin,
    Zap,
    IndianRupee,
    X,
    Filter,
    Clock,
    Plus,
    CheckCircle,
    ExternalLink
} from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

export const QuotationHistoryManager = ({ onNavigate, onUnauthorized }) => {
    const [quotations, setQuotations] = useState([]);
    const [stats, setStats] = useState({ total: 0, today: 0, this_month: 0, filtered_count: 0 });
    const [isLoading, setIsLoading] = useState(true);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [datePreset, setDatePreset] = useState('all'); // 'all' | 'today' | 'week' | 'month' | 'custom'
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Delete Modal state
    const [quotationToDelete, setQuotationToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    // Trigger load when filters change
    useEffect(() => {
        setCurrentPage(1);
        loadQuotations();
    }, [startDate, endDate]);

    // Handle search form submit or debounce
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        loadQuotations();
    };

    // Reset all filters
    const handleResetFilters = () => {
        setSearchQuery('');
        setDatePreset('all');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
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
        <div className="w-full px-4 sm:px-8 py-8 space-y-6 font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-neutral-200/80 shadow-xs">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
                        <History size={13} className="text-[#1A4D2E]" />
                        <span>Database History & Archives</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                        Quotation History
                    </h1>
                    <p className="text-xs sm:text-sm text-neutral-500">
                        View, search, filter and download all saved client quotations and generated PDF files.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => loadQuotations(true)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
                        title="Refresh data"
                    >
                        <RefreshCw size={14} className={isLoading ? "animate-spin text-[#1A4D2E]" : ""} />
                        <span>Refresh</span>
                    </button>

                    {onNavigate && (
                        <button
                            onClick={() => onNavigate('quotation')}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A4D2E] hover:bg-[#143c24] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
                        >
                            <Plus size={15} />
                            <span>Create New Quotation</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
                    <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Saved</div>
                    <div className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">{stats.total}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">All archived quotations</div>
                </div>
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
                    <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Saved Today</div>
                    <div className="text-2xl sm:text-3xl font-black text-[#1A4D2E] mt-1">{stats.today}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">Created today</div>
                </div>
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
                    <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">This Month</div>
                    <div className="text-2xl sm:text-3xl font-black text-blue-900 mt-1">{stats.this_month}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">Current month</div>
                </div>
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
                    <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Matching Filter</div>
                    <div className="text-2xl sm:text-3xl font-black text-neutral-800 mt-1">{quotations.length}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">Active search/date results</div>
                </div>
            </div>

            {/* Filter Controls Bar */}
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

                {/* Custom Date Range Picker */}
                {(datePreset === 'custom' || startDate || endDate) && (
                    <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center gap-3 animate-in fade-in duration-150">
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-neutral-600">From:</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setDatePreset('custom');
                                    setStartDate(e.target.value);
                                }}
                                className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:border-[#1A4D2E]"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-neutral-600">To:</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                    setDatePreset('custom');
                                    setEndDate(e.target.value);
                                }}
                                className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:border-[#1A4D2E]"
                            />
                        </div>

                        {(startDate || endDate || searchQuery) && (
                            <button
                                onClick={handleResetFilters}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl transition-all cursor-pointer ml-auto"
                            >
                                <X size={13} />
                                <span>Reset Filters</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

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
                            {startDate || endDate || searchQuery
                                ? "No quotations matched your active search and date filters. Try adjusting or clearing your filters."
                                : "You haven't saved any quotations to history yet. Open the Quotation Builder, create a quote, and click Save."}
                        </p>
                    </div>
                    <div className="pt-2 flex items-center justify-center gap-3">
                        {(startDate || endDate || searchQuery) ? (
                            <button
                                onClick={handleResetFilters}
                                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 hover:text-neutral-900 font-semibold rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
                            >
                                Clear Filters
                            </button>
                        ) : onNavigate ? (
                            <button
                                onClick={() => onNavigate('quotation')}
                                className="inline-flex items-center gap-2 px-5 py-2 bg-[#1A4D2E] hover:bg-[#143c24] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
                            >
                                <Plus size={14} />
                                <span>Open Quotation Builder</span>
                            </button>
                        ) : null}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xs overflow-hidden">
                    {(() => {
                        const totalItems = quotations.length;
                        const totalPages = Math.ceil(totalItems / perPage) || 1;
                        const paginatedQuotations = quotations.slice((currentPage - 1) * perPage, currentPage * perPage);

                        return (
                            <>
                                {/* Desktop View: Full Responsive Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-neutral-50/80 border-b border-neutral-200/80 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                                                <th className="py-3.5 px-3 sm:px-4 text-center w-12 font-mono">#</th>
                                                <th className="py-3.5 px-4 sm:px-6">Ref & Date</th>
                                                <th className="py-3.5 px-4">Client Details</th>
                                                <th className="py-3.5 px-4">System Specs</th>
                                                <th className="py-3.5 px-4">Total Amount</th>
                                                <th className="py-3.5 px-4 text-center">PDF Document</th>
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
                                                            <span>{quote.created_at_formatted}</span>
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
                                                        <div className="font-black text-[#1A4D2E] text-sm">
                                                            ₹{quote.total_amount}
                                                        </div>
                                                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                                                            Project Cost
                                                        </span>
                                                    </td>

                                                    {/* PDF Document Column */}
                                                    <td className="py-4 px-4 text-center">
                                                        {quote.pdf_url ? (
                                                            <div className="inline-flex items-center gap-1.5">
                                                                <button
                                                                    onClick={() => {
                                                                        setPreviewPdfUrl(quote.pdf_url);
                                                                        setPreviewPdfTitle(`Quotation: ${quote.client_name} (${quote.ref_no})`);
                                                                    }}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 font-semibold text-xs transition-all cursor-pointer"
                                                                    title="View PDF Document"
                                                                >
                                                                    <Eye size={13} />
                                                                    <span>Preview</span>
                                                                </button>
                                                                <a
                                                                    href={quote.pdf_url}
                                                                    download={`Quotation_${quote.client_name}.pdf`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A4D2E] hover:bg-[#143c24] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                                                                    title="Download PDF File"
                                                                >
                                                                    <Download size={13} />
                                                                </a>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[11px] text-neutral-400 italic">
                                                                No PDF
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="py-4 px-4 sm:px-6 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => setQuotationToDelete(quote)}
                                                                className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 hover:text-neutral-900 transition-all flex items-center justify-center cursor-pointer"
                                                                title="Delete quotation"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile View: Dedicated Card Views for Each Row */}
                                <div className="block md:hidden p-3.5 space-y-3 bg-neutral-50/50">
                                    {paginatedQuotations.map((quote, idx) => (
                                        <div
                                            key={quote.id}
                                            className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs space-y-3"
                                        >
                                            {/* Top Row: Serial, Ref No & Total Amount */}
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
                                                    <span className="text-sm font-black text-[#1A4D2E]">
                                                        ₹{quote.total_amount}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Client Details Card */}
                                            <div className="bg-neutral-50/70 rounded-xl p-2.5 space-y-1.5 text-xs">
                                                <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                                                    <User size={13} className="text-emerald-700 shrink-0" />
                                                    <span>{quote.client_name}</span>
                                                </div>
                                                <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                                                    <Phone size={11} className="text-neutral-400 shrink-0" />
                                                    <a
                                                        href={`tel:${quote.client_phone}`}
                                                        className="hover:text-[#1A4D2E] hover:underline"
                                                    >
                                                        {quote.client_phone}
                                                    </a>
                                                </div>
                                                {quote.client_address !== '-' && (
                                                    <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                                                        <MapPin size={11} className="text-neutral-400 shrink-0" />
                                                        <span className="truncate">{quote.client_address}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* System Specs & Date */}
                                            <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-0.5">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-[#1A4D2E] font-bold text-[10px]">
                                                        <Zap size={11} className="text-amber-500 fill-amber-500" />
                                                        <span>{quote.capacity}</span>
                                                    </div>
                                                    <span className="text-neutral-600 font-medium truncate max-w-[130px]">
                                                        {quote.system_type}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-neutral-400 text-[10px]">
                                                    <Clock size={10} />
                                                    <span>{quote.created_at_formatted}</span>
                                                </div>
                                            </div>

                                            {/* Actions Bar (Styled with 3 standard button styles) */}
                                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100">
                                                <div className="flex items-center gap-2 flex-1">
                                                    {quote.pdf_url ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setPreviewPdfUrl(quote.pdf_url);
                                                                    setPreviewPdfTitle(`Quotation: ${quote.client_name} (${quote.ref_no})`);
                                                                }}
                                                                className="flex-1 py-1.5 px-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 font-semibold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                                                            >
                                                                <Eye size={12} />
                                                                <span>Preview</span>
                                                            </button>
                                                            <a
                                                                href={quote.pdf_url}
                                                                download={`Quotation_${quote.client_name}.pdf`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="py-1.5 px-3 rounded-xl bg-[#1A4D2E] hover:bg-[#143c24] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                                                            >
                                                                <Download size={12} />
                                                                <span>PDF</span>
                                                            </a>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-neutral-400 italic">No PDF generated</span>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => setQuotationToDelete(quote)}
                                                    className="p-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 hover:text-red-600 transition-all flex items-center justify-center cursor-pointer"
                                                    title="Delete quotation"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination Footer Controls */}
                                {totalItems > 0 && (
                                    <div className="px-6 py-3.5 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-50/50">
                                        <div className="flex items-center gap-3 text-xs text-neutral-500">
                                            <span>
                                                Showing <strong className="text-neutral-800 font-semibold">{totalItems === 0 ? 0 : (currentPage - 1) * perPage + 1}</strong> to <strong className="text-neutral-800 font-semibold">{Math.min(currentPage * perPage, totalItems)}</strong> of <strong className="text-neutral-800 font-semibold">{totalItems}</strong> quotations
                                            </span>
                                            <div className="flex items-center gap-1.5 ml-2">
                                                <span className="text-[11px] text-neutral-400">Per page:</span>
                                                <select
                                                    value={perPage}
                                                    onChange={(e) => {
                                                        setPerPage(Number(e.target.value));
                                                        setCurrentPage(1);
                                                    }}
                                                    className="bg-white border border-neutral-300 rounded-lg px-2 py-1 text-xs text-neutral-700 outline-none cursor-pointer"
                                                >
                                                    <option value={5}>5</option>
                                                    <option value={10}>10</option>
                                                    <option value={20}>20</option>
                                                    <option value={50}>50</option>
                                                </select>
                                            </div>
                                        </div>

                                        {totalPages > 1 && (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold cursor-pointer transition-all"
                                                >
                                                    Prev
                                                </button>
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`w-7 h-7 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                            currentPage === page
                                                                ? 'bg-[#1A4D2E] text-white shadow-xs'
                                                                : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold cursor-pointer transition-all"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        );
                    })()}
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
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-neutral-200/80 flex items-center justify-between bg-neutral-50/80">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#1A4D2E] flex items-center justify-center">
                                    <FileText size={16} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-900 leading-tight">
                                        {previewPdfTitle}
                                    </h3>
                                    <span className="text-[10px] text-neutral-500">Official Solar Quotation Document</span>
                                </div>
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

                        {/* Modal Body / iframe */}
                        <div className="flex-1 bg-neutral-200 relative">
                            <iframe
                                src={previewPdfUrl}
                                title={previewPdfTitle}
                                className="w-full h-full border-none"
                            />
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
