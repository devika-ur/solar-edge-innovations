import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
    Activity,
    Search,
    RefreshCw,
    Calendar,
    FileText,
    Download,
    Eye,
    FileSignature,
    CreditCard,
    CheckCircle2,
    Clock,
    XCircle,
    User,
    Phone,
    MapPin,
    Zap,
    IndianRupee,
    ArrowLeft,
    Check,
    ChevronRight,
    AlertCircle,
    X,
    ExternalLink,
    Filter,
    FilterX,
    ShieldAlert,
    Layers,
    Sparkles,
    Loader2
} from 'lucide-react';
import { Pagination } from './Pagination';

const formatINR = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString('en-IN', {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
    });
};

export const ApplicationTrackingManager = ({ onNavigate, onUnauthorized, initialApplicantId = null }) => {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedApplicant, setSelectedApplicant] = useState(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [datePreset, setDatePreset] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showFilter, setShowFilter] = useState(false);

    // PDF Preview Modal
    const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
    const [previewPdfTitle, setPreviewPdfTitle] = useState('');

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

    const loadTrackingData = async (isManual = false) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery.trim()) params.append('search', searchQuery.trim());
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            if (statusFilter !== 'all') params.append('status', statusFilter);

            const res = await fetch(`/api/admin-quotations-tracking.php?${params.toString()}`, {
                credentials: 'include'
            });

            if (res.status === 401) {
                if (onUnauthorized) onUnauthorized();
                return;
            }

            const data = await res.json();
            if (res.ok && data.success) {
                const list = data.data || [];
                setApplications(list);

                // If an initial applicant ID was passed, open it immediately
                if (initialApplicantId && !selectedApplicant) {
                    const match = list.find((a) => String(a.id) === String(initialApplicantId));
                    if (match) setSelectedApplicant(match);
                } else if (selectedApplicant) {
                    // Update currently selected applicant data if present
                    const refreshed = list.find((a) => a.id === selectedApplicant.id);
                    if (refreshed) setSelectedApplicant(refreshed);
                }

                if (isManual) toast.success('Application tracking updated!');
            } else {
                toast.error(data.message || 'Failed to load tracking data.');
            }
        } catch {
            toast.error('Unable to connect to tracking server.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        loadTrackingData();
    }, [startDate, endDate, statusFilter]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        loadTrackingData();
    };

    const [isApproving, setIsApproving] = useState(false);
    const [showApproveConfirmModal, setShowApproveConfirmModal] = useState(false);

    const handleApproveApplicant = async (app) => {
        if (!app) return;
        setIsApproving(true);
        try {
            const res = await fetch(`/api/admin-quotations-approve.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id: app.id })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success(`Quotation #${app.ref_no} marked as Approved by Client! Redirecting to Approved Quotations...`);
                if (onNavigate) {
                    onNavigate('approved-quotations');
                } else {
                    loadTrackingData();
                }
            } else {
                toast.error(data.message || 'Failed to approve quotation.');
            }
        } catch {
            toast.error('Network error approving quotation.');
        } finally {
            setIsApproving(false);
        }
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setDatePreset('all');
        setStartDate('');
        setEndDate('');
        setStatusFilter('all');
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(applications.length / perPage) || 1;
    const paginatedApplications = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return applications.slice(start, start + perPage);
    }, [applications, currentPage, perPage]);

    // Quick counts for badges
    const statusCounts = useMemo(() => {
        return {
            total: applications.length,
            pending: applications.filter(a => a.workflow_status === 'approval_pending').length,
            approved: applications.filter(a => a.workflow_status === 'approved').length,
            agreement: applications.filter(a => a.workflow_status === 'agreement_created').length,
            completed: applications.filter(a => a.workflow_status === 'completed').length,
            rejected: applications.filter(a => a.workflow_status === 'rejected').length,
        };
    }, [applications]);

    // Render individual applicant detail tracking view
    if (selectedApplicant) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto font-poppins animate-in fade-in duration-200">
                {/* Back Button & Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/80 shadow-2xs">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSelectedApplicant(null)}
                            className="p-2.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 transition-all cursor-pointer flex items-center justify-center shrink-0"
                            title="Back to Applicant List"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h2 className="text-lg sm:text-xl font-bold text-neutral-900 leading-tight">
                                    {selectedApplicant.client_name}
                                </h2>
                                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                                    {selectedApplicant.ref_no}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                    selectedApplicant.workflow_status === 'completed'
                                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                                        : selectedApplicant.workflow_status === 'agreement_created'
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : selectedApplicant.workflow_status === 'approved'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : selectedApplicant.workflow_status === 'rejected'
                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                    {selectedApplicant.workflow_status_label}
                                </span>
                            </div>
                            <p className="text-xs text-neutral-500 mt-1 flex items-center gap-2 flex-wrap">
                                <span>Applied: {selectedApplicant.created_at_formatted}</span>
                                <span>•</span>
                                <span>System: {selectedApplicant.capacity} ({selectedApplicant.system_type})</span>
                                <span>•</span>
                                <span>Phone: {selectedApplicant.client_phone}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        {selectedApplicant.pdf_url && (
                            <button
                                type="button"
                                onClick={() => {
                                    setPreviewPdfUrl(selectedApplicant.pdf_url);
                                    setPreviewPdfTitle(`Quotation: ${selectedApplicant.client_name}`);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 text-xs font-semibold transition-all cursor-pointer"
                            >
                                <Eye size={13} />
                                <span>Quote PDF</span>
                            </button>
                        )}
                        {selectedApplicant.agreement_pdf_url && (
                            <button
                                type="button"
                                onClick={() => {
                                    setPreviewPdfUrl(selectedApplicant.agreement_pdf_url);
                                    setPreviewPdfTitle(`Agreement: ${selectedApplicant.client_name}`);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-all cursor-pointer"
                            >
                                <Eye size={13} />
                                <span>Agreement PDF</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Financial Summary Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
                        <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Project Cost</div>
                        <div className="text-xl sm:text-2xl font-bold text-neutral-900 mt-1">₹{selectedApplicant.total_amount}</div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">Approved quotation value</div>
                    </div>
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
                        <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Amount Paid</div>
                        <div className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">₹{formatINR(selectedApplicant.amount_paid)}</div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">Recorded installments</div>
                    </div>
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
                        <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Balance Due</div>
                        <div className="text-xl sm:text-2xl font-bold text-amber-600 mt-1">₹{formatINR(selectedApplicant.balance_amount)}</div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">Remaining outstanding</div>
                    </div>
                </div>

                {/* Complete Chronological Status Tracker (5 Stages) */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-2xs space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-neutral-900">
                            Chronological Application Journey
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                            Real-time milestone progress tracking from initial quotation to final completion
                        </p>
                    </div>

                    <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-neutral-200">
                        {selectedApplicant.stages?.map((stage, idx) => {
                            const isCompleted = stage.is_completed;
                            const isCurrent = stage.is_current;
                            const isRejected = stage.is_rejected;

                            return (
                                <div key={stage.stage || idx} className="relative group">
                                    {/* Timeline Node Icon Indicator */}
                                    <div className={`absolute -left-6 sm:-left-8 top-1 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-2xs ${
                                        isRejected
                                            ? 'bg-rose-500 text-white ring-4 ring-rose-100'
                                            : isCompleted
                                            ? 'bg-[#1A4D2E] text-white ring-4 ring-emerald-100'
                                            : isCurrent
                                            ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                                            : 'bg-neutral-200 text-neutral-500 ring-4 ring-neutral-50'
                                    }`}>
                                        {isRejected ? (
                                            <X size={14} />
                                        ) : isCompleted ? (
                                            <Check size={14} />
                                        ) : (
                                            stage.stage
                                        )}
                                    </div>

                                    {/* Timeline Stage Card */}
                                    <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                                        isRejected
                                            ? 'bg-rose-50/50 border-rose-200'
                                            : isCurrent
                                            ? 'bg-emerald-50/30 border-[#1A4D2E]/40 shadow-xs ring-1 ring-[#1A4D2E]/20'
                                            : isCompleted
                                            ? 'bg-white border-neutral-200 hover:border-emerald-300'
                                            : 'bg-neutral-50/50 border-neutral-200/60 opacity-75'
                                    }`}>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="flex items-center gap-2.5 flex-wrap">
                                                <span className="text-xs font-bold text-neutral-400 font-mono">
                                                    Stage {stage.stage}:
                                                </span>
                                                <h4 className={`text-sm font-bold ${
                                                    isRejected ? 'text-rose-900' : 'text-neutral-900'
                                                }`}>
                                                    {stage.title}
                                                </h4>
                                                {isCurrent && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                                                        Current Stage
                                                    </span>
                                                )}
                                                {isCompleted && !isRejected && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#1A4D2E]">
                                                        Completed
                                                    </span>
                                                )}
                                                {isRejected && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                                                        Rejected
                                                    </span>
                                                )}
                                            </div>

                                            {stage.date && (
                                                <div className="text-[11px] text-neutral-500 flex items-center gap-1 font-medium shrink-0">
                                                    <Clock size={11} className="text-neutral-400" />
                                                    <span>{stage.date}</span>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                                            {stage.details}
                                        </p>

                                        {/* Action Buttons specific to each stage */}
                                        <div className="mt-3.5 pt-3 border-t border-neutral-200/60 flex flex-wrap items-center gap-2">
                                            {stage.key === 'quotation_created' && (
                                                <>
                                                    {stage.pdf_url && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setPreviewPdfUrl(stage.pdf_url);
                                                                setPreviewPdfTitle(`Quotation: ${selectedApplicant.client_name}`);
                                                            }}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold transition-all cursor-pointer"
                                                        >
                                                            <Eye size={12} />
                                                            <span>View Quotation PDF</span>
                                                        </button>
                                                    )}
                                                    {selectedApplicant.workflow_status === 'approval_pending' && onNavigate && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onNavigate('quotation', { editId: selectedApplicant.id })}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 text-xs font-semibold transition-all cursor-pointer"
                                                        >
                                                            <span>Edit Quotation</span>
                                                        </button>
                                                    )}
                                                </>
                                            )}

                                            {stage.key === 'client_approval' && (
                                                <>
                                                    {selectedApplicant.workflow_status === 'approval_pending' && (
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <button
                                                                type="button"
                                                                disabled={isApproving}
                                                                onClick={() => setShowApproveConfirmModal(true)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-60"
                                                                title="Approve quotation by client and move to Approved Quotations"
                                                            >
                                                                {isApproving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                                                                <span>Approve by Client</span>
                                                            </button>
                                                            {onNavigate && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onNavigate('quotation-history')}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 text-xs font-semibold transition-all cursor-pointer"
                                                                >
                                                                    <span>Review in History</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {stage.key === 'agreement_created' && (
                                                <>
                                                    {stage.pdf_url && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setPreviewPdfUrl(stage.pdf_url);
                                                                setPreviewPdfTitle(`Agreement: ${selectedApplicant.client_name}`);
                                                            }}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-all cursor-pointer"
                                                        >
                                                            <Eye size={12} />
                                                            <span>View Agreement PDF</span>
                                                        </button>
                                                    )}
                                                    {!stage.is_completed && selectedApplicant.workflow_status === 'approved' && onNavigate && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onNavigate('agreement', { quotation: selectedApplicant })}
                                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1A4D2E] text-white hover:bg-[#143c24] text-xs font-bold transition-all cursor-pointer shadow-xs"
                                                        >
                                                            <FileSignature size={13} />
                                                            <span>Generate Agreement Now</span>
                                                        </button>
                                                    )}
                                                </>
                                            )}

                                            {stage.key === 'payment_status' && (
                                                <>
                                                    {selectedApplicant.has_agreement && onNavigate && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onNavigate('payments')}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all cursor-pointer"
                                                        >
                                                            <CreditCard size={12} />
                                                            <span>Manage Payments</span>
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Approve Confirmation Modal */}
                {showApproveConfirmModal && selectedApplicant && (
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150"
                        onClick={() => setShowApproveConfirmModal(false)}
                    >
                        <div 
                            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-100 space-y-4 animate-in zoom-in-95 duration-150"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1A4D2E] flex items-center justify-center">
                                        <CheckCircle2 size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-neutral-900">
                                            Mark as Approved by Client
                                        </h3>
                                        <p className="text-xs text-neutral-500">
                                            Quotation #{selectedApplicant.ref_no} ({selectedApplicant.client_name})
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowApproveConfirmModal(false)}
                                    className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100/80 space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-neutral-600">Client Name:</span>
                                    <span className="font-bold text-neutral-900">{selectedApplicant.client_name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-neutral-600">Plant Capacity:</span>
                                    <span className="font-semibold text-neutral-800">{selectedApplicant.capacity} ({selectedApplicant.system_type || 'On-Grid'})</span>
                                </div>
                                <div className="flex items-center justify-between border-t border-emerald-100/60 pt-2">
                                    <span className="text-neutral-600">Total Project Value:</span>
                                    <span className="font-bold text-[#1A4D2E] text-sm">₹{selectedApplicant.total_amount}</span>
                                </div>
                            </div>

                            <p className="text-xs text-neutral-500 leading-relaxed">
                                Are you sure you want to approve this quotation? Once approved, it will advance this applicant to Stage 2 (Client Approved) and redirect to the <strong>Approved Quotations</strong> page to generate an agreement.
                            </p>

                            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100">
                                <button
                                    type="button"
                                    onClick={() => setShowApproveConfirmModal(false)}
                                    className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={isApproving}
                                    onClick={() => {
                                        setShowApproveConfirmModal(false);
                                        handleApproveApplicant(selectedApplicant);
                                    }}
                                    className="px-4 py-2 rounded-xl bg-[#1A4D2E] hover:bg-[#143c24] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                                >
                                    {isApproving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                                    <span>Confirm Approval</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Embedded PDF Modal */}
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
                                    <button
                                        type="button"
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
            </div>
        );
    }

    // Default Master List View
    return (
        <div className="w-full px-4 sm:px-8 py-8 space-y-6 font-poppins max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">
                        Application Tracking
                    </h1>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                        Monitor the complete journey of every applicant across quotations, approvals, agreements, and payments.
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
                        onClick={() => loadTrackingData(true)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200/90 text-neutral-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-60"
                        title="Refresh application tracking data"
                    >
                        <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Workflow Pipeline Status Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div 
                    onClick={() => setStatusFilter(statusFilter === 'approval_pending' ? 'all' : 'approval_pending')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        statusFilter === 'approval_pending' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/20' : 'bg-white border-neutral-200/80 hover:border-amber-200'
                    }`}
                >
                    <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">1. Approval Pending</div>
                    <div className="text-xl sm:text-2xl font-bold text-amber-900 mt-1">{statusCounts.pending}</div>
                </div>
                <div 
                    onClick={() => setStatusFilter(statusFilter === 'approved' ? 'all' : 'approved')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        statusFilter === 'approved' ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/20' : 'bg-white border-neutral-200/80 hover:border-emerald-200'
                    }`}
                >
                    <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">2. Client Approved</div>
                    <div className="text-xl sm:text-2xl font-bold text-[#1A4D2E] mt-1">{statusCounts.approved}</div>
                </div>
                <div 
                    onClick={() => setStatusFilter(statusFilter === 'agreement_created' ? 'all' : 'agreement_created')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        statusFilter === 'agreement_created' ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400/20' : 'bg-white border-neutral-200/80 hover:border-blue-200'
                    }`}
                >
                    <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">3. Agreement Created</div>
                    <div className="text-xl sm:text-2xl font-bold text-blue-800 mt-1">{statusCounts.agreement}</div>
                </div>
                <div 
                    onClick={() => setStatusFilter(statusFilter === 'completed' ? 'all' : 'completed')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        statusFilter === 'completed' ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-400/20' : 'bg-white border-neutral-200/80 hover:border-purple-200'
                    }`}
                >
                    <div className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">4 & 5. Completed</div>
                    <div className="text-xl sm:text-2xl font-bold text-purple-800 mt-1">{statusCounts.completed}</div>
                </div>
                <div 
                    onClick={() => setStatusFilter(statusFilter === 'rejected' ? 'all' : 'rejected')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer col-span-2 sm:col-span-1 ${
                        statusFilter === 'rejected' ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400/20' : 'bg-white border-neutral-200/80 hover:border-rose-200'
                    }`}
                >
                    <div className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">Rejected</div>
                    <div className="text-xl sm:text-2xl font-bold text-rose-800 mt-1">{statusCounts.rejected}</div>
                </div>
            </div>

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
                                placeholder="Search applicant name, ref #, phone, address..."
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

                            {(datePreset !== 'all' || startDate || endDate || searchQuery || statusFilter !== 'all') && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl transition-all cursor-pointer ml-1"
                                >
                                    <X size={13} />
                                    <span>Reset Filters</span>
                                </button>
                            )}
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
                </div>
            )}

            {/* Applicant List Table */}
            {isLoading ? (
                <div className="bg-white rounded-3xl p-12 border border-neutral-200/80 text-center space-y-3">
                    <RefreshCw size={24} className="animate-spin text-[#1A4D2E] mx-auto" />
                    <p className="text-xs font-semibold text-neutral-500">Loading applicant tracking data...</p>
                </div>
            ) : applications.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 border border-neutral-200/80 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#1A4D2E] flex items-center justify-center mx-auto">
                        <Activity size={28} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-bold text-neutral-900">No Applicants Found</h3>
                        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                            {searchQuery || startDate || endDate || statusFilter !== 'all'
                                ? "No applications matched your active search or date filters."
                                : "No applicants are currently in the system. Create a quotation to begin tracking applicant journeys."}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xs overflow-hidden">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-neutral-50/80 border-b border-neutral-200/80 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-3 sm:px-4 text-center w-12 font-mono">#</th>
                                    <th className="py-3.5 px-4 sm:px-6">Applicant Name</th>
                                    <th className="py-3.5 px-4">Ref & Date</th>
                                    <th className="py-3.5 px-4">System Specs</th>
                                    <th className="py-3.5 px-4">Current Workflow Status</th>
                                    <th className="py-3.5 px-4">Financial Progress</th>
                                    <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {paginatedApplications.map((app, idx) => (
                                    <tr key={app.id} className="hover:bg-emerald-50/25 transition-colors group">
                                        {/* Serial */}
                                        <td className="py-4 px-3 sm:px-4 text-center font-mono text-neutral-400 text-xs font-semibold">
                                            {(currentPage - 1) * perPage + idx + 1}
                                        </td>

                                        {/* Clickable Applicant Name */}
                                        <td className="py-4 px-4 sm:px-6">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedApplicant(app)}
                                                className="text-left font-bold text-neutral-900 hover:text-[#1A4D2E] hover:underline flex items-center gap-1.5 cursor-pointer group/name"
                                            >
                                                <User size={13} className="text-emerald-700 shrink-0" />
                                                <span className="truncate max-w-[190px]">{app.client_name}</span>
                                                <ChevronRight size={13} className="text-neutral-400 opacity-0 group-hover/name:opacity-100 transition-opacity" />
                                            </button>
                                            <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                                                <Phone size={11} className="text-neutral-400 shrink-0" />
                                                <span>{app.client_phone}</span>
                                            </div>
                                            {app.client_address !== '-' && (
                                                <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5 truncate max-w-[200px]">
                                                    <MapPin size={11} className="text-neutral-400 shrink-0" />
                                                    <span className="truncate">{app.client_address}</span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Ref & Date */}
                                        <td className="py-4 px-4">
                                            <div className="font-mono font-bold text-neutral-900 text-xs">
                                                {app.ref_no}
                                            </div>
                                            <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1">
                                                <Clock size={11} />
                                                <span>{app.created_at_formatted}</span>
                                            </div>
                                        </td>

                                        {/* System Specs */}
                                        <td className="py-4 px-4">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-[#1A4D2E] font-bold text-xs">
                                                <Zap size={12} className="text-amber-500 fill-amber-500" />
                                                <span>{app.capacity}</span>
                                            </div>
                                            <div className="text-[11px] text-neutral-500 mt-1 font-medium">
                                                {app.system_type}
                                            </div>
                                        </td>

                                        {/* Current Status Pill */}
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
                                                {app.workflow_status === 'completed' && <Check size={11} />}
                                                {app.workflow_status === 'rejected' && <X size={11} />}
                                                {app.workflow_status === 'approval_pending' && <Clock size={11} />}
                                                <span>{app.workflow_status_label}</span>
                                            </span>
                                        </td>

                                        {/* Financial Progress */}
                                        <td className="py-4 px-4">
                                            <div className="font-bold text-neutral-900 text-xs">
                                                ₹{app.total_amount}
                                            </div>
                                            <div className="text-[11px] mt-0.5">
                                                <span className="text-emerald-700 font-semibold">₹{formatINR(app.amount_paid)} paid</span>
                                                {app.balance_amount > 0 && (
                                                    <span className="text-neutral-400 ml-1">(Due: ₹{formatINR(app.balance_amount)})</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Action: Track Journey */}
                                        <td className="py-4 px-4 sm:px-6 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedApplicant(app)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A4D2E] hover:bg-[#143c24] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                                                title="View detailed progress timeline"
                                            >
                                                <Activity size={13} />
                                                <span>Track Journey</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="block md:hidden p-3.5 space-y-3 bg-neutral-50/50">
                        {paginatedApplications.map((app, idx) => (
                            <div
                                key={app.id}
                                className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs space-y-3"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
                                            #{(currentPage - 1) * perPage + idx + 1}
                                        </span>
                                        <span className="font-mono font-bold text-neutral-900 text-xs">
                                            {app.ref_no}
                                        </span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
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
                                        {app.workflow_status_label}
                                    </span>
                                </div>

                                <div 
                                    onClick={() => setSelectedApplicant(app)}
                                    className="bg-neutral-50/80 rounded-xl p-2.5 space-y-1.5 text-xs cursor-pointer hover:bg-emerald-50/40 transition-colors"
                                >
                                    <div className="font-bold text-neutral-900 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <User size={13} className="text-emerald-700 shrink-0" />
                                            <span>{app.client_name}</span>
                                        </div>
                                        <ChevronRight size={14} className="text-neutral-400" />
                                    </div>
                                    <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                                        <Phone size={11} className="text-neutral-400 shrink-0" />
                                        <span>{app.client_phone}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs pt-1">
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-[#1A4D2E] font-bold text-[11px]">
                                        <Zap size={11} className="text-amber-500 fill-amber-500" />
                                        <span>{app.capacity}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-neutral-900">₹{app.total_amount}</span>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-neutral-100 flex items-center justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedApplicant(app)}
                                        className="w-full py-2.5 px-3 rounded-xl bg-[#1A4D2E] hover:bg-[#143c24] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <Activity size={14} />
                                        <span>View Complete Journey</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalItems={applications.length}
                        perPage={perPage}
                        onPageChange={setCurrentPage}
                        onPerPageChange={setPerPage}
                        itemLabel="applications"
                    />
                </div>
            )}
        </div>
    );
};
