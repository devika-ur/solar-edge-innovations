import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    Mail,
    Search,
    RefreshCw,
    Clock,
    CheckCircle2,
    Phone,
    MapPin,
    Calendar,
    MessageSquare,
    Trash2,
    Eye,
    X,
    Send,
    Check,
    Copy
} from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

export const InquiryManager = ({ onUnauthorized }) => {
    const [inquiries, setInquiries] = useState([]);
    const [counts, setCounts] = useState({ total: 0, pending: 0, responded: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'responded'
    const [updatingStatusId, setUpdatingStatusId] = useState(null);

    // Detail Modal state
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [isSavingNotes, setIsSavingNotes] = useState(false);

    // Delete Modal state
    const [inquiryToDelete, setInquiryToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadInquiries = async (isManual = false) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (searchQuery.trim()) params.append('search', searchQuery.trim());

            const url = `/api/admin-inquiries.php?${params.toString()}`;
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
                setInquiries(data.data || []);
                if (data.counts) {
                    setCounts(data.counts);
                }
                if (isManual) toast.success('Inquiries refreshed!');
            } else {
                toast.error(data.message || 'Failed to load inquiries.');
            }
        } catch {
            toast.error('Unable to connect to inquiries server.');
        } finally {
            setIsLoading(false);
        }
    };

    // Load inquiries on filter changes
    useEffect(() => {
        loadInquiries();
    }, [statusFilter]);

    // Handle search query with slight debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            loadInquiries();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Toggle Responded Status
    const handleToggleStatus = async (inquiry, e) => {
        if (e) e.stopPropagation();
        setUpdatingStatusId(inquiry.id);

        const willBeResponded = inquiry.status !== 'responded';
        const toastId = toast.loading(
            willBeResponded ? 'Marking inquiry as responded...' : 'Marking inquiry as pending...'
        );

        try {
            const res = await fetch('/api/admin-inquiries.php', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'toggle_status',
                    id: inquiry.id
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(data.message || 'Status updated successfully!', { id: toastId });

                // Update local inquiries list
                setInquiries((prev) =>
                    prev.map((item) =>
                        item.id === inquiry.id
                            ? {
                                  ...item,
                                  status: data.inquiry.status,
                                  is_responded: data.inquiry.is_responded,
                                  responded_at: data.inquiry.responded_at,
                                  responded_at_formatted: data.inquiry.responded_at_formatted,
                                  responded_by: data.inquiry.responded_by
                              }
                            : item
                    )
                );

                // Update modal if currently opened
                if (selectedInquiry && selectedInquiry.id === inquiry.id) {
                    setSelectedInquiry((prev) => ({
                        ...prev,
                        status: data.inquiry.status,
                        is_responded: data.inquiry.is_responded,
                        responded_at: data.inquiry.responded_at,
                        responded_at_formatted: data.inquiry.responded_at_formatted,
                        responded_by: data.inquiry.responded_by
                    }));
                }

                // Update counts
                setCounts((prev) => ({
                    ...prev,
                    pending: willBeResponded ? Math.max(0, prev.pending - 1) : prev.pending + 1,
                    responded: willBeResponded ? prev.responded + 1 : Math.max(0, prev.responded - 1)
                }));
            } else {
                toast.error(data.message || 'Failed to update status.', { id: toastId });
            }
        } catch {
            toast.error('Network error updating inquiry status.', { id: toastId });
        } finally {
            setUpdatingStatusId(null);
        }
    };

    // Open detail modal
    const openDetailModal = (inquiry) => {
        setSelectedInquiry(inquiry);
        setAdminNotes(inquiry.admin_notes || '');
        setIsDetailModalOpen(true);
    };

    // Save Admin Notes
    const handleSaveNotes = async () => {
        if (!selectedInquiry) return;
        setIsSavingNotes(true);
        const toastId = toast.loading('Saving internal notes...');

        try {
            const res = await fetch('/api/admin-inquiries.php', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'update_notes',
                    id: selectedInquiry.id,
                    admin_notes: adminNotes
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success('Internal notes saved!', { id: toastId });
                // Update in inquiries state
                setInquiries((prev) =>
                    prev.map((item) =>
                        item.id === selectedInquiry.id ? { ...item, admin_notes: adminNotes } : item
                    )
                );
                setSelectedInquiry((prev) => ({ ...prev, admin_notes: adminNotes }));
            } else {
                toast.error(data.message || 'Failed to save notes.', { id: toastId });
            }
        } catch {
            toast.error('Error saving notes.', { id: toastId });
        } finally {
            setIsSavingNotes(false);
        }
    };

    // Delete Inquiry
    const confirmDeleteInquiry = async () => {
        if (!inquiryToDelete) return;
        setIsDeleting(true);
        const toastId = toast.loading('Deleting inquiry record...');

        try {
            const res = await fetch('/api/admin-inquiries.php', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'delete',
                    id: inquiryToDelete.id
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success('Inquiry record deleted successfully.', { id: toastId });

                // Remove from list
                setInquiries((prev) => prev.filter((item) => item.id !== inquiryToDelete.id));

                // Decrement counts
                const wasPending = inquiryToDelete.status === 'pending';
                setCounts((prev) => ({
                    total: Math.max(0, prev.total - 1),
                    pending: wasPending ? Math.max(0, prev.pending - 1) : prev.pending,
                    responded: !wasPending ? Math.max(0, prev.responded - 1) : prev.responded
                }));

                if (selectedInquiry && selectedInquiry.id === inquiryToDelete.id) {
                    setIsDetailModalOpen(false);
                    setSelectedInquiry(null);
                }
                setInquiryToDelete(null);
            } else {
                toast.error(data.message || 'Failed to delete inquiry.', { id: toastId });
            }
        } catch {
            toast.error('Error deleting inquiry.', { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    // Copy to clipboard helper
    const handleCopy = (text, label) => {
        navigator.clipboard.writeText(text);
        toast.success(`Copied ${label} to clipboard!`);
    };

    // Clean phone number for WhatsApp
    const formatWhatsAppUrl = (phone, name, service) => {
        const cleanPhone = phone.replace(/[^\d]/g, '');
        const fullNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
        const msg = encodeURIComponent(
            `Hello ${name}, thank you for contacting Solar Edge Innovations regarding ${service}. How can our technical engineering team assist you today?`
        );
        return `https://wa.me/${fullNumber}?text=${msg}`;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
            {/* Top Heading & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#1A4D2E] font-bold tracking-widest uppercase font-mono bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                            Communications & Leads
                        </span>
                        {counts.pending > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                {counts.pending} Action Required
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1 font-playfair">
                        Contact Form Inquiries
                    </h1>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                        Track messages submitted by website visitors, respond to customer leads, and update contact response statuses.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => loadInquiries(true)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
                        title="Refresh inquiries list"
                    >
                        <RefreshCw size={13} className={isLoading ? 'animate-spin text-[#1A4D2E]' : ''} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Inquiries */}
                <div
                    onClick={() => setStatusFilter('all')}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                        statusFilter === 'all'
                            ? 'bg-white border-[#1A4D2E] ring-2 ring-[#1A4D2E]/10 shadow-sm'
                            : 'bg-white border-neutral-200/80 hover:border-neutral-300 shadow-2xs'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                            Total Received
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Mail size={18} />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-neutral-900 font-mono">
                            {counts.total}
                        </span>
                        <span className="text-xs text-neutral-500 font-medium">all inquiries</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1">Submitted through website</p>
                </div>

                {/* Pending Response */}
                <div
                    onClick={() => setStatusFilter('pending')}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                        statusFilter === 'pending'
                            ? 'bg-amber-50/50 border-amber-500 ring-2 ring-amber-500/10 shadow-sm'
                            : 'bg-white border-neutral-200/80 hover:border-amber-200 shadow-2xs'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                            Pending Response
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-amber-100/70 text-amber-600 flex items-center justify-center">
                            <Clock size={18} />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-amber-800 font-mono">
                            {counts.pending}
                        </span>
                        <span className="text-xs text-amber-700/80 font-medium">awaiting contact</span>
                    </div>
                    <p className="text-[11px] text-amber-600/80 mt-1">Needs customer callback or email</p>
                </div>

                {/* Responded */}
                <div
                    onClick={() => setStatusFilter('responded')}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                        statusFilter === 'responded'
                            ? 'bg-emerald-50/50 border-emerald-600 ring-2 ring-emerald-600/10 shadow-sm'
                            : 'bg-white border-neutral-200/80 hover:border-emerald-200 shadow-2xs'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                            Responded
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center">
                            <CheckCircle2 size={18} />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-emerald-900 font-mono">
                            {counts.responded}
                        </span>
                        <span className="text-xs text-emerald-700/80 font-medium">contacted</span>
                    </div>
                    <p className="text-[11px] text-emerald-600/80 mt-1">
                        {counts.total > 0
                            ? `${Math.round((counts.responded / counts.total) * 100)}% response resolution rate`
                            : 'All inquiries answered'}
                    </p>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Status Tab Filters */}
                <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl border border-neutral-200/60 overflow-x-auto">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            statusFilter === 'all'
                                ? 'bg-white text-neutral-900 shadow-2xs'
                                : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                    >
                        All ({counts.total})
                    </button>
                    <button
                        onClick={() => setStatusFilter('pending')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            statusFilter === 'pending'
                                ? 'bg-amber-500 text-white shadow-2xs'
                                : 'text-amber-800 hover:text-amber-900'
                        }`}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Pending ({counts.pending})
                    </button>
                    <button
                        onClick={() => setStatusFilter('responded')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            statusFilter === 'responded'
                                ? 'bg-[#1A4D2E] text-white shadow-2xs'
                                : 'text-emerald-800 hover:text-emerald-900'
                        }`}
                    >
                        <Check size={12} />
                        Responded ({counts.responded})
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative flex-1 md:max-w-md">
                    <Search
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by customer name, phone, email, place..."
                        className="w-full pl-9 pr-8 py-2 text-xs bg-neutral-50 hover:bg-neutral-100/60 focus:bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-[#1A4D2E] focus:ring-2 focus:ring-[#1A4D2E]/10 transition-all font-sans"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 rounded cursor-pointer"
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>
            </div>

            {/* Inquiries Table / Cards Container */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xs overflow-hidden">
                {isLoading ? (
                    <div className="p-16 flex flex-col items-center justify-center text-center space-y-3">
                        <RefreshCw size={28} className="animate-spin text-[#1A4D2E]" />
                        <p className="text-xs text-neutral-500 font-medium">
                            Retrieving latest contact inquiries from database...
                        </p>
                    </div>
                ) : inquiries.length === 0 ? (
                    <div className="p-16 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center">
                            <Mail size={32} />
                        </div>
                        <div className="space-y-1 max-w-sm">
                            <h3 className="text-base font-bold text-neutral-900">
                                {searchQuery ? 'No matching inquiries found' : 'No inquiries recorded yet'}
                            </h3>
                            <p className="text-xs text-neutral-500 leading-relaxed">
                                {searchQuery
                                    ? `No inquiry matched "${searchQuery}". Try searching with another name, phone number, or place.`
                                    : 'When customers submit inquiries via the website contact form, they will appear here in real time.'}
                            </p>
                        </div>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
                            >
                                Clear Search Filter
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-200/80 bg-neutral-50/75 text-[11px] font-bold text-neutral-500 uppercase tracking-wider font-mono">
                                    <th className="py-3.5 px-4 sm:px-6">Status & Received</th>
                                    <th className="py-3.5 px-4 sm:px-6">Customer Details</th>
                                    <th className="py-3.5 px-4 sm:px-6">Service & Location</th>
                                    <th className="py-3.5 px-4 sm:px-6">Message Preview</th>
                                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 text-xs">
                                {inquiries.map((inquiry) => {
                                    const isResponded = inquiry.status === 'responded';
                                    const isUpdating = updatingStatusId === inquiry.id;

                                    return (
                                        <tr
                                            key={inquiry.id}
                                            onClick={() => openDetailModal(inquiry)}
                                            className={`group transition-colors cursor-pointer hover:bg-neutral-50/80 ${
                                                !isResponded ? 'bg-amber-50/20' : ''
                                            }`}
                                        >
                                            {/* Status & Received Date */}
                                            <td className="py-4 px-4 sm:px-6 align-top">
                                                <div className="space-y-2">
                                                    {isResponded ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <CheckCircle2 size={12} className="text-emerald-600" />
                                                            Responded
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                                            Pending Response
                                                        </span>
                                                    )}

                                                    <div className="text-[11px] text-neutral-400 space-y-0.5">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar size={11} />
                                                            <span>{inquiry.created_at_human || inquiry.created_at_formatted}</span>
                                                        </div>
                                                        {inquiry.responded_at_formatted && (
                                                            <div className="text-[10px] text-emerald-600 font-medium">
                                                                Done {inquiry.responded_at_formatted}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Customer Details */}
                                            <td className="py-4 px-4 sm:px-6 align-top">
                                                <div className="space-y-1">
                                                    <div className="font-bold text-neutral-900 text-sm">
                                                        {inquiry.name}
                                                    </div>

                                                    <div className="flex flex-col gap-1 text-[11px] text-neutral-600">
                                                        <a
                                                            href={`mailto:${inquiry.email}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="inline-flex items-center gap-1.5 hover:text-[#1A4D2E] hover:underline"
                                                            title="Send Email"
                                                        >
                                                            <Mail size={12} className="text-neutral-400" />
                                                            <span>{inquiry.email}</span>
                                                        </a>

                                                        <div className="flex items-center gap-2">
                                                            <a
                                                                href={`tel:${inquiry.phone}`}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="inline-flex items-center gap-1.5 hover:text-[#1A4D2E] font-mono hover:underline"
                                                                title="Call Phone Number"
                                                            >
                                                                <Phone size={12} className="text-neutral-400" />
                                                                <span>{inquiry.phone}</span>
                                                            </a>

                                                            <a
                                                                href={formatWhatsAppUrl(
                                                                    inquiry.phone,
                                                                    inquiry.name,
                                                                    inquiry.service
                                                                )}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors"
                                                                title="Chat on WhatsApp"
                                                            >
                                                                WhatsApp
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Service & Location */}
                                            <td className="py-4 px-4 sm:px-6 align-top">
                                                <div className="space-y-1.5">
                                                    <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-200/80">
                                                        {inquiry.service}
                                                    </span>

                                                    <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                                                        <MapPin size={11} className="text-neutral-400 shrink-0" />
                                                        <span className="truncate max-w-[180px]">
                                                            {inquiry.place}, {inquiry.district}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Message Excerpt */}
                                            <td className="py-4 px-4 sm:px-6 align-top max-w-xs">
                                                <p className="text-neutral-700 line-clamp-2 leading-relaxed">
                                                    {inquiry.message}
                                                </p>
                                                {inquiry.admin_notes && (
                                                    <div className="mt-1.5 text-[10px] text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-100 inline-block line-clamp-1">
                                                        Note: {inquiry.admin_notes}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Action Buttons */}
                                            <td className="py-4 px-4 sm:px-6 align-top text-right whitespace-nowrap">
                                                <div
                                                    className="flex items-center justify-end gap-1.5"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {/* Mark as Responded / Pending Toggle Button */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleToggleStatus(inquiry, e)}
                                                        disabled={isUpdating}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                                                            isResponded
                                                                ? 'bg-neutral-100 hover:bg-amber-50 hover:text-amber-700 text-neutral-600 border border-neutral-200'
                                                                : 'bg-[#1A4D2E] hover:bg-[#143d24] text-white border border-emerald-800'
                                                        }`}
                                                        title={
                                                            isResponded
                                                                ? 'Click to mark as Pending Response'
                                                                : 'Click to mark as Responded'
                                                        }
                                                    >
                                                        {isUpdating ? (
                                                            <RefreshCw size={12} className="animate-spin" />
                                                        ) : isResponded ? (
                                                            <>
                                                                <Clock size={12} />
                                                                <span className="hidden sm:inline">Set Pending</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Check size={12} />
                                                                <span>Mark Responded</span>
                                                            </>
                                                        )}
                                                    </button>

                                                    {/* View Full Message / Details */}
                                                    <button
                                                        type="button"
                                                        onClick={() => openDetailModal(inquiry)}
                                                        className="p-1.5 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 cursor-pointer transition-colors"
                                                        title="View full details and reply"
                                                    >
                                                        <Eye size={14} />
                                                    </button>

                                                    {/* Delete Inquiry */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setInquiryToDelete(inquiry)}
                                                        className="p-1.5 rounded-xl border border-neutral-200 bg-white text-neutral-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 cursor-pointer transition-colors"
                                                        title="Delete inquiry record"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Inquiry Details & Reply Drawer / Modal */}
            {isDetailModalOpen && selectedInquiry && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
                    onClick={() => setIsDetailModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-neutral-100 space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#1A4D2E] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                        Inquiry #{selectedInquiry.id}
                                    </span>
                                    {selectedInquiry.status === 'responded' ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                            <CheckCircle2 size={11} /> Responded
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                                            <Clock size={11} /> Pending Response
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold font-playfair text-neutral-900">
                                    {selectedInquiry.name}
                                </h3>
                                <p className="text-xs text-neutral-400">
                                    Submitted {selectedInquiry.created_at_formatted} ({selectedInquiry.created_at_human})
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsDetailModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-700 transition-colors cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Customer Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-200/70 text-xs">
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                                    Email Address
                                </span>
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-neutral-800 break-all">
                                        {selectedInquiry.email}
                                    </span>
                                    <button
                                        onClick={() => handleCopy(selectedInquiry.email, 'Email')}
                                        className="text-neutral-400 hover:text-neutral-700 p-1"
                                        title="Copy Email"
                                    >
                                        <Copy size={12} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                                    Phone Number
                                </span>
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-neutral-800 font-mono">
                                        {selectedInquiry.phone}
                                    </span>
                                    <button
                                        onClick={() => handleCopy(selectedInquiry.phone, 'Phone')}
                                        className="text-neutral-400 hover:text-neutral-700 p-1"
                                        title="Copy Phone"
                                    >
                                        <Copy size={12} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1 sm:pt-2 border-t border-neutral-200/50">
                                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                                    Requested Service
                                </span>
                                <p className="font-semibold text-[#1A4D2E]">
                                    {selectedInquiry.service}
                                </p>
                            </div>

                            <div className="space-y-1 sm:pt-2 border-t border-neutral-200/50">
                                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                                    Location / District
                                </span>
                                <p className="font-semibold text-neutral-800">
                                    {selectedInquiry.place}, {selectedInquiry.district}
                                </p>
                            </div>
                        </div>

                        {/* Customer Inquiry Message */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono flex items-center gap-1.5">
                                    <MessageSquare size={13} />
                                    Customer Message
                                </span>
                                <button
                                    onClick={() => handleCopy(selectedInquiry.message, 'Message')}
                                    className="text-[11px] text-neutral-500 hover:text-neutral-800 flex items-center gap-1 cursor-pointer"
                                >
                                    <Copy size={11} /> Copy Message
                                </button>
                            </div>
                            <div className="p-4 bg-white rounded-2xl border border-neutral-200 text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap shadow-2xs font-sans">
                                {selectedInquiry.message}
                            </div>
                        </div>

                        {/* Quick Contact & Reply Actions */}
                        <div className="space-y-2 pt-2 border-t border-neutral-100">
                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono">
                                Quick Reach-out Actions
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                {/* Email */}
                                <a
                                    href={`mailto:${selectedInquiry.email}?subject=Regarding your Solar Inquiry - Solar Edge Innovations&body=Hello ${encodeURIComponent(
                                        selectedInquiry.name
                                    )},%0D%0A%0D%0AThank you for contacting Solar Edge Innovations regarding ${encodeURIComponent(
                                        selectedInquiry.service
                                    )} in ${encodeURIComponent(
                                        selectedInquiry.place
                                    )}.%0D%0A%0D%0A`}
                                    className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-colors shadow-2xs"
                                >
                                    <Mail size={14} />
                                    <span>Send Email Reply</span>
                                </a>

                                {/* WhatsApp */}
                                <a
                                    href={formatWhatsAppUrl(
                                        selectedInquiry.phone,
                                        selectedInquiry.name,
                                        selectedInquiry.service
                                    )}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-green-300 bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-colors shadow-2xs"
                                >
                                    <Send size={14} />
                                    <span>Open WhatsApp</span>
                                </a>

                                {/* Phone Call */}
                                <a
                                    href={`tel:${selectedInquiry.phone}`}
                                    className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-neutral-200 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-colors shadow-2xs"
                                >
                                    <Phone size={14} />
                                    <span>Call {selectedInquiry.phone}</span>
                                </a>
                            </div>
                        </div>

                        {/* Status Toggle & Internal Admin Notes */}
                        <div className="space-y-3 pt-2 border-t border-neutral-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono">
                                        Response Status
                                    </h4>
                                    <p className="text-[11px] text-neutral-400">
                                        {selectedInquiry.status === 'responded'
                                            ? `Marked as responded on ${selectedInquiry.responded_at_formatted || 'recently'}`
                                            : 'This inquiry currently needs follow-up from the team.'}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleToggleStatus(selectedInquiry)}
                                    disabled={updatingStatusId === selectedInquiry.id}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                                        selectedInquiry.status === 'responded'
                                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300'
                                            : 'bg-[#1A4D2E] hover:bg-[#143d24] text-white border border-emerald-900'
                                    }`}
                                >
                                    {selectedInquiry.status === 'responded' ? (
                                        <>
                                            <Clock size={13} />
                                            <span>Change to Pending</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check size={13} />
                                            <span>Mark as Responded</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Internal Admin Notes */}
                            <div className="space-y-1.5 pt-2">
                                <label className="text-xs font-bold text-neutral-700 flex items-center justify-between">
                                    <span>Internal Team Notes</span>
                                    <span className="text-[10px] text-neutral-400 font-normal">
                                        (Private to admin)
                                    </span>
                                </label>
                                <textarea
                                    rows={2}
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add notes e.g., 'Called customer on Oct 3, sent 5kW quote, scheduled site survey for Saturday'..."
                                    className="w-full p-3 text-xs bg-neutral-50 focus:bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-[#1A4D2E] focus:ring-2 focus:ring-[#1A4D2E]/10 font-sans"
                                />
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleSaveNotes}
                                        disabled={isSavingNotes}
                                        className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        {isSavingNotes ? 'Saving...' : 'Save Notes'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                            <button
                                type="button"
                                onClick={() => {
                                    setInquiryToDelete(selectedInquiry);
                                }}
                                className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-semibold p-1 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                            >
                                <Trash2 size={13} />
                                <span>Delete Record</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsDetailModalOpen(false)}
                                className="px-5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-colors cursor-pointer"
                            >
                                Close Window
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            <ConfirmDeleteModal
                isOpen={!!inquiryToDelete}
                onClose={() => setInquiryToDelete(null)}
                onConfirm={confirmDeleteInquiry}
                title="Delete Inquiry Record"
                itemName={inquiryToDelete?.name || 'this customer inquiry'}
                itemType="inquiry"
                message={`Are you sure you want to permanently delete the inquiry submitted by "${inquiryToDelete?.name}"? This action cannot be undone.`}
                isDeleting={isDeleting}
                confirmText="Yes, Delete Inquiry"
                cancelText="Keep Inquiry"
            />
        </div>
    );
};
